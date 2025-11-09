import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenLine, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import EntryCard from "../components/entries/EntryCard";
import EmptyState from "../components/entries/EmptyState";
import MoodFilter from "../components/entries/MoodFilter";

export default function EntriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['entries', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.DiaryEntry.filter({ created_by: user.email }, "-date");
    },
    initialData: [],
    enabled: !!user?.email,
  });

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = selectedMood === "all" || entry.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
                Your Entries
              </h1>
              <p className="text-stone-600">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <Link to={createPageUrl("Journal")}>
              <Button className="bg-stone-900 hover:bg-stone-800 text-white h-11 px-6">
                <PenLine className="w-4 h-4 mr-2" strokeWidth={1.5} />
                New Entry
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-stone-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <MoodFilter selectedMood={selectedMood} onMoodChange={setSelectedMood} />

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white rounded-lg animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : filteredEntries.length > 0 ? (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}