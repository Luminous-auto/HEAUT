import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Wand2, Sparkles, Target, Heart, Zap, TrendingUp, FileText } from "lucide-react";
import ChatMessage from '../chat/ChatMessage';

const suggestedPrompts = [
  "Brainstorm some titles",
  "Help me start the first paragraph",
  "Rewrite this sentence to be more poetic",
  "What should happen next?"
];

export default function CollaborationChat({ messages, onSendMessage, literaryAnalysis, isAnalyzing }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, literaryAnalysis]);

  const handleSend = async (prompt) => {
    const messageToSend = typeof prompt === 'string' ? prompt : input;
    if (!messageToSend.trim()) return;
    
    setIsSending(true);
    setInput("");
    await onSendMessage(messageToSend);
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-semibold text-stone-900 flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          AI Collaborator
        </h2>
        <p className="text-sm text-stone-600">Your creative partner</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {literaryAnalysis ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                <h3 className="font-semibold text-stone-900">Literary Analysis Complete</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-stone-700 mb-2">Overall Score</h4>
                  <div className="text-4xl font-bold text-stone-900">
                    {literaryAnalysis.overall_score}/10
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-stone-600" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-stone-600">Technical Mastery</span>
                    </div>
                    <p className="text-xl font-semibold text-stone-900">{literaryAnalysis.technical_mastery}/10</p>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-stone-600" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-stone-600">Emotional Resonance</span>
                    </div>
                    <p className="text-xl font-semibold text-stone-900">{literaryAnalysis.emotional_resonance}/10</p>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-stone-600" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-stone-600">Originality & Voice</span>
                    </div>
                    <p className="text-xl font-semibold text-stone-900">{literaryAnalysis.originality_voice}/10</p>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-stone-600" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-stone-600">Narrative Coherence</span>
                    </div>
                    <p className="text-xl font-semibold text-stone-900">{literaryAnalysis.narrative_coherence}/10</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-stone-700 mb-2">Style Analysis</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">{literaryAnalysis.style_analysis}</p>
                </div>

                <div>
                  <h4 className="font-medium text-stone-700 mb-2">Thematic Analysis</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">{literaryAnalysis.thematic_analysis}</p>
                </div>

                <div>
                  <h4 className="font-medium text-stone-700 mb-2">Key Strengths</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">{literaryAnalysis.strengths}</p>
                </div>

                <div>
                  <h4 className="font-medium text-stone-700 mb-2">Suggestions for Improvement</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">{literaryAnalysis.suggestions}</p>
                </div>
              </div>
            </div>
            
            {messages.length > 0 && (
              <div className="border-t border-stone-200 pt-6">
                <h3 className="font-semibold text-stone-900 mb-4">Collaboration History</h3>
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
              </div>
            )}
          </div>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-10 h-10 text-stone-400 animate-spin mb-4" />
            <p className="text-stone-600">Analyzing your work...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center pt-10">
            <h3 className="font-semibold text-stone-800 mb-4">Ready to create?</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
                {suggestedPrompts.map(prompt => (
                    <button key={prompt} onClick={() => handleSend(prompt)} className="p-3 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-700 text-left">
                        {prompt}
                    </button>
                ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-6 border-t border-stone-200">
        <div className="flex gap-3">
          <Input
            placeholder="Ask for ideas, feedback, or help..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending || isAnalyzing}
            className="h-11 border-stone-200 focus:border-stone-400"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending || isAnalyzing}
            className="h-11 px-6 bg-stone-900 hover:bg-stone-800"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" strokeWidth={1.5} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}