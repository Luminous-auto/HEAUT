import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Feather, Smile, Cloud, Meh, Frown, Heart, Zap, Sparkles } from "lucide-react";

const moodOptions = [
  { value: "happy", icon: Smile, label: "Happy" },
  { value: "calm", icon: Cloud, label: "Calm" },
  { value: "neutral", icon: Meh, label: "Neutral" },
  { value: "anxious", icon: Zap, label: "Anxious" },
  { value: "sad", icon: Frown, label: "Sad" },
  { value: "excited", icon: Sparkles, label: "Excited" },
  { value: "grateful", icon: Heart, label: "Grateful" }
];

export default function JournalEditor({ entry, onUpdate, onSaveAndAnalyze, onSaveDraft, isSavingAndAnalyzing, isSavingDraft }) {

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newTag = e.target.value.trim();
      if (!entry.tags.includes(newTag)) {
        onUpdate({ tags: [...entry.tags, newTag] });
      }
      e.target.value = "";
    }
  };

  const removeTag = (tagToRemove) => {
    onUpdate({ tags: entry.tags.filter(tag => tag !== tagToRemove) });
  };
  
  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-stone-900">
            {entry.title || (entry.id ? 'Your Entry' : 'New Entry')}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onSaveDraft(entry)}
            disabled={!entry.content || isSavingAndAnalyzing || isSavingDraft}
            variant="outline"
            className="h-11 px-6"
          >
            {isSavingDraft ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
            )}
            Save to myself
          </Button>
          <Button
            onClick={() => onSaveAndAnalyze(entry)}
            disabled={!entry.content || isSavingAndAnalyzing || isSavingDraft}
            className="h-11 px-6 bg-stone-900 hover:bg-stone-800"
          >
            {isSavingAndAnalyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Feather className="w-4 h-4 mr-2" strokeWidth={1.5} />
            )}
            Save & Analyze
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {entry.audio_url && (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-700">Original Recording</label>
                <audio src={entry.audio_url} controls className="w-full" />
            </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Date</label>
          <Input
            type="date"
            value={entry.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className="h-11 border-stone-200 focus:border-stone-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Title (optional)</label>
          <Input
            placeholder="Entry title..."
            value={entry.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="h-11 border-stone-200 focus:border-stone-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">Mood</label>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {moodOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => onUpdate({ mood: value })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                  entry.mood === value 
                    ? 'border-stone-900 bg-stone-50' 
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${entry.mood === value ? 'text-stone-900' : 'text-stone-400'}`} strokeWidth={1.5} />
                <span className={`text-xs ${entry.mood === value ? 'text-stone-900 font-medium' : 'text-stone-600'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Entry</label>
          <Textarea
            placeholder="What's on your mind?"
            value={entry.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="min-h-[calc(100vh-550px)] text-lg leading-relaxed border-stone-200 focus:border-stone-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {entry.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-stone-900">×</button>
              </span>
            ))}
          </div>
          <Input
            placeholder="Add tags (press Enter)..."
            onKeyDown={handleAddTag}
            className="h-11 border-stone-200 focus:border-stone-400"
          />
        </div>
      </div>
    </div>
  );
}