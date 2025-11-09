import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, History, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AnalysisHistory({ analyses, onSelectAnalysis, selectedAnalysisId, isLoading }) {
  return (
    <Card className="bg-white border-stone-200 h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
          <CardTitle className="text-lg font-semibold text-stone-900">Analysis History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-stone-600">No analyses generated yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {analyses.map(analysis => (
              <Button
                key={analysis.id}
                variant={selectedAnalysisId === analysis.id ? 'default' : 'ghost'}
                onClick={() => onSelectAnalysis(analysis)}
                className={`w-full justify-start h-auto py-2 px-3 ${
                  selectedAnalysisId === analysis.id 
                    ? "bg-stone-900 hover:bg-stone-800"
                    : "hover:bg-stone-100"
                }`}
              >
                <Calendar className="w-4 h-4 mr-3" strokeWidth={1.5} />
                <span className="font-medium">
                  {format(new Date(analysis.date), 'MMMM d, yyyy')}
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}