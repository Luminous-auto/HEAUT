
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenLine, Book, ArrowRight, Feather, Wand2, LogIn, UserPlus, LogOut, Info, Shield, Mail, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import LanguageSwitcher from '../components/LanguageSwitcher';

const translations = {
  en: {
    welcome: 'Welcome to HEAUT',
    subtitle: 'A personal space for reflection, creation, and growth.',
    writeTitle: 'Write',
    writeDesc: 'Engage in self-reflection through text or voice. Express your thoughts and feelings in a private, secure journal.',
    readTitle: 'Read',
    readDesc: 'Explore a curated library of texts and prompts designed to inspire introspection and personal discovery. (Coming Soon)',
    continue: 'Continue',
    ready: 'Ready to start your journey?',
    register: 'Register',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    journal: 'Journal',
    journalDesc: 'Personal reflection and daily thoughts',
    create: 'Create',
    createDesc: 'Creative writing and storytelling',
    getStarted: 'Get Started',
    loginPrompt: 'Already have an account?',
    newUserGuide: 'New User Guide',
    guideStep1: 'Click "Register" to create your free account',
    guideStep2: 'Complete the security verification (Cloudflare) - this protects everyone',
    guideStep3: 'Check your email (and spam folder) for the verification link',
    guideStep4: 'Set your password and start your journey',
    havingTrouble: 'Having trouble? Make sure to check your spam folder, or contact support if the issue persists.'
  },
  zh: {
    welcome: '欢迎来到 HEAUT',
    subtitle: '一个用于反思、创造和成长的个人空间。',
    writeTitle: '写作',
    writeDesc: '通过文字或语音进行自我反思。在私密、安全的日记中表达您的想法和感受。',
    readTitle: '阅读',
    readDesc: '探索精选的文本和提示库，旨在激发内省和个人发现。（即将推出）',
    continue: '继续',
    ready: '准备开始您的旅程了吗？',
    register: '注册',
    signIn: '登录',
    signOut: '登出',
    journal: '日记',
    journalDesc: '个人反思和日常想法',
    create: '创作',
    createDesc: '创意写作和故事讲述',
    getStarted: '开始使用',
    loginPrompt: '已有账户？',
    newUserGuide: '新用户指南',
    guideStep1: '点击"注册"创建您的免费账户',
    guideStep2: '完成安全验证（Cloudflare）- 这是为了保护所有人',
    guideStep3: '检查您的电子邮件（和垃圾邮件文件夹）以获取验证链接',
    guideStep4: '设置您的密码并开始您的旅程',
    havingTrouble: '遇到问题？请确保检查您的垃圾邮件文件夹，如果问题仍然存在，请联系支持。'
  }
};

const WriteCard = ({ t }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="h-full bg-white hover:border-stone-400 hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <CardContent className="p-8 flex flex-col items-start h-full">
        <div className="mb-6 w-14 h-14 rounded-full flex items-center justify-center bg-stone-100">
          <PenLine className="w-7 h-7 text-stone-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-stone-900">{t.writeTitle}</h2>
        <p className="flex-grow text-stone-600 mb-6">{t.writeDesc}</p>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-3 overflow-hidden"
            >
              <Link to={createPageUrl('Journal')} className="block group">
                <div className="flex items-center justify-between p-4 rounded-lg border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all">
                  <div className="flex items-center gap-3">
                    <Feather className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-semibold text-stone-900">{t.journal}</h3>
                      <p className="text-sm text-stone-600">{t.journalDesc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link to={createPageUrl('Creations')} className="block group">
                <div className="flex items-center justify-between p-4 rounded-lg border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all">
                  <div className="flex items-center gap-3">
                    <Wand2 className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-semibold text-stone-900">{t.create}</h3>
                      <p className="text-sm text-stone-600">{t.createDesc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

const ActionCard = ({ href, icon: Icon, title, description, continueText, disabled = false }) => {
  const cardContent = (
    <Card className={`h-full transition-all duration-300 ${disabled ? 'bg-stone-50 border-stone-200' : 'bg-white hover:border-stone-400 hover:shadow-lg'}`}>
      <CardContent className="p-8 flex flex-col items-start h-full">
        <div className={`mb-6 w-14 h-14 rounded-full flex items-center justify-center ${disabled ? 'bg-stone-200' : 'bg-stone-100'}`}>
          <Icon className={`w-7 h-7 ${disabled ? 'text-stone-400' : 'text-stone-600'}`} strokeWidth={1.5} />
        </div>
        <h2 className={`text-2xl font-semibold mb-2 ${disabled ? 'text-stone-500' : 'text-stone-900'}`}>{title}</h2>
        <p className={`flex-grow ${disabled ? 'text-stone-400' : 'text-stone-600'}`}>{description}</p>
        {!disabled && (
          <div className="mt-6 flex items-center gap-2 text-stone-900 font-medium group-hover:text-stone-700">
            {continueText} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (disabled) {
    return cardContent;
  }

  return (
    <Link to={href} className="block group h-full">
      {cardContent}
    </Link>
  );
};

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const checkAuth = async () => {
        try {
          const authStatus = await base44.auth.isAuthenticated();
          setIsAuthenticated(authStatus);
          
          if (authStatus) {
            try {
              const user = await base44.auth.me();
              setCurrentLanguage(user.language || 'en');
            } catch (error) {
              console.error('Error fetching user data for authenticated user, defaulting language:', error);
              setCurrentLanguage('en');
            }
          } else {
            setCurrentLanguage('en');
          }
        } catch (error) {
          console.error('Error checking authentication status, assuming not authenticated:', error);
          setIsAuthenticated(false);
          setCurrentLanguage('en');
        }
    };
    checkAuth();
  }, []);

  const handleLanguageChange = async (newLanguage) => {
    setCurrentLanguage(newLanguage);
    if (isAuthenticated) {
      try {
        await base44.auth.updateMe({ language: newLanguage });
      } catch (error) {
        console.error('Error updating user language on server:', error);
      }
    }
  };

  const handleAuthRedirect = () => {
    base44.auth.redirectToLogin();
  };

  const handleSignOut = () => {
    base44.auth.logout();
  };

  const t = translations[currentLanguage];

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-semibold text-stone-900 mb-4"
          >
            {t.welcome}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-stone-600 max-w-2xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8"
        >
          {isAuthenticated ? (
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="h-10 px-6 border-stone-300 hover:bg-stone-50"
            >
              <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
              {t.signOut}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAuthRedirect}
                variant="outline"
                className="h-10 px-6 border-stone-300 hover:bg-stone-50"
              >
                <LogIn className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {t.signIn}
              </Button>
              <Button
                onClick={handleAuthRedirect}
                className="h-10 px-6 bg-stone-900 hover:bg-stone-800"
              >
                <UserPlus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {t.register}
              </Button>
            </div>
          )}
          
          <LanguageSwitcher 
            currentLanguage={currentLanguage} 
            onLanguageChange={handleLanguageChange}
          />
        </motion.div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-8"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-3 text-lg">
                      {t.newUserGuide}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          1
                        </div>
                        <p className="text-blue-800 pt-0.5">{t.guideStep1}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          <Shield className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <p className="text-blue-800 pt-0.5">{t.guideStep2}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          <Mail className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <p className="text-blue-800 pt-0.5">{t.guideStep3}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <p className="text-blue-800 pt-0.5">{t.guideStep4}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm text-blue-700 italic">
                        💡 {t.havingTrouble}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.3 }}
            >
                <WriteCard t={t} />
            </motion.div>
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.4 }}
            >
                <ActionCard
                    href="#"
                    icon={Book}
                    title={t.readTitle}
                    description={t.readDesc}
                    continueText={t.continue}
                    disabled
                />
            </motion.div>
        </div>
      </div>
    </div>
  );
}
