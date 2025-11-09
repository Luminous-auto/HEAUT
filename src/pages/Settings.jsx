
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings as SettingsIcon, Globe, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Skeleton } from '@/components/ui/skeleton';

const translations = {
  en: {
    title: 'Settings',
    subtitle: 'Manage your application preferences and settings.',
    languageTitle: 'Language Preference',
    languageDesc: 'Choose your preferred language for the application interface.',
    saved: 'Saved!',
    note: 'Note: Full translation support coming soon. Currently sets your preference for future updates.'
  },
  zh: {
    title: '设置',
    subtitle: '管理您的应用程序偏好和设置。',
    languageTitle: '语言偏好',
    languageDesc: '选择您的应用程序界面首选语言。',
    saved: '已保存！',
    note: '注意：完整翻译支持即将推出。目前设置您的偏好以供将来更新。'
  }
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (user) {
      setCurrentLanguage(user.language || 'en');
    }
  }, [user]);

  const updateLanguageMutation = useMutation({
    mutationFn: (language) => base44.auth.updateMe({ language }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    },
  });

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    updateLanguageMutation.mutate(newLanguage);
  };

  const t = translations[currentLanguage];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-stone-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
              {t.languageTitle}
            </CardTitle>
            <CardDescription>
              {t.languageDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <LanguageSwitcher 
                currentLanguage={currentLanguage} 
                onLanguageChange={handleLanguageChange}
              />
              {isSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.saved}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-stone-500 mt-4">
              {t.note}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
