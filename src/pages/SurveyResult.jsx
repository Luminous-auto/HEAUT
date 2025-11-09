import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const translations = {
  en: {
    result: 'Survey Result',
    completed: 'Completed on',
    yourResponses: 'Your Responses',
    aiAnalysis: 'AI Analysis',
    backToSurveys: 'Back to Surveys'
  },
  zh: {
    result: '问卷结果',
    completed: '完成于',
    yourResponses: '您的回答',
    aiAnalysis: 'AI 分析',
    backToSurveys: '返回问卷'
  }
};

export default function SurveyResultPage() {
  const [searchParams] = useSearchParams();
  const responseId = searchParams.get('id');
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

  const { data: response, isLoading } = useQuery({
    queryKey: ['surveyResponse', responseId],
    queryFn: async () => {
      const responses = await base44.entities.SurveyResponse.list();
      return responses.find(r => r.id === responseId);
    },
    enabled: !!responseId,
  });

  const t = translations[currentLanguage];

  if (isLoading || !response) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-stone-200 bg-white">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <Skeleton className="h-10 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl('Surveys')}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.backToSurveys}
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={1.5} />
            <h1 className="text-3xl font-semibold text-stone-900">
              {response.survey_title}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            <p>{t.completed} {format(new Date(response.date), 'PPp')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {response.ai_analysis && (
          <Card className="bg-stone-50 border-stone-200">
            <CardHeader>
              <CardTitle className="text-xl">{t.aiAnalysis}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                {response.ai_analysis}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t.yourResponses}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {response.responses.map((item, idx) => (
                <div key={idx} className="pb-6 border-b border-stone-100 last:border-0 last:pb-0">
                  <p className="font-medium text-stone-900 mb-2">
                    {idx + 1}. {item.question}
                  </p>
                  <p className="text-stone-700 pl-4">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}