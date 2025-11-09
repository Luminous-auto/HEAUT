import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Heart, Wand2, ArrowRight, Brain, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const translations = {
  en: {
    title: 'Explore Your Insights',
    subtitle: 'Choose an area to analyze and uncover patterns.',
    mentalHealth: 'Mental Health',
    mentalHealthDesc: 'Analyze your journal entries to understand emotional patterns, track your mood, and receive recommendations for well-being.',
    creativity: 'Creativity',
    creativityDesc: 'Analyze your creative works to get feedback on writing style, identify recurring themes, and discover your unique voice.',
    selfAwareness: 'Self Awareness',
    selfAwarenessDesc: 'Get a comprehensive analysis that integrates your journal insights and survey results for deeper self-understanding.',
    soulMate: 'Soul Mate',
    soulMateDesc: 'Connect with compatible souls based on AI analysis of your personality, values, and emotional patterns.'
  },
  zh: {
    title: '探索您的洞察',
    subtitle: '选择一个领域进行分析并发现模式。',
    mentalHealth: '心理健康',
    mentalHealthDesc: '分析您的日记条目以了解情绪模式、跟踪您的心情并获得健康建议。',
    creativity: '创造力',
    creativityDesc: '分析您的创意作品以获取写作风格反馈、识别重复主题并发现您独特的声音。',
    selfAwareness: '自我意识',
    selfAwarenessDesc: '获得综合分析，整合您的日记洞察和问卷结果，以获得更深入的自我理解。',
    soulMate: '灵魂伴侣',
    soulMateDesc: '基于您的性格、价值观和情感模式的AI分析，与志同道合的灵魂建立联系。'
  }
};

const InsightOption = ({ title, description, icon: Icon, href }) => (
  <Link to={href} className="block group">
    <Card className="h-full bg-white hover:border-stone-400 transition-colors border-stone-200 shadow-sm hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-stone-900">
            <Icon className="w-6 h-6 text-stone-600" strokeWidth={1.5} />
            {title}
          </CardTitle>
          <ArrowRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  </Link>
);

export default function InsightsHubPage() {
  const [currentLanguage, setCurrentLanguage] = useState('en');

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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <InsightOption
            title={t.mentalHealth}
            description={t.mentalHealthDesc}
            icon={Heart}
            href={createPageUrl('MentalHealthInsights')}
          />
          <InsightOption
            title={t.creativity}
            description={t.creativityDesc}
            icon={Wand2}
            href={createPageUrl('CreativityInsights')}
          />
          <InsightOption
            title={t.selfAwareness}
            description={t.selfAwarenessDesc}
            icon={Brain}
            href={createPageUrl('SelfAwarenessInsights')}
          />
          <InsightOption
            title={t.soulMate}
            description={t.soulMateDesc}
            icon={Users}
            href={createPageUrl('SoulMate')}
          />
        </div>
      </div>
    </div>
  );
}