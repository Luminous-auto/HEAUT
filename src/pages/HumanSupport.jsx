import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Heart, Mail, UserCircle, Search, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const translations = {
  en: {
    title: 'Human Support',
    subtitle: 'Connect with real people who are here to help and support you.',
    searchPlaceholder: 'Search by name or role...',
    available: 'Available',
    unavailable: 'Currently Unavailable',
    contact: 'Contact',
    noHelpers: 'No helpers available at the moment. Check back soon!',
    roleLabels: {
      counselor: 'Counselor',
      social_worker: 'Social Worker',
      writer: 'Writer',
      life_coach: 'Life Coach',
      peer_support: 'Peer Support',
      other: 'Other'
    }
  },
  zh: {
    title: '人工支持',
    subtitle: '与愿意帮助和支持您的真实人士建立联系。',
    searchPlaceholder: '按姓名或角色搜索...',
    available: '可用',
    unavailable: '暂时不可用',
    contact: '联系',
    noHelpers: '目前没有可用的帮助者。请稍后再查看！',
    roleLabels: {
      counselor: '辅导员',
      social_worker: '社会工作者',
      writer: '作家',
      life_coach: '生活教练',
      peer_support: '同伴支持',
      other: '其他'
    }
  }
};

const HelperCard = ({ helper, t }) => {
  const [contacted, setContacted] = useState(false);

  const handleContact = () => {
    // In production, this would open a messaging system or send a notification
    window.location.href = `mailto:${helper.email}?subject=Support Request from HEAUT`;
    setContacted(true);
    setTimeout(() => setContacted(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-stone-600" strokeWidth={1.5} />
              </div>
              <div>
                <CardTitle className="text-xl">{helper.username || 'Anonymous Helper'}</CardTitle>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {helper.helper_roles?.map((role, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-stone-100 text-stone-700">
                      {t.roleLabels[role] || role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            {helper.helper_availability ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t.available}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-stone-500">
                {t.unavailable}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {helper.helper_bio && (
            <p className="text-stone-600 leading-relaxed">
              {helper.helper_bio}
            </p>
          )}
          <Button
            onClick={handleContact}
            disabled={!helper.helper_availability || contacted}
            className="w-full bg-stone-900 hover:bg-stone-800"
          >
            {contacted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Email Opened
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {t.contact}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function HumanSupportPage() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

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

  const { data: helpers, isLoading } = useQuery({
    queryKey: ['helpers'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(user => user.is_helper === true);
    },
    initialData: [],
  });

  const t = translations[currentLanguage];

  const filteredHelpers = helpers.filter(helper => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesName = helper.username?.toLowerCase().includes(query);
    const matchesRole = helper.helper_roles?.some(role => 
      t.roleLabels[role]?.toLowerCase().includes(query)
    );
    const matchesBio = helper.helper_bio?.toLowerCase().includes(query);
    return matchesName || matchesRole || matchesBio;
  });

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-stone-600" strokeWidth={1.5} />
            <h1 className="text-3xl md:text-4xl font-semibold text-stone-900">
              {t.title}
            </h1>
          </div>
          <p className="text-stone-600">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-stone-200"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-white rounded-lg animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : filteredHelpers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredHelpers.map(helper => (
              <HelperCard key={helper.id} helper={helper} t={t} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                {t.noHelpers}
              </h3>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}