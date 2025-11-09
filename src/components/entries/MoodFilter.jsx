import React from "react";
import { Button } from "@/components/ui/button";

const moods = [
  { value: "all", label: "All" },
  { value: "happy", label: "Happy" },
  { value: "calm", label: "Calm" },
  { value: "neutral", label: "Neutral" },
  { value: "anxious", label: "Anxious" },
  { value: "sad", label: "Sad" },
  { value: "excited", label: "Excited" },
  { value: "grateful", label: "Grateful" }
];

export default function MoodFilter({ selectedMood, onMoodChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {moods.map(({ value, label }) => (
        <Button
          key={value}
          variant={selectedMood === value ? "default" : "outline"}
          onClick={() => onMoodChange(value)}
          className={`h-9 ${
            selectedMood === value 
              ? "bg-stone-900 hover:bg-stone-800" 
              : "hover:bg-stone-50"
          }`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}