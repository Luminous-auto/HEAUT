
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";

import JournalEditor from "../components/journal/JournalEditor";
import JournalChat from "../components/journal/JournalChat";
import { Skeleton } from "@/components/ui/skeleton";
import { Mic, FileText } from "lucide-react";

export default function TextEntryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const entryId = searchParams.get('id');

  const [entry, setEntry] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatReady, setIsChatReady] = useState(false);
  const [isSavingAndAnalyzing, setIsSavingAndAnalyzing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const { data: initialEntry, isLoading: isLoadingEntry } = useQuery({
    queryKey: ['diaryEntry', entryId],
    queryFn: async () => {
      if (!entryId) return null;
      // This is not efficient for large datasets, but ok for this app
      const entries = await base44.entities.DiaryEntry.list();
      return entries.find(e => e.id === entryId) || null;
    },
    enabled: !!entryId,
  });

  useEffect(() => {
    if (entryId) {
      if (initialEntry) {
        setEntry(initialEntry);
        setChatMessages(initialEntry.ai_feedback || []);
        setIsChatReady(initialEntry.ai_feedback && initialEntry.ai_feedback.length > 0); // Chat is ready if there's existing feedback
      }
    } else {
      setEntry({
        title: "",
        content: "",
        date: format(new Date(), 'yyyy-MM-dd'),
        mood: "",
        tags: [],
        ai_feedback: [],
        entry_type: 'text'
      });
      setIsChatReady(false);
      setChatMessages([]);
    }
  }, [entryId, initialEntry]);

  const handleUpdateEntry = (updatedFields) => {
    setEntry(prev => ({ ...prev, ...updatedFields }));
  };

  const saveDraftMutation = useMutation({
    mutationFn: async (entryData) => {
      const dataToSave = {
        ...entryData,
        title: entryData.title || `Entry from ${format(new Date(entryData.date), 'MMM d, yyyy')}`,
        ai_feedback: entryData.ai_feedback || [], // Make sure to save current chat if any
        entry_type: 'text'
      };
      
      let savedEntry;
      if (entryData.id) {
        savedEntry = await base44.entities.DiaryEntry.update(entryData.id, dataToSave);
      } else {
        savedEntry = await base44.entities.DiaryEntry.create(dataToSave);
      }
      return savedEntry;
    },
    onSuccess: (savedEntry) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.setQueryData(['diaryEntry', savedEntry.id], savedEntry);
      
      if (!entryId) {
         navigate(`${createPageUrl('TextEntry')}?id=${savedEntry.id}`, { replace: true });
      }
    },
    onMutate: () => {
        setIsSavingDraft(true);
    },
    onSettled: () => {
        setIsSavingDraft(false);
    }
  });

  const saveAndAnalyzeMutation = useMutation({
    mutationFn: async (entryData) => {
      const dataToSave = {
        ...entryData,
        title: entryData.title || `Entry from ${format(new Date(entryData.date), 'MMM d, yyyy')}`,
        entry_type: 'text', 
      };

      let savedEntry;
      if (entryData.id) {
        savedEntry = await base44.entities.DiaryEntry.update(entryData.id, dataToSave);
      } else {
        savedEntry = await base44.entities.DiaryEntry.create(dataToSave);
      }

      // Start analysis process
      const prompt = `You are a thoughtful AI companion helping someone reflect on their journal entry. Read the entry and provide brief, empathetic feedback. IMPORTANT: Detect the language of the entry and respond in that EXACT same language. If the entry is in Chinese, respond in Chinese. If in English, respond in English.

Entry Details:
Title: ${savedEntry.title || 'Untitled'}
Date: ${savedEntry.date}
Mood: ${savedEntry.mood || 'Not specified'}
Content:
---
${savedEntry.content}
---

Provide your reflection:`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const initialFeedback = { role: 'assistant', content: response };
      
      const updatedEntry = await base44.entities.DiaryEntry.update(savedEntry.id, { 
        ai_feedback: [initialFeedback] 
      });

      const user = await base44.auth.me();
      const currentTokens = user.tokens || 0;
      await base44.auth.updateMe({ tokens: currentTokens + 2 });
      
      await base44.entities.TokenTransaction.create({
        amount: 2,
        type: 'journal_analysis',
        description: 'Journal entry analyzed',
        date: new Date().toISOString()
      });

      return updatedEntry; // Return the entry with updated ai_feedback
    },
    onSuccess: (savedEntry) => { // This savedEntry already contains the ai_feedback
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.setQueryData(['diaryEntry', savedEntry.id], savedEntry);
      
      if (!entryId) { // If it was a new entry, update URL
         navigate(`${createPageUrl('TextEntry')}?id=${savedEntry.id}`, { replace: true });
      }

      setChatMessages(savedEntry.ai_feedback); // Set chat messages from the analyzed entry
      setIsChatReady(true); // Chat is now ready
      
      // Invalidate token queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] }); // For 'me' query
      queryClient.invalidateQueries({ queryKey: ['tokenTransactions'] });
    },
    onMutate: () => {
        setIsSavingAndAnalyzing(true);
    },
    onSettled: () => {
        setIsSavingAndAnalyzing(false);
    },
    onError: (error) => {
        console.error("Error saving and analyzing entry:", error);
        const errorMessage = { role: "assistant", content: "I'm sorry, I had trouble analyzing this entry. Please try again." };
        setChatMessages(prev => [...prev, errorMessage]); // Add error message to chat
    }
  });

  const handleSendMessage = async (messageText) => {
    const newMessages = [...chatMessages, { role: "user", content: messageText }];
    setChatMessages(newMessages);

    const thinkingMessage = { role: "assistant", content: "..." };
    setChatMessages(prev => [...prev, thinkingMessage]);

    try {
      const conversationHistory = newMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      const prompt = `You are a thoughtful AI companion helping someone reflect on their journal entry. IMPORTANT: Detect the language the user is writing in and respond in that EXACT same language. If they write in Chinese, respond in Chinese. If in English, respond in English.

Journal Entry:
Title: ${entry.title || 'Untitled'}
Date: ${entry.date}
Mood: ${entry.mood || 'Not specified'}
Content:
---
${entry.content}
---

Conversation so far:
${conversationHistory}

Respond to the user's latest message:`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const finalAIMessage = { role: "assistant", content: response };
      
      const finalMessages = [...newMessages, finalAIMessage];
      setChatMessages(finalMessages);

      // Persist the updated conversation
      await base44.entities.DiaryEntry.update(entry.id, { ai_feedback: finalMessages });
      queryClient.invalidateQueries({ queryKey: ['diaryEntry', entry.id] });

    } catch (error) {
        console.error("Error sending message:", error);
        const errorMsg = { role: "assistant", content: "I had trouble responding. Please try again." };
        setChatMessages(prev => [...prev.slice(0, -1), errorMsg]);
    }
  };

  if ((entryId && isLoadingEntry) || !entry) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 h-screen">
            <div className="col-span-1 lg:col-span-3 p-8 border-r border-stone-200">
                <Skeleton className="h-10 w-1/2 mb-4" />
                <Skeleton className="h-4 w-1/3 mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
            <div className="col-span-1 lg:col-span-2 p-8 bg-stone-50">
                 <Skeleton className="h-full w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 h-screen bg-white">
      <div className="lg:col-span-3 h-screen overflow-y-auto">
        <JournalEditor
          entry={entry}
          onUpdate={handleUpdateEntry}
          onSaveAndAnalyze={(entryData) => saveAndAnalyzeMutation.mutate(entryData)}
          onSaveDraft={(entryData) => saveDraftMutation.mutate(entryData)}
          isSavingAndAnalyzing={isSavingAndAnalyzing}
          isSavingDraft={isSavingDraft}
        />
      </div>
      <div className="lg:col-span-2 h-screen border-l border-stone-200 bg-stone-50">
        <JournalChat
          isReady={isChatReady}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
