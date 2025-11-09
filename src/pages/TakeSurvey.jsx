import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const translations = {
  en: {
    loading: 'Loading survey...',
    previous: 'Previous',
    next: 'Next',
    submit: 'Submit & Analyze',
    submitting: 'Submitting...',
    question: 'Question',
    of: 'of'
  },
  zh: {
    loading: '正在加载问卷...',
    previous: '上一题',
    next: '下一题',
    submit: '提交并分析',
    submitting: '正在提交...',
    question: '问题',
    of: '共'
  }
};

export default function TakeSurveyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const surveyId = searchParams.get('id');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
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

  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      const surveys = await base44.entities.Survey.list();
      return surveys.find(s => s.id === surveyId);
    },
    enabled: !!surveyId,
  });

  const submitSurveyMutation = useMutation({
    mutationFn: async () => {
      const responses = survey.questions.map((q, idx) => ({
        question: q.question,
        answer: answers[idx] || ''
      }));

      const responseData = {
        survey_id: survey.id,
        survey_title: survey.title,
        responses,
        date: new Date().toISOString()
      };

      const savedResponse = await base44.entities.SurveyResponse.create(responseData);

      // Generate AI analysis
      const analysisPrompt = `You are a mental health professional analyzing survey responses. IMPORTANT: Detect the language of the questions and respond in that EXACT same language. If questions are in Chinese, respond in Chinese. If in English, respond in English.

Survey: ${survey.title}
${survey.description}

Responses:
${responses.map((r, i) => `Q${i + 1}: ${r.question}\nA: ${r.answer}`).join('\n\n')}

Provide a thoughtful, empathetic analysis covering:
1. Key observations about their mental health state
2. Patterns or concerns identified
3. Positive aspects noted
4. Gentle recommendations for wellbeing

Be professional but warm and encouraging.`;

      const analysis = await base44.integrations.Core.InvokeLLM({ prompt: analysisPrompt });
      
      await base44.entities.SurveyResponse.update(savedResponse.id, { ai_analysis: analysis });

      return savedResponse.id;
    },
    onSuccess: (responseId) => {
      queryClient.invalidateQueries({ queryKey: ['surveyResponses'] });
      navigate(`${createPageUrl('SurveyResult')}?id=${responseId}`);
    },
  });

  const t = translations[currentLanguage];

  if (isLoading || !survey) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-stone-200 bg-white">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <Skeleton className="h-10 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;
  const canProceed = answers[currentQuestionIndex] !== undefined && answers[currentQuestionIndex] !== '';

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold text-stone-900 mb-2">
            {survey.title}
          </h1>
          <p className="text-stone-600">{survey.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between text-sm text-stone-600">
          <span>{t.question} {currentQuestionIndex + 1} {t.of} {survey.questions.length}</span>
          <div className="flex gap-1">
            {survey.questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full ${
                  answers[idx] !== undefined ? 'bg-stone-900' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === 'multiple_choice' && (
              <RadioGroup
                value={answers[currentQuestionIndex]}
                onValueChange={(value) => setAnswers({ ...answers, [currentQuestionIndex]: value })}
              >
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-stone-50">
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === 'scale' && (
              <RadioGroup
                value={answers[currentQuestionIndex]}
                onValueChange={(value) => setAnswers({ ...answers, [currentQuestionIndex]: value })}
              >
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <div key={num} className="flex flex-col items-center">
                      <RadioGroupItem value={String(num)} id={`scale-${num}`} />
                      <Label htmlFor={`scale-${num}`} className="mt-2 text-sm cursor-pointer">
                        {num}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === 'text' && (
              <Textarea
                value={answers[currentQuestionIndex] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQuestionIndex]: e.target.value })}
                placeholder="Type your answer here..."
                className="min-h-[150px]"
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.previous}
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={() => submitSurveyMutation.mutate()}
              disabled={!canProceed || submitSurveyMutation.isPending}
              className="bg-stone-900 hover:bg-stone-800"
            >
              {submitSurveyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={!canProceed}
              className="bg-stone-900 hover:bg-stone-800"
            >
              {t.next}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}