import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Brain, TrendingUp, Lightbulb, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

import InsightCard from "../components/insights/InsightCard";
import AnalysisHistory from "../components/insights/AnalysisHistory";

const translations = {
  en: {
    title: 'Self Awareness Insights',
    subtitle: 'Comprehensive analysis integrating all your personal data',
    journalAnalyses: 'Journal Analyses',
    surveyResponses: 'Survey Responses',
    generateAnalysis: 'Generate Self Awareness Report',
    analyzing: 'Analyzing...',
    integratedInsights: 'Integrated Insights',
    behavioralPatterns: 'Behavioral Patterns',
    emotionalIntelligence: 'Emotional Intelligence',
    growthTrajectory: 'Growth Trajectory',
    recommendations: 'Actionable Recommendations',
    noData: 'Not enough data yet. Complete more journal entries and surveys to generate insights.',
    dataIncluded: 'Data Included'
  },
  zh: {
    title: '自我意识洞察',
    subtitle: '整合您所有个人数据的综合分析',
    journalAnalyses: '日记分析',
    surveyResponses: '问卷回复',
    generateAnalysis: '生成自我意识报告',
    analyzing: '正在分析...',
    integratedInsights: '综合洞察',
    behavioralPatterns: '行为模式',
    emotionalIntelligence: '情商',
    growthTrajectory: '成长轨迹',
    recommendations: '可行建议',
    noData: '数据不足。完成更多日记和问卷以生成洞察。',
    dataIncluded: '包含的数据'
  }
};

export default function SelfAwarenessInsightsPage() {
  const [displayedAnalysis, setDisplayedAnalysis] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          setCurrentLanguage(user.language || 'en');
        }
      } catch (error) {
        setCurrentLanguage('en');
      }
    };
    fetchLanguage();
  }, []);

  const { data: journalAnalyses } = useQuery({
    queryKey: ['personalAnalyses'],
    queryFn: () => base44.entities.PersonalAnalysis.list('-date'),
    initialData: [],
  });

  const { data: surveyResponses } = useQuery({
    queryKey: ['surveyResponsesWithAnalysis'],
    queryFn: async () => {
      const responses = await base44.entities.SurveyResponse.list('-date');
      return responses.filter(r => r.ai_analysis);
    },
    initialData: [],
  });
  
  const { data: selfAwarenessAnalyses, isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['selfAwarenessAnalyses'],
    queryFn: () => base44.entities.SelfAwarenessAnalysis.list('-date'),
    initialData: [],
  });

  useEffect(() => {
    if (selfAwarenessAnalyses && selfAwarenessAnalyses.length > 0 && !displayedAnalysis) {
      setDisplayedAnalysis(selfAwarenessAnalyses[0]);
    }
  }, [selfAwarenessAnalyses, displayedAnalysis]);

  const generateAnalysisMutation = useMutation({
    mutationFn: async () => {
      const journalData = journalAnalyses.slice(0, 5).map(a => ({
        date: a.date,
        emotional_patterns: a.emotional_patterns,
        common_themes: a.common_themes,
        growth_observations: a.growth_observations
      }));

      const surveyData = surveyResponses.slice(0, 5).map(r => ({
        date: r.date,
        survey_title: r.survey_title,
        ai_analysis: r.ai_analysis
      }));

      const prompt = `You are an expert psychologist and personal development coach. You have access to comprehensive data about a person's mental and emotional journey. IMPORTANT: Detect the language used in the data and respond in that EXACT same language. If the data is primarily in Chinese, respond in Chinese. If in English, respond in English.

**Journal AI Analyses:**
${JSON.stringify(journalData, null, 2)}

**Survey Results with AI Analysis:**
${JSON.stringify(surveyData, null, 2)}

Please provide a comprehensive self-awareness analysis that integrates insights from both data sources. Structure your response as follows:

1. **Integrated Insights**: Synthesize patterns and themes across journal entries and surveys. What does the complete picture reveal about this person?

2. **Behavioral Patterns**: Identify consistent behavioral patterns, triggers, and responses across different contexts.

3. **Emotional Intelligence**: Assess their emotional awareness, self-regulation, and growth in understanding their emotions.

4. **Growth Trajectory**: Analyze their personal development journey - what progress have they made? What areas show growth?

5. **Actionable Recommendations**: Provide 3-5 specific, practical recommendations for continued personal development and self-awareness.

Be insightful, empathetic, and constructive. Focus on growth and self-understanding.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            integrated_insights: { type: "string" },
            behavioral_patterns: { type: "string" },
            emotional_intelligence: { type: "string" },
            growth_trajectory: { type: "string" },
            actionable_recommendations: { type: "string" }
          }
        }
      });
      
      const newAnalysis = { 
        ...result, 
        date: new Date().toISOString().split('T')[0],
        journal_analyses_count: journalAnalyses.length,
        survey_responses_count: surveyResponses.length
      };
      
      return base44.entities.SelfAwarenessAnalysis.create(newAnalysis);
    },
    onSuccess: (newAnalysisRecord) => {
      queryClient.invalidateQueries({ queryKey: ['selfAwarenessAnalyses'] });
      setDisplayedAnalysis(newAnalysisRecord);
    },
    onError: (error) => {
      console.error("Error generating self-awareness insights:", error);
    }
  });

  const t = translations[currentLanguage];
  const hasEnoughData = journalAnalyses.length > 0 || surveyResponses.length > 0;

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
            {t.title}
          </h1>
          <p className="text-stone-600">
            {t.subtitle}
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
              <Brain className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              <h3 className="font-medium text-stone-700">{t.journalAnalyses}</h3>
            </div>
            <p className="text-4xl font-semibold text-stone-900">{journalAnalyses.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              <h3 className="font-medium text-stone-700">{t.surveyResponses}</h3>
            </div>
            <p className="text-4xl font-semibold text-stone-900">{surveyResponses.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              <h3 className="font-medium text-stone-700">{t.dataIncluded}</h3>
            </div>
            <p className="text-4xl font-semibold text-stone-900">
              {journalAnalyses.length + surveyResponses.length}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <div className="bg-white rounded-lg border border-stone-200 p-8 mb-8 text-center">
                  <Brain className="w-12 h-12 text-stone-400 mx-auto mb-4" strokeWidth={1.5} />
                  <h2 className="text-2xl font-semibold text-stone-900 mb-2">
                    {t.title}
                  </h2>
                  <p className="text-stone-600 mb-6 max-w-xl mx-auto">
                    {t.subtitle}
                  </p>
                  
                  {!hasEnoughData ? (
                    <p className="text-stone-500 italic">{t.noData}</p>
                  ) : (
                    <Button
                      onClick={() => generateAnalysisMutation.mutate()}
                      disabled={generateAnalysisMutation.isPending}
                      className="h-11 px-8 bg-stone-900 hover:bg-stone-800"
                    >
                      {generateAnalysisMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.analyzing}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          {t.generateAnalysis}
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                {displayedAnalysis && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <InsightCard
                        title={t.integratedInsights}
                        icon={Brain}
                        content={displayedAnalysis.integrated_insights}
                      />
                    </div>
                    <InsightCard
                      title={t.behavioralPatterns}
                      icon={TrendingUp}
                      content={displayedAnalysis.behavioral_patterns}
                    />
                    <InsightCard
                      title={t.emotionalIntelligence}
                      icon={Zap}
                      content={displayedAnalysis.emotional_intelligence}
                    />
                    <InsightCard
                      title={t.growthTrajectory}
                      icon={Sparkles}
                      content={displayedAnalysis.growth_trajectory}
                    />
                    <InsightCard
                      title={t.recommendations}
                      icon={Target}
                      content={displayedAnalysis.actionable_recommendations}
                    />
                  </div>
                )}
            </div>
            <div className="md:col-span-1">
                <AnalysisHistory 
                    analyses={selfAwarenessAnalyses}
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