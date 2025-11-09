import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { PenLine, Search } from "lucide-react";

export default function EmptyState({ searchQuery }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {searchQuery ? (
          <Search className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
        ) : (
          <PenLine className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
        )}
      </div>
      <h2 className="text-2xl font-semibold text-stone-900 mb-3">
        {searchQuery ? 'No Entries Found' : 'Start Your Journey'}
      </h2>
      <p className="text-stone-600 mb-8 max-w-md mx-auto">
        {searchQuery 
          ? `No entries match "${searchQuery}"`
          : 'Begin your journaling practice with your first entry'
        }
      </p>
      <Link to={createPageUrl("Journal")}>
        <Button className="bg-stone-900 hover:bg-stone-800 h-11 px-6">
          <PenLine className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Write First Entry
        </Button>
      </Link>
    </div>
  );
}