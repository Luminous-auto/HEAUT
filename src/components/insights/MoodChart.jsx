import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function MoodChart({ entries }) {
  const getMoodData = () => {
    const moodCounts = {};
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });

    return Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood: mood.charAt(0).toUpperCase() + mood.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count);
  };

  const data = getMoodData();

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 bg-white border-stone-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-stone-900">Mood Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="mood" stroke="#78716c" style={{ fontSize: '12px' }} />
            <YAxis stroke="#78716c" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e7e5e4',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <Bar dataKey="count" fill="#292524" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}