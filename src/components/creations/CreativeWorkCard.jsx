import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function CreativeWorkCard({ work }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`${createPageUrl("CreativeEditor")}?id=${work.id}`}>
        <Card className="h-full bg-white hover:border-stone-400 transition-colors border-stone-200 group">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-stone-500">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">{work.work_type}</span>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2 line-clamp-2 group-hover:text-stone-700 transition-colors">
              {work.title}
            </h3>
            <p className="text-stone-700 line-clamp-3 leading-relaxed">
              {work.content}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}