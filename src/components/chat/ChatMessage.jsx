import React from "react";
import { motion } from "framer-motion";
import { Bot, User, Loader2 } from "lucide-react";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-stone-900' : 'bg-stone-200'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" strokeWidth={1.5} />
        ) : (
          <Bot className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
        )}
      </div>
      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`inline-block max-w-[85%] rounded-lg p-4 border ${
          isUser 
            ? 'bg-stone-900 text-white border-stone-900' 
            : 'bg-white text-stone-900 border-stone-200'
        }`}>
          {message.content === '...' ? (
            <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}