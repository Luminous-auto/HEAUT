import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, Wand2, Sparkles } from 'lucide-react';

export default function EditorPanel({ work, onUpdate, onSave, onSaveAndAnalyze, isSaving, isSavingAndAnalyzing }) {
  const workTypes = ["Poem", "Essay", "Short Story", "Article", "Other"];

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-stone-700" strokeWidth={1.5} />
          <h1 className="text-3xl md:text-4xl font-semibold text-stone-900">
            {work.id ? 'Edit Creation' : 'New Creation'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            disabled={!work.content || isSaving || isSavingAndAnalyzing}
            variant="outline"
            className="h-11 px-6"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
            )}
            Save Work
          </Button>
          <Button
            onClick={onSaveAndAnalyze}
            disabled={!work.content || isSaving || isSavingAndAnalyzing}
            className="h-11 px-6 bg-stone-900 hover:bg-stone-800"
          >
            {isSavingAndAnalyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
            )}
            Save & Analyze
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-2">Title</label>
            <Input
              placeholder="Your masterpiece's title..."
              value={work.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="h-11 border-stone-200 focus:border-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Type</label>
            <Select
              value={work.work_type}
              onValueChange={(value) => onUpdate({ work_type: value })}
            >
              <SelectTrigger className="h-11 border-stone-200 focus:border-stone-400">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {workTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Content</label>
          <Textarea
            placeholder="Let your creativity flow..."
            value={work.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="min-h-[calc(100vh-400px)] text-lg leading-relaxed border-stone-200 focus:border-stone-400 resize-none"
          />
        </div>
      </div>
    </div>
  );
}