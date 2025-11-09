import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, Mic } from "lucide-react";

export default function EntryCard({ entry }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`${createPageUrl("TextEntry")}?id=${entry.id}`}>
        <Card className="h-full bg-white hover:border-stone-400 transition-colors border-stone-200 group">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-stone-500">
              {entry.entry_type === 'voice' && <Mic className="w-4 h-4" strokeWidth={1.5} />}
              <Calendar className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm">
                {format(new Date(entry.date), "MMM d, yyyy")}
              </span>
              {entry.mood && (
                <>
                  <span className="text-stone-300">•</span>
                  <span className="text-sm capitalize">{entry.mood}</span>
                </>
              )}
            </div>

            <h3 className="text-lg font-semibold text-stone-900 mb-2 line-clamp-2 group-hover:text-stone-700 transition-colors">
              {entry.title || `Entry from ${format(new Date(entry.date), "MMM d")}`}
            </h3>

            {entry.ai_summary && (
              <p className="text-sm text-stone-500 italic mb-3 line-clamp-2">
                {entry.ai_summary}
              </p>
            )}

            <p className="text-stone-700 line-clamp-4 leading-relaxed">
              {entry.content}
            </p>

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {entry.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}