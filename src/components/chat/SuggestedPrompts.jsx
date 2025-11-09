import React from "react";
import { Button } from "@/components/ui/button";

const prompts = [
  "How am I doing emotionally?",
  "What patterns do you see?",
  "Give me a reflection prompt",
  "Help me understand my week"
];

export default function SuggestedPrompts({ onSelectPrompt }) {
  return (
    <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          variant="outline"
          onClick={() => onSelectPrompt(prompt)}
          className="h-auto p-4 text-left hover:bg-stone-50 hover:border-stone-400 justify-start"
        >
          <span className="text-stone-700">{prompt}</span>
        </Button>
      ))}
    </div>
  );
}