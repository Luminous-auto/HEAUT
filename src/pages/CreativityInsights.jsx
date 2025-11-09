
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, Brush, Feather, Trophy, Target, Heart, Zap, FileText, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { countBy } from 'lodash';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import InsightCard from "../components/insights/InsightCard";

export default function CreativityInsightsPage() {
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterGenre, setFilterGenre] = useState('all');

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

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: works } = useQuery({
    queryKey: ['creativeWorks', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.CreativeWork.filter({ created_by: user.email }, "-updated_date");
    },
    initialData: [],
    enabled: !!user?.email,
  });

  const worksWithAnalysis = works.filter(w => w.literary_analysis);
  
  // Filter and sort works
  const filteredAndSortedWorks = worksWithAnalysis
    .filter(work => {
      const matchesSearch = !searchQuery || 
        work.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.content?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = filterGenre === 'all' || work.work_type === filterGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.literary_analysis.analysis_date) - new Date(a.literary_analysis.analysis_date);
        case 'score':
          return b.literary_analysis.overall_score - a.literary_analysis.overall_score;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  
  useEffect(() => {
    if (filteredAndSortedWorks.length > 0 && !selectedWorkId) {
      setSelectedWorkId(filteredAndSortedWorks[0].id);
    }
  }, [filteredAndSortedWorks, selectedWorkId]);

  const selectedWork = filteredAndSortedWorks.find(w => w.id === selectedWorkId);

  const getAverageScore = () => {
    if (worksWithAnalysis.length === 0) return 0;
    const sum = worksWithAnalysis.reduce((acc, w) => acc + (w.literary_analysis?.overall_score || 0), 0);
    return (sum / worksWithAnalysis.length).toFixed(1);
  };

  const getTopWorkType = () => {
    if (works.length === 0) return "—";
    const counts = countBy(works, 'work_type');
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const genres = ['all', ...new Set(works.map(w => w.work_type))];

  const translations = {
    en: {
      title: 'Creativity Insights',
      subtitle: 'Analyze your writing and discover your unique voice.',
      totalWorks: 'Total Works',
      primaryGenre: 'Primary Genre',
      avgRanking: 'Avg. Ranking',
      selectWork: 'Your Works',
      noAnalysis: 'No analyzed works yet. Use "Save & Analyze" in the editor.',
      styleAnalysis: 'Style Analysis',
      thematicAnalysis: 'Thematic Analysis',
      strengths: 'Key Strengths',
      suggestions: 'Suggestions',
      qualityMetrics: 'Writing Quality Metrics',
      technicalMastery: 'Technical Mastery',
      emotionalResonance: 'Emotional Resonance',
      originalityVoice: 'Originality & Voice',
      narrativeCoherence: 'Narrative Coherence',
      searchPlaceholder: 'Search works...',
      sortBy: 'Sort by',
      filterGenre: 'Filter by genre',
      sortDate: 'Date',
      sortScore: 'Score',
      sortTitle: 'Title',
      allGenres: 'All Genres'
    },
    zh: {
      title: '创造力洞察',
      subtitle: '分析您的写作并发现您独特的声音。',
      totalWorks: '作品总数',
      primaryGenre: '主要类型',
      avgRanking: '平均评分',
      selectWork: '您的作品',
      noAnalysis: '尚无已分析的作品。在编辑器中使用"保存并分析"。',
      styleAnalysis: '风格分析',
      thematicAnalysis: '主题分析',
      strengths: '主要优势',
      suggestions: '改进建议',
      qualityMetrics: '写作质量指标',
      technicalMastery: '技术掌握',
      emotionalResonance: '情感共鸣',
      originalityVoice: '原创性与声音',
      narrativeCoherence: '叙事连贯性',
      searchPlaceholder: '搜索作品...',
      sortBy: '排序方式',
      filterGenre: '按类型筛选',
      sortDate: '日期',
      sortScore: '评分',
      sortTitle: '标题',
      allGenres: '所有类型'
    }
  };

  const t = translations[currentLanguage];

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
              <Feather className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              <h3 className="font-medium text-stone-700">{t.totalWorks}</h3>
            </div>
            <p className="text-4xl font-semibold text-stone-900">{works.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Brush className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              <h3 className="font-medium text-stone-700">{t.primaryGenre}</h3>
            </div>
            <p className="text-2xl font-semibold text-stone-900 capitalize">
              {getTopWorkType()}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              <h3 className="font-medium text-stone-700">{t.avgRanking}</h3>
            </div>
            <p className="text-4xl font-semibold text-stone-900">
              {getAverageScore()}/10
            </p>
            <p className="text-xs text-stone-500">
              {worksWithAnalysis.length} {worksWithAnalysis.length === 1 ? 'work' : 'works'} analyzed
            </p>
          </div>
        </div>

        {worksWithAnalysis.length === 0 ? (
          <div className="bg-white rounded-lg border border-stone-200 p-12 text-center">
            <Sparkles className="w-12 h-12 text-stone-400 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-2xl font-semibold text-stone-900 mb-2">
              {t.noAnalysis}
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {selectedWork && selectedWork.literary_analysis && (
                <>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <InsightCard
                      title={t.styleAnalysis}
                      icon={Brush}
                      content={selectedWork.literary_analysis.style_analysis}
                    />
                    <InsightCard
                      title={t.thematicAnalysis}
                      icon={Feather}
                      content={selectedWork.literary_analysis.thematic_analysis}
                    />
                    <InsightCard
                      title={t.strengths}
                      icon={Trophy}
                      content={selectedWork.literary_analysis.strengths}
                    />
                    <InsightCard
                      title={t.suggestions}
                      icon={TrendingUp}
                      content={selectedWork.literary_analysis.suggestions}
                    />
                  </div>

                  <div className="bg-white rounded-lg border border-stone-200 p-6">
                    <h3 className="text-xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" strokeWidth={1.5} />
                      {t.qualityMetrics}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                          <span className="font-medium text-stone-700">{t.technicalMastery}</span>
                        </div>
                        <span className="text-2xl font-semibold text-stone-900">
                          {selectedWork.literary_analysis.technical_mastery}/10
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                          <span className="font-medium text-stone-700">{t.emotionalResonance}</span>
                        </div>
                        <span className="text-2xl font-semibold text-stone-900">
                          {selectedWork.literary_analysis.emotional_resonance}/10
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                          <span className="font-medium text-stone-700">{t.originalityVoice}</span>
                        </div>
                        <span className="text-2xl font-semibold text-stone-900">
                          {selectedWork.literary_analysis.originality_voice}/10
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                          <span className="font-medium text-stone-700">{t.narrativeCoherence}</span>
                        </div>
                        <span className="text-2xl font-semibold text-stone-900">
                          {selectedWork.literary_analysis.narrative_coherence}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white border-stone-200 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-stone-900">{t.selectWork}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={1.5} />
                    <Input
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 border-stone-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-10 border-stone-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">{t.sortDate}</SelectItem>
                        <SelectItem value="score">{t.sortScore}</SelectItem>
                        <SelectItem value="title">{t.sortTitle}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterGenre} onValueChange={setFilterGenre}>
                      <SelectTrigger className="h-10 border-stone-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allGenres}</SelectItem>
                        {genres.filter(g => g !== 'all').map(genre => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto space-y-2">
                    {filteredAndSortedWorks.map(work => (
                      <Button
                        key={work.id}
                        variant={selectedWorkId === work.id ? 'default' : 'ghost'}
                        onClick={() => setSelectedWorkId(work.id)}
                        className={`w-full justify-start h-auto py-3 px-3 ${
                          selectedWorkId === work.id 
                            ? "bg-stone-900 hover:bg-stone-800 text-white"
                            : "hover:bg-stone-100 text-stone-700"
                        }`}
                      >
                        <div className="flex flex-col items-start w-full">
                          <span className="font-medium text-sm truncate w-full">
                            {work.title}
                          </span>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className="text-stone-400">{work.work_type}</span>
                            <span className="font-semibold">
                              {work.literary_analysis.overall_score}/10
                            </span>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
