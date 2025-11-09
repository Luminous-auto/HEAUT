import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Heart, Sparkles, Loader2, UserCircle, Mail, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const translations = {
  en: {
    title: 'Soul Mate Connections',
    subtitle: 'Discover meaningful connections based on deep compatibility analysis.',
    findMatches: 'Find Soul Mates',
    finding: 'Analyzing compatibility...',
    noData: 'Complete more journal entries and self-awareness analyses to enable soul mate matching.',
    compatibilityScore: 'Compatibility',
    sharedThemes: 'Shared Themes',
    complementary: 'Complementary Traits',
    connect: 'Connect',
    connected: 'Connected',
    noMatches: 'No matches found yet. Click "Find Soul Mates" to discover connections.',
    analysis: 'Compatibility Analysis'
  },
  zh: {
    title: '灵魂伴侣连接',
    subtitle: '基于深度兼容性分析发现有意义的连接。',
    findMatches: '寻找灵魂伴侣',
    finding: '正在分析兼容性...',
    noData: '完成更多日记和自我意识分析以启用灵魂伴侣匹配。',
    compatibilityScore: '兼容性',
    sharedThemes: '共同主题',
    complementary: '互补特质',
    connect: '连接',
    connected: '已连接',
    noMatches: '尚未找到匹配。点击"寻找灵魂伴侣"以发现连接。',
    analysis: '兼容性分析'
  }
};

const MatchCard = ({ match, onConnect, t }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const users = await base44.entities.User.list();
        const matchedUser = users.find(u => u.id === match.matched_user_id);
        setUser(matchedUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [match.matched_user_id]);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white border-stone-200 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-stone-600" strokeWidth={1.5} />
              </div>
              <div>
                <CardTitle className="text-xl">{user.username || 'Anonymous User'}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Heart className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-stone-700">
                    {match.compatibility_score}% {t.compatibilityScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {match.compatibility_analysis && (
            <div>
              <h4 className="font-medium text-stone-900 mb-2">{t.analysis}</h4>
              <p className="text-sm text-stone-600 leading-relaxed">
                {match.compatibility_analysis}
              </p>
            </div>
          )}

          {match.shared_themes && match.shared_themes.length > 0 && (
            <div>
              <h4 className="font-medium text-stone-900 mb-2">{t.sharedThemes}</h4>
              <div className="flex flex-wrap gap-2">
                {match.shared_themes.map((theme, idx) => (
                  <span key={idx} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-xs">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {match.complementary_traits && match.complementary_traits.length > 0 && (
            <div>
              <h4 className="font-medium text-stone-900 mb-2">{t.complementary}</h4>
              <div className="flex flex-wrap gap-2">
                {match.complementary_traits.map((trait, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onConnect(match)}
              disabled={match.status === 'connected'}
              className="flex-1 bg-stone-900 hover:bg-stone-800"
            >
              {match.status === 'connected' ? (
                <>
                  <Heart className="w-4 h-4 mr-2 fill-current" strokeWidth={1.5} />
                  {t.connected}
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  {t.connect}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function SoulMatePage() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const queryClient = useQueryClient();

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

  const { data: selfAwarenessAnalyses } = useQuery({
    queryKey: ['selfAwarenessAnalyses'],
    queryFn: () => base44.entities.SelfAwarenessAnalysis.list('-date'),
    initialData: [],
  });

  const { data: personalAnalyses } = useQuery({
    queryKey: ['personalAnalyses'],
    queryFn: () => base44.entities.PersonalAnalysis.list('-date'),
    initialData: [],
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['soulMateMatches'],
    queryFn: () => base44.entities.SoulMateMatch.list('-match_date'),
    initialData: [],
  });

  const findMatchesMutation = useMutation({
    mutationFn: async () => {
      const currentUser = await base44.auth.me();
      const allUsers = await base44.entities.User.list();
      
      // Get current user's data
      const myLatestSelfAnalysis = selfAwarenessAnalyses[0];
      const myLatestMentalHealth = personalAnalyses[0];
      const myJournalEntries = await base44.entities.DiaryEntry.list('-date');
      
      const myProfile = `
User: ${currentUser.username || currentUser.email}
Self-Awareness: ${myLatestSelfAnalysis?.integrated_insights || 'N/A'}
Mental Health Patterns: ${myLatestMentalHealth?.emotional_patterns || 'N/A'}
Recent Journal Themes: ${myJournalEntries.slice(0, 3).map(e => e.content?.substring(0, 200)).join(' ')}
      `;

      // Find potential matches
      const potentialMatches = [];
      for (const otherUser of allUsers) {
        if (otherUser.id === currentUser.id) continue;
        
        // Get other user's analyses
        const theirAnalyses = await base44.entities.SelfAwarenessAnalysis.filter({ created_by: otherUser.email });
        const theirMentalHealth = await base44.entities.PersonalAnalysis.filter({ created_by: otherUser.email });
        
        if (theirAnalyses.length === 0 && theirMentalHealth.length === 0) continue;

        const theirProfile = `
User: ${otherUser.username || otherUser.email}
Self-Awareness: ${theirAnalyses[0]?.integrated_insights || 'N/A'}
Mental Health Patterns: ${theirMentalHealth[0]?.emotional_patterns || 'N/A'}
        `;

        const prompt = `You are a relationship compatibility expert. Analyze these two users' profiles and determine their compatibility. IMPORTANT: Detect the language of the profiles and respond in that EXACT same language.

User A Profile:
${myProfile}

User B Profile:
${theirProfile}

Provide:
1. Compatibility score (0-100)
2. Detailed compatibility analysis
3. List of 3-5 shared themes or interests
4. List of 3-5 complementary personality traits

Be thoughtful and consider emotional compatibility, shared values, and complementary strengths.`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              compatibility_score: { type: "number" },
              compatibility_analysis: { type: "string" },
              shared_themes: { type: "array", items: { type: "string" } },
              complementary_traits: { type: "array", items: { type: "string" } }
            }
          }
        });

        if (result.compatibility_score >= 60) {
          potentialMatches.push({
            matched_user_id: otherUser.id,
            compatibility_score: result.compatibility_score,
            compatibility_analysis: result.compatibility_analysis,
            shared_themes: result.shared_themes,
            complementary_traits: result.complementary_traits,
            match_date: new Date().toISOString(),
            status: 'pending'
          });
        }
      }

      // Save top matches
      for (const match of potentialMatches.slice(0, 5)) {
        await base44.entities.SoulMateMatch.create(match);
      }

      return potentialMatches.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulMateMatches'] });
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (match) => {
      return base44.entities.SoulMateMatch.update(match.id, { status: 'connected' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulMateMatches'] });
    },
  });

  const t = translations[currentLanguage];
  const hasEnoughData = selfAwarenessAnalyses.length > 0 || personalAnalyses.length > 0;

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
        <div className="bg-white rounded-lg border border-stone-200 p-8 mb-8 text-center">
          <Users className="w-12 h-12 text-stone-400 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-2xl font-semibold text-stone-900 mb-2">
            {t.title}
          </h2>
          <p className="text-stone-600 mb-6 max-w-xl mx-auto">
            {t.subtitle}
          </p>
          
          {!hasEnoughData ? (
            <p className="text-stone-500 italic">{t.noData}</p>
          ) : (
            <Button
              onClick={() => findMatchesMutation.mutate()}
              disabled={findMatchesMutation.isPending}
              className="h-11 px-8 bg-stone-900 hover:bg-stone-800"
            >
              {findMatchesMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.finding}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  {t.findMatches}
                </>
              )}
            </Button>
          )}
        </div>

        {matches.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {matches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                onConnect={() => connectMutation.mutate(match)}
                t={t}
              />
            ))}
          </div>
        ) : !isLoadingMatches && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-stone-500">{t.noMatches}</p>
          </div>
        )}
      </div>
    </div>
  );
}