import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InsightCard({ title, icon: Icon, content }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="h-full bg-white border-stone-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
            <CardTitle className="text-lg font-semibold text-stone-900">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}