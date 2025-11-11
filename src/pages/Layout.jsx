

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Feather, Sparkles, Coins, Wand2, User, Settings, Gift, ArrowLeft, Users, Menu } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    back: 'Back',
    menu: 'Menu'
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
    back: '返回',
    menu: '菜单'
  }
};

const pageHierarchy = {
  'Journal': 'Home',
  'Creations': 'Home',
  'Insights': 'Home',
  'Tokens': 'Home',
  'Settings': 'Home',
  'Profile': 'Home',
  'Refer': 'Home',
  'HumanSupport': 'Home',
  'TextEntry': 'Journal',
  'Entries': 'Journal',
  'Surveys': 'Journal',
  'TakeSurvey': 'Surveys',
  'SurveyResult': 'Surveys',
  'CreativeEditor': 'Creations',
  'MentalHealthInsights': 'Insights',
  'CreativityInsights': 'Insights',
  'SelfAwarenessInsights': 'Insights',
  'SoulMate': 'Insights'
};

function MobileBottomNav({ navigationItems, location, currentLanguage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = translations[currentLanguage];

  // Main bottom nav items (most used features)
  const bottomNavItems = [
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
      title: t.menu,
      icon: Menu,
      isMenu: true,
    },
  ];

  // Additional menu items
  const menuItems = [
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
      title: t.profile,
      url: createPageUrl("Profile"),
      icon: User,
    },
    {
      title: t.settings,
      url: createPageUrl("Settings"),
      icon: Settings,
    },
    {
      title: t.refer,
      url: createPageUrl("Refer"),
      icon: Gift,
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-amber-50 border-t border-amber-100 md:hidden z-50 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            if (item.isMenu) {
              return (
                <Sheet key="menu" open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <button className="flex flex-col items-center justify-center px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors min-w-[64px]">
                      <item.icon className="w-6 h-6 text-amber-900" strokeWidth={1.5} />
                      <span className="text-xs text-amber-800 mt-1 font-medium">{item.title}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl bg-amber-50 border-t-2 border-amber-200">
                    <SheetHeader>
                      <SheetTitle className="text-left flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-amber-900" strokeWidth={1.5} />
                        <div>
                          <div className="font-semibold text-amber-900">{t.appName}</div>
                          <div className="text-xs text-amber-700 font-normal">{t.tagline}</div>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-2">
                      {menuItems.map((menuItem) => {
                        const isActive = location.pathname === menuItem.url;
                        return (
                          <Link
                            key={menuItem.title}
                            to={menuItem.url}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-amber-900 text-white'
                                : 'hover:bg-amber-100 text-amber-900'
                            }`}
                          >
                            <menuItem.icon className="w-5 h-5" strokeWidth={1.5} />
                            <span className="font-medium">{menuItem.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }

            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors min-w-[64px] ${
                  isActive ? 'bg-amber-900 text-white' : 'hover:bg-amber-100'
                }`}
              >
                <item.icon
                  className={`w-6 h-6 ${isActive ? 'text-white' : 'text-amber-900'}`}
                  strokeWidth={1.5}
                />
                <span
                  className={`text-xs mt-1 font-medium ${
                    isActive ? 'text-white' : 'text-amber-800'
                  }`}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { setOpenMobile } = useSidebar();

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
  }, [location.pathname]);

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

  const parentPage = pageHierarchy[currentPageName];
  const showBackButton = parentPage !== undefined;

  const handleBack = () => {
    if (parentPage) {
      navigate(createPageUrl(parentPage));
    }
  };

  const handleNavClick = () => {
    setOpenMobile(false);
  };

  return (
    <div className="min-h-screen flex w-full bg-stone-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <Sidebar className="border-r border-stone-200 bg-stone-50 hidden md:flex">
        <SidebarHeader className="border-b border-stone-200">
          <Link to={createPageUrl("Home")} className="block p-6" onClick={handleNavClick}>
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
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" onClick={handleNavClick}>
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
                              <Link to={createPageUrl("Refer")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" onClick={handleNavClick}>
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
        <header className="bg-amber-50 border-b border-amber-100 px-6 py-4 md:bg-white md:border-stone-200">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-amber-900 hover:text-amber-950 hover:bg-amber-100 md:text-stone-700 md:hover:text-stone-900 md:hover:bg-stone-100"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">{t.back}</span>
              </Button>
            )}
            <Link to={createPageUrl("Home")} className="md:hidden">
              <h1 className="text-lg font-semibold text-amber-900">{t.appName}</h1>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-stone-50 pb-16 md:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        navigationItems={navigationItems} 
        location={location} 
        currentLanguage={currentLanguage}
      />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sidebar-background: 250 249 246;
          --sidebar-foreground: 68 64 60;
          --sidebar-border: 231 229 228;
        }
      `}</style>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </SidebarProvider>
  );
}

