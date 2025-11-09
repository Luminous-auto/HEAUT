
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, TrendingUp, Heart, Calendar, MessageSquare, ClipboardList, Users } from "lucide-react";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import MoodChart from "../components/insights/MoodChart";
import InsightCard from "../components/insights/InsightCard";
import AnalysisHistory from "../components/insights/AnalysisHistory";

export default function MentalHealthInsightsPage() {
  const [displayedAnalysis, setDisplayedAnalysis] = useState(null);
  const queryClient = useQueryClient();

  // New query to fetch the current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: entries } = useQuery({
    queryKey: ['entries', user?.email], // Add user email to query key
    queryFn: async () => {
      if (!user?.email) return []; // Only fetch if user email is available
      return base44.entities.DiaryEntry.filter({ created_by: user.email }, "-date"); // Filter by created_by
    },
    initialData: [],
    enabled: !!user?.email, // Enable query only when user email is available
  });
  
  const { data: analyses, isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['personalAnalyses', user?.email], // Add user email to query key
    queryFn: async () => {
      if (!user?.email) return []; // Only fetch if user email is available
      return base44.entities.PersonalAnalysis.filter({ created_by: user.email }, '-date'); // Filter by created_by
    },
    initialData: [],
    enabled: !!user?.email, // Enable query only when user email is available
  });

  // New query for survey responses with AI analysis
  const { data: surveyResponses } = useQuery({
    queryKey: ['surveyResponsesWithAnalysis', user?.email], // Add user email to query key
    queryFn: async () => {
      if (!user?.email) return []; // Only fetch if user email is available
      const responses = await base44.entities.SurveyResponse.filter({ created_by: user.email }, '-date'); // Filter by created_by
      // Filter for responses that have an AI analysis
      return responses.filter(r => r.ai_analysis);
    },
    initialData: [],
    enabled: !!user?.email, // Enable query only when user email is available
  });

  useEffect(() => {
    // Set the latest analysis as the displayed one if none is selected yet
    if (analyses && analyses.length > 0 && !displayedAnalysis) {
      setDisplayedAnalysis(analyses[0]);
    }
  }, [analyses, displayedAnalysis]);

  const generateAnalysisMutation = useMutation({
    mutationFn: async () => {
      const entriesForAnalysis = entries.slice(0, 30).map(e => ({
        date: e.date,
        mood: e.mood,
        content_preview: e.content?.substring(0, 300),
        tags: e.tags
      }));

      const prompt = `Analyze these diary entries and provide insights:\n\n${JSON.stringify(entriesForAnalysis, null, 2)}\n\nProvide a thoughtful analysis covering:\n1. Emotional patterns and trends\n2. Common themes or topics\n3. Personal growth observations\n4. Recommendations for well-being\n\nBe empathetic, insightful, and encouraging. Structure your response in clear sections.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            emotional_patterns: { type: "string" },
            common_themes: { type: "string" },
            growth_observations: { type: "string" },
            recommendations: { type: "string" }
          }
        }
      });
      
      const newAnalysis = {
        ...result,
        date: new Date().toISOString().split('T')[0] // Store current date for the analysis
      };
      
      // Save the generated analysis to the database
      return base44.entities.PersonalAnalysis.create(newAnalysis);
    },
    onSuccess: (newAnalysisRecord) => {
      // Invalidate the 'personalAnalyses' query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['personalAnalyses'] });
      // Set the newly generated analysis as the currently displayed one
      setDisplayedAnalysis(newAnalysisRecord);
    },
    onError: (error) => {
      console.error("Error generating insights:", error);
    }
  });

  const getMoodDistribution = () => {
    const distribution = {};
    entries.forEach(entry => {
      if (entry.mood) {
        distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
      }
    });
    // Sort moods by count in descending order
    return Object.entries(distribution)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
            Mental Health Insights
          </h1>
          <p className="text-stone-600">
            Understand your patterns and growth
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-6 py-8"
      >
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              <h3 className="font-medium text-stone-700">Total Entries</h3>
            </div>
            <p className="text-4xl font-semibold text-stone-900">{entries.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              <h3 className="font-medium text-stone-700">Current Streak</h3>
            </div>
            <p className="text-4xl font-semibold text-stone-900">
              {entries.length > 0 ? Math.min(entries.length, 7) : 0}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              <h3 className="font-medium text-stone-700">Top Mood</h3>
            </div>
            <p className="text-2xl font-semibold text-stone-900 capitalize">
              {getMoodDistribution()[0]?.mood || "—"}
            </p>
          </div>
        </div>

        <MoodChart entries={entries} />

        <Card className="mb-8 bg-gradient-to-br from-stone-50 to-white border-stone-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              Need Human Support?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-stone-600 mb-4">
              While AI insights are helpful, sometimes talking to a real person makes all the difference. 
              Connect with counselors, social workers, writers, and peer supporters who are here to help.
            </p>
            <Link to={createPageUrl('HumanSupport')}>
              <Button className="bg-stone-900 hover:bg-stone-800">
                <Heart className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Connect with Helpers
              </Button>
            </Link>
          </CardContent>
        </Card>

        {surveyResponses.length > 0 && (
          <Card className="mb-8 bg-stone-50 border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                Survey Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {surveyResponses.slice(0, 3).map((response) => (
                <div key={response.id} className="bg-white p-4 rounded-lg border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-stone-900">{response.survey_title}</h3>
                    <span className="text-xs text-stone-500">
                      {format(new Date(response.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 line-clamp-3">
                    {response.ai_analysis}
                  </p>
                  <Link to={`${createPageUrl('SurveyResult')}?id=${response.id}`}>
                    <Button variant="link" className="p-0 h-auto text-stone-600 hover:text-stone-900 mt-2">
                      View full analysis →
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <div className="bg-white rounded-lg border border-stone-200 p-8 mb-8 text-center">
                  <Sparkles className="w-12 h-12 text-stone-400 mx-auto mb-4" strokeWidth={1.5} />
                  <h2 className="text-2xl font-semibold text-stone-900 mb-2">
                    Personal Analysis
                  </h2>
                  <p className="text-stone-600 mb-6 max-w-xl mx-auto">
                    Get AI-powered insights about your emotional patterns and personal growth
                  </p>
                  
                  <Button
                      onClick={() => generateAnalysisMutation.mutate()}
                      disabled={generateAnalysisMutation.isPending || entries.length === 0}
                      className="h-11 px-8 bg-stone-900 hover:bg-stone-800"
                    >
                      {generateAnalysisMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Generate New Analysis
                        </>
                      )}
                    </Button>
                </div>
                
                {displayedAnalysis && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <InsightCard
                      title="Emotional Patterns"
                      icon={TrendingUp}
                      content={displayedAnalysis.emotional_patterns}
                    />
                    <InsightCard
                      title="Common Themes"
                      icon={MessageSquare}
                      content={displayedAnalysis.common_themes}
                    />
                    <InsightCard
                      title="Growth Observations"
                      icon={Sparkles}
                      content={displayedAnalysis.growth_observations}
                    />
                    <InsightCard
                      title="Recommendations"
                      icon={Heart}
                      content={displayedAnalysis.recommendations}
                    />
                  </div>
                )}
            </div>
            <div className="md:col-span-1">
                <AnalysisHistory 
                    analyses={analyses}
                    onSelectAnalysis={setDisplayedAnalysis}
                    selectedAnalysisId={displayedAnalysis?.id}
                    isLoading={isLoadingAnalyses}
                />
            </div>
        </div>
      </motion.div>
    </div>
  );
}
