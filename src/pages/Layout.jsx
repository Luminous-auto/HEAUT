

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Feather, Sparkles, Coins, Wand2, User, Settings, Gift, ArrowLeft, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const translations = {
  en: {
    appName: 'HEAUT',
    tagline: 'Your Personal Space',
    journal: 'Journal',
    create: 'Create',
    insights: 'AI Insights',
    tokens: 'Tokens',
    settings: 'Settings',
    profile: 'Profile',
    refer: 'Refer a Friend',
    humanSupport: 'Human Support',
    back: 'Back'
  },
  zh: {
    appName: 'HEAUT',
    tagline: '您的个人空间',
    journal: '日记',
    create: '创作',
    insights: 'AI 洞察',
    tokens: '代币',
    settings: '设置',
    profile: '个人资料',
    refer: '推荐好友',
    humanSupport: '人工支持',
    back: '返回'
  }
};

// Define page hierarchy - maps each page to its parent
const pageHierarchy = {
  'Journal': 'Home',
  'TextEntry': 'Journal',
  'Entries': 'Journal',
  'Creations': 'Home',
  'CreativeEditor': 'Creations',
  'Insights': 'Home',
  'MentalHealthInsights': 'Insights',
  'CreativityInsights': 'Insights',
  'SelfAwarenessInsights': 'Insights',
  'SoulMate': 'Insights',
  'Surveys': 'Journal',
  'TakeSurvey': 'Surveys',
  'SurveyResult': 'Surveys',
  'Tokens': 'Home',
  'Settings': 'Home',
  'Profile': 'Home',
  'Refer': 'Home',
  'HumanSupport': 'Home'
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
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
        // Silently fail and use default language
        setCurrentLanguage('en');
      }
    };
    fetchLanguage();
  }, [location.pathname]); // Re-fetch when page changes

  const t = translations[currentLanguage];

  const navigationItems = [
    {
      title: t.journal,
      url: createPageUrl("Journal"),
      icon: Feather,
    },
    {
      title: t.create,
      url: createPageUrl("Creations"),
      icon: Wand2,
    },
    {
      title: t.insights,
      url: createPageUrl("Insights"),
      icon: Sparkles,
    },
    {
      title: t.humanSupport,
      url: createPageUrl("HumanSupport"),
      icon: Users,
    },
    {
      title: t.tokens,
      url: createPageUrl("Tokens"),
      icon: Coins,
    },
    {
      title: t.settings,
      url: createPageUrl("Settings"),
      icon: Settings,
    },
    {
      title: t.profile,
      url: createPageUrl("Profile"),
      icon: User,
    },
  ];

  // Determine if back button should be shown and where it should go
  const parentPage = currentPageName ? pageHierarchy[currentPageName] : null;
  const showBackButton = parentPage !== undefined;

  const handleBack = () => {
    if (parentPage) {
      navigate(createPageUrl(parentPage));
    }
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sidebar-background: 250 249 246;
          --sidebar-foreground: 68 64 60;
          --sidebar-border: 231 229 228;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-stone-50">
        <Sidebar className="border-r border-stone-200 bg-stone-50">
          <SidebarHeader className="border-b border-stone-200">
            <Link to={createPageUrl("Home")} className="block p-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-stone-700" strokeWidth={1.5} />
                  <div>
                    <h2 className="font-semibold text-stone-900">{t.appName}</h2>
                    <p className="text-xs text-stone-500">{t.tagline}</p>
                  </div>
                </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-4 flex flex-col justify-between flex-1">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-colors ${
                            isActive 
                              ? 'bg-stone-900 text-white hover:bg-stone-800' 
                              : 'hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                            <item.icon className="w-5 h-5" strokeWidth={1.5} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                asChild 
                                className="transition-colors hover:bg-stone-100 text-stone-700"
                            >
                                <Link to={createPageUrl("Refer")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                    <Gift className="w-5 h-5" strokeWidth={1.5} />
                                    <span className="font-medium">{t.refer}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-stone-200 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <SidebarTrigger className="hover:bg-stone-100 p-2 rounded-lg" />
              </div>
              {showBackButton && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">{t.back}</span>
                </Button>
              )}
              <h1 className="text-lg font-semibold text-stone-900 md:hidden">{t.appName}</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-stone-50">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

