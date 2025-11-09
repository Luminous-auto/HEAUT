import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import EditorPanel from "../components/creations/EditorPanel";
import CollaborationChat from "../components/creations/CollaborationChat";

export default function CreativeEditorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workId = searchParams.get('id');

  const [work, setWork] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { data: initialWork, isLoading } = useQuery({
    queryKey: ['creativeWork', workId],
    queryFn: () => base44.entities.CreativeWork.get(workId),
    enabled: !!workId,
  });

  useEffect(() => {
    if (workId) {
      if (initialWork) {
        setWork(initialWork);
        setChatMessages(initialWork.collaboration_history || []);
        setShowAnalysis(!!initialWork.literary_analysis);
      }
    } else {
      setWork({
        title: "",
        content: "",
        work_type: "Other",
        collaboration_history: [],
      });
      setChatMessages([]);
      setShowAnalysis(false);
    }
  }, [workId, initialWork]);

  const handleUpdateWork = (updatedFields) => {
    setWork(prev => ({ ...prev, ...updatedFields }));
  };

  const saveMutation = useMutation({
    mutationFn: (workData) => {
      const dataToSave = { ...workData, collaboration_history: chatMessages };
      if (dataToSave.id) {
        return base44.entities.CreativeWork.update(dataToSave.id, dataToSave);
      }
      return base44.entities.CreativeWork.create(dataToSave);
    },
    onSuccess: (savedWork) => {
      queryClient.invalidateQueries({ queryKey: ['creativeWorks'] });
      queryClient.setQueryData(['creativeWork', savedWork.id], savedWork);
      if (!workId) {
        navigate(`/CreativeEditor?id=${savedWork.id}`, { replace: true });
      }
    },
  });

  const saveAndAnalyzeMutation = useMutation({
    mutationFn: async (workData) => {
      const dataToSave = { ...workData, collaboration_history: chatMessages };
      
      let savedWork;
      if (dataToSave.id) {
        savedWork = await base44.entities.CreativeWork.update(dataToSave.id, dataToSave);
      } else {
        savedWork = await base44.entities.CreativeWork.create(dataToSave);
      }

      // Generate literary analysis
      const prompt = `As a literary critic, analyze this creative work in detail. IMPORTANT: Detect the language of the work and respond in that EXACT same language. If the work is in Chinese, respond in Chinese. If in English, respond in English.

Title: ${savedWork.title}
Type: ${savedWork.work_type}

Content:
---
${savedWork.content}
---

Provide a comprehensive literary analysis covering:

1. **Style Analysis**: Describe the author's writing style, voice, tone, and technical choices.
2. **Thematic Analysis**: Identify and explore the core themes and ideas in this work.
3. **Key Strengths**: Highlight 2-3 major strengths of this specific piece.
4. **Suggestions for Improvement**: Offer 2-3 constructive suggestions specific to this work.

Additionally, provide scores (1-10) for:
5. **Technical Mastery**: Grammar, syntax, and technical execution
6. **Emotional Resonance**: Ability to evoke feelings and connect with readers
7. **Originality & Voice**: Uniqueness and distinctiveness
8. **Narrative Coherence**: Flow, logic, and consistency
9. **Overall Score**: A synthesized overall rating

Be insightful, constructive, and specific to this work.`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            style_analysis: { type: "string" },
            thematic_analysis: { type: "string" },
            strengths: { type: "string" },
            suggestions: { type: "string" },
            technical_mastery: { type: "number" },
            emotional_resonance: { type: "number" },
            originality_voice: { type: "number" },
            narrative_coherence: { type: "number" },
            overall_score: { type: "number" }
          }
        }
      });

      const literaryAnalysis = {
        ...analysis,
        analysis_date: new Date().toISOString().split('T')[0]
      };

      const updatedWork = await base44.entities.CreativeWork.update(savedWork.id, {
        literary_analysis: literaryAnalysis
      });

      return updatedWork;
    },
    onSuccess: (savedWork) => {
      queryClient.invalidateQueries({ queryKey: ['creativeWorks'] });
      queryClient.setQueryData(['creativeWork', savedWork.id], savedWork);
      setWork(savedWork);
      setShowAnalysis(true);
      
      if (!workId) {
        navigate(`/CreativeEditor?id=${savedWork.id}`, { replace: true });
      }
    },
  });

  const handleSendMessage = async (messageText) => {
    const newMessages = [...chatMessages, { role: "user", content: messageText }];
    setChatMessages(newMessages);
    
    const thinkingMessage = { role: "assistant", content: "..." };
    setChatMessages(prev => [...prev, thinkingMessage]);

    try {
      const prompt = `You are a creative writing partner named 'Aura'. The user is working on a ${work.work_type} titled "${work.title}". Your goal is to help them write, brainstorm, and improve their work. Be collaborative, suggestive, and inspiring. IMPORTANT: Detect the language the user is writing in and respond in that EXACT same language. If they write in Chinese, respond in Chinese. If in English, respond in English.

Current Draft:
---
${work.content}
---

Conversation History:
${newMessages.map(m => `${m.role}: ${m.content}`).join('\n')}
---

Respond to the user's latest message:`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const finalAIMessage = { role: "assistant", content: response };
      
      const finalMessages = [...newMessages, finalAIMessage];
      setChatMessages(finalMessages);
      
      if (work.id) {
        await base44.entities.CreativeWork.update(work.id, { collaboration_history: finalMessages });
        queryClient.setQueryData(['creativeWork', work.id], (old) => ({...old, collaboration_history: finalMessages}));
      }
    } catch (error) {
      console.error("Error with AI collaborator:", error);
      const errorMsg = { role: "assistant", content: "I had a glitch. Could you repeat that?" };
      setChatMessages(prev => [...prev.slice(0, -1), errorMsg]);
    }
  };

  if ((workId && isLoading) || !work) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 h-screen">
        <div className="col-span-1 lg:col-span-3 p-8 border-r border-stone-200">
          <Skeleton className="h-10 w-1/2 mb-4" />
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
        <EditorPanel
          work={work}
          onUpdate={handleUpdateWork}
          onSave={() => saveMutation.mutate(work)}
          onSaveAndAnalyze={() => saveAndAnalyzeMutation.mutate(work)}
          isSaving={saveMutation.isPending}
          isSavingAndAnalyzing={saveAndAnalyzeMutation.isPending}
        />
      </div>
      <div className="lg:col-span-2 h-screen border-l border-stone-200 bg-stone-50">
        <CollaborationChat
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          literaryAnalysis={showAnalysis ? work.literary_analysis : null}
          isAnalyzing={saveAndAnalyzeMutation.isPending}
        />
      </div>
    </div>
  );
}