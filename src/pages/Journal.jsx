
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Loader2, PenLine, BookOpen, ClipboardList } from 'lucide-react';
import AudioRecorder from '../components/recording/AudioRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const translations = {
  en: {
    newEntry: 'New Entry',
    subtitle: 'How would you like to express yourself today?',
    writeTitle: 'Write',
    writeDesc: 'Compose a classic text-based journal entry.',
    recordTitle: 'Record',
    recordDesc: 'Capture your thoughts with a voice recording.',
    surveyTitle: 'Survey',
    surveyDesc: 'Take a mental health assessment to track your wellbeing.',
    startWriting: 'Start Writing',
    takeSurvey: 'Take Survey',
    previousEntries: 'Previous Entries',
    previousDesc: 'Review and search your past journal entries.',
    viewEntries: 'View Entries',
    saveToMyself: 'Save to myself',
    saveAnalyze: 'Save & Analyze',
    uploading: 'Uploading recording...',
    transcribing: 'Transcribing audio...',
    saving: 'Saving entry...',
    analyzing: 'Analyzing...'
  },
  zh: {
    newEntry: '新日记',
    subtitle: '今天您想如何表达自己？',
    writeTitle: '写作',
    writeDesc: '撰写经典的文本日记。',
    recordTitle: '录音',
    recordDesc: '用语音记录您的想法。',
    surveyTitle: '问卷',
    surveyDesc: '进行心理健康评估以跟踪您的健康状况。',
    startWriting: '开始写作',
    takeSurvey: '进行问卷',
    previousEntries: '以往日记',
    previousDesc: '查看和搜索您过去的日记。',
    viewEntries: '查看日记',
    saveToMyself: '保存给自己',
    saveAnalyze: '保存并分析',
    uploading: '正在上传录音...',
    transcribing: '正在转录音频...',
    saving: '正在保存日记...',
    analyzing: '正在分析...'
  }
};

export default function JournalPage() {
    const [audioBlob, setAudioBlob] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

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

    const processAndSaveMutation = useMutation({
        mutationFn: async ({ shouldAnalyze }) => {
            if (!audioBlob) throw new Error("No audio recording available.");

            setStatusMessage(t.uploading);
            const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: audioBlob.type });
            const { file_url: audio_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
            
            setStatusMessage(t.transcribing);
            // Use InvokeLLM with file_urls to transcribe audio
            const transcriptionPrompt = `Please transcribe the audio file exactly as spoken. Return only the transcription text, nothing else. Detect the language and transcribe in that language.`;
            
            const transcriptionResult = await base44.integrations.Core.InvokeLLM({
                prompt: transcriptionPrompt,
                file_urls: audio_url,
                response_json_schema: {
                    type: "object",
                    properties: {
                        transcription: { type: "string" }
                    }
                }
            });

            if (!transcriptionResult.transcription) {
                throw new Error("Failed to transcribe audio.");
            }
            const content = transcriptionResult.transcription;

            setStatusMessage(t.saving);
            const newEntryData = {
                title: `Voice Entry - ${format(new Date(), 'MMM d, yyyy')}`,
                content,
                date: format(new Date(), 'yyyy-MM-dd'),
                entry_type: 'voice',
                audio_url,
                ai_feedback: [],
            };

            const savedEntry = await base44.entities.DiaryEntry.create(newEntryData);

            if (shouldAnalyze) {
                setStatusMessage(t.analyzing);
                const prompt = `You are a thoughtful AI companion helping someone reflect on their journal entry. Read the entry and provide brief, empathetic feedback. IMPORTANT: Detect the language of the entry and respond in that EXACT same language. If the entry is in Chinese, respond in Chinese. If in English, respond in English. Here is the entry:\n\n---\n\n${content}`;
                const response = await base44.integrations.Core.InvokeLLM({ prompt });
                const initialFeedback = { role: 'assistant', content: response };
                
                await base44.entities.DiaryEntry.update(savedEntry.id, { ai_feedback: [initialFeedback] });

                const user = await base44.auth.me();
                const currentTokens = user.tokens || 0;
                await base44.auth.updateMe({ tokens: currentTokens + 2 });
                
                await base44.entities.TokenTransaction.create({
                    amount: 2,
                    type: 'journal_analysis',
                    description: 'Voice entry analyzed',
                    date: new Date().toISOString()
                });
            }

            return savedEntry.id;
        },
        onSuccess: (savedEntryId) => {
            queryClient.invalidateQueries({ queryKey: ['entries', 'currentUser', 'tokenTransactions'] });
            navigate(`${createPageUrl('TextEntry')}?id=${savedEntryId}`);
        },
        onError: (error) => {
            console.error("Processing failed:", error);
            setStatusMessage(`Error: ${error.message}. Please try again.`);
        },
        onSettled: () => {
            setIsProcessing(false);
        }
    });

    const handleProcess = (shouldAnalyze) => {
        setIsProcessing(true);
        processAndSaveMutation.mutate({ shouldAnalyze });
    };

    return (
        <div className="min-h-screen">
            <div className="border-b border-stone-200 bg-white">
                <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                    <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
                        {t.newEntry}
                    </h1>
                    <p className="text-stone-600">
                        {t.subtitle}
                    </p>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <PenLine className="w-5 h-5 text-stone-700" strokeWidth={1.5} />
                               {t.writeTitle}
                            </CardTitle>
                            <CardDescription>{t.writeDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center pt-8">
                             <Link to={createPageUrl('TextEntry')}>
                                <Button className="h-12 px-8 text-lg bg-stone-900 hover:bg-stone-800">
                                    {t.startWriting}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>{t.recordTitle}</CardTitle>
                            <CardDescription>{t.recordDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 flex flex-col items-center justify-center text-center">
                            <AudioRecorder onRecordingComplete={setAudioBlob} disabled={isProcessing} currentLanguage={currentLanguage} />
                            {audioBlob && !isProcessing && (
                                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                    <Button variant="outline" className="h-11 px-6" onClick={() => handleProcess(false)}>
                                        {t.saveToMyself}
                                    </Button>
                                    <Button className="h-11 px-6 bg-stone-900 hover:bg-stone-800" onClick={() => handleProcess(true)}>
                                        {t.saveAnalyze}
                                    </Button>
                                </div>
                            )}
                            {isProcessing && (
                                <div className="mt-8 flex items-center gap-3 text-stone-600">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <p>{statusMessage}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <ClipboardList className="w-5 h-5 text-stone-700" strokeWidth={1.5} />
                               {t.surveyTitle}
                            </CardTitle>
                            <CardDescription>{t.surveyDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center pt-8">
                             <Link to={createPageUrl('Surveys')}>
                                <Button className="h-12 px-8 text-lg bg-stone-900 hover:bg-stone-800">
                                    {t.takeSurvey}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <BookOpen className="w-5 h-5 text-stone-700" strokeWidth={1.5} />
                               {t.previousEntries}
                            </CardTitle>
                            <CardDescription>{t.previousDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center pt-8">
                             <Link to={createPageUrl('Entries')}>
                                <Button className="h-12 px-8 text-lg bg-stone-900 hover:bg-stone-800">
                                    {t.viewEntries}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
