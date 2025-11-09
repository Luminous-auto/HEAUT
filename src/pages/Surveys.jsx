
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const translations = {
  en: {
    title: 'Mental Health Surveys',
    subtitle: 'Track your wellbeing through regular assessments',
    available: 'Available Surveys',
    recent: 'Recent Responses',
    takeSurvey: 'Take Survey',
    viewResults: 'View Results',
    noSurveys: 'No surveys available yet',
    noResponses: 'No survey responses yet',
    completed: 'Completed'
  },
  zh: {
    title: '心理健康问卷',
    subtitle: '通过定期评估跟踪您的健康状况',
    available: '可用问卷',
    recent: '最近回复',
    takeSurvey: '进行问卷',
    viewResults: '查看结果',
    noSurveys: '暂无可用问卷',
    noResponses: '暂无问卷回复',
    completed: '已完成'
  }
};

export default function SurveysPage() {
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

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Surveys are shared across all users
  const { data: surveys, isLoading: isLoadingSurveys } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => base44.entities.Survey.filter({ is_active: true }),
    initialData: [],
  });

  // Survey responses are user-specific
  const { data: responses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['surveyResponses', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.SurveyResponse.filter({ created_by: user.email }, '-date');
    },
    initialData: [],
    enabled: !!user?.email,
  });

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
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">{t.available}</h2>
          {isLoadingSurveys ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-48 bg-white rounded-lg animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : surveys.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {surveys.map((survey) => (
                <Card key={survey.id} className="hover:border-stone-400 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                      {survey.title}
                    </CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-500">
                        {survey.questions?.length || 0} questions
                      </span>
                      <Link to={`${createPageUrl('TakeSurvey')}?id=${survey.id}`}>
                        <Button className="bg-stone-900 hover:bg-stone-800">
                          {t.takeSurvey}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <ClipboardList className="w-12 h-12 text-stone-400 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-stone-600">{t.noSurveys}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">{t.recent}</h2>
          {isLoadingResponses ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white rounded-lg animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : responses.length > 0 ? (
            <div className="space-y-4">
              {responses.slice(0, 5).map((response) => (
                <Card key={response.id} className="hover:border-stone-400 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                        <div>
                          <h3 className="font-semibold text-stone-900">{response.survey_title}</h3>
                          <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                            <Clock className="w-4 h-4" strokeWidth={1.5} />
                            {format(new Date(response.date), 'PPp')}
                          </div>
                        </div>
                      </div>
                      <Link to={`${createPageUrl('SurveyResult')}?id=${response.id}`}>
                        <Button variant="outline">
                          {t.viewResults}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <ClipboardList className="w-12 h-12 text-stone-400 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-stone-600">{t.noResponses}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
