import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ChatMessage from '../chat/ChatMessage';

export default function JournalChat({ isReady, messages, onSendMessage }) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const [isSending, setIsSending] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        setIsSending(true);
        await onSendMessage(input);
        setInput("");
        setIsSending(false);
    };

    if (!isReady) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center p-8">
                <MessageSquare className="w-16 h-16 text-stone-300 mb-6" strokeWidth={1.5} />
                <h2 className="text-xl font-semibold text-stone-900 mb-2">AI Companion</h2>
                <p className="text-stone-600">Save your entry to start a conversation with your AI companion.</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-semibold text-stone-900">AI Companion</h2>
                <p className="text-sm text-stone-600">Reflect on your entry</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                        <ChatMessage key={index} message={message} />
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>
            <div className="p-6 border-t border-stone-200">
                <div className="flex gap-3">
                    <Input
                        placeholder="Ask about your entry..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isSending}
                        className="h-11 border-stone-200 focus:border-stone-400"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isSending}
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