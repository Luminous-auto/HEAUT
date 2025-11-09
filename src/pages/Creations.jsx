import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import CreativeWorkCard from '../components/creations/CreativeWorkCard';
import { motion, AnimatePresence } from 'framer-motion';

function EmptyCreationsState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Wand2 className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-semibold text-stone-900 mb-3">
        Begin Your Next Creation
      </h2>
      <p className="text-stone-600 mb-8 max-w-md mx-auto">
        Start a new poem, essay, or story and collaborate with your AI partner.
      </p>
      <Link to={createPageUrl("CreativeEditor")}>
        <Button className="bg-stone-900 hover:bg-stone-800 h-11 px-6">
          <Wand2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Start Creating
        </Button>
      </Link>
    </div>
  );
}

export default function CreationsPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: works, isLoading } = useQuery({
    queryKey: ['creativeWorks', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.CreativeWork.filter({ created_by: user.email }, '-updated_date');
    },
    initialData: [],
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
                Your Creations
              </h1>
              <p className="text-stone-600">
                A gallery of your creative works.
              </p>
            </div>
            <Link to={createPageUrl("CreativeEditor")}>
              <Button className="bg-stone-900 hover:bg-stone-800 text-white h-11 px-6">
                <Wand2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                New Creation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white rounded-lg animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : works.length > 0 ? (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            <AnimatePresence>
              {works.map((work) => (
                <CreativeWorkCard key={work.id} work={work} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyCreationsState />
        )}
      </div>
    </div>
  );
}