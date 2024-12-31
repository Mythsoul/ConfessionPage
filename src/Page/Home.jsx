import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ConfessionCard from '../components/confession-card';
import NewConfession from './confession-page';
import { get_confessions } from '@/appwrite/functions';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
export default function HomePage() {
  const [latestConfessions, setLatestConfessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestConfessions();
  }, []);

  const fetchLatestConfessions = async () => {
    try {
      setIsLoading(true);
      const response = await get_confessions();
      setLatestConfessions(response.documents.slice(0, 4));
    } catch (error) {
      console.error("Failed to fetch confessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="text-center space-y-8 py-16 max-w-4xl mx-auto px-4">
        <motion.h1 
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
            NISTIANS Confessions
          </span>
        </motion.h1>
        <motion.p 
          className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Share your thoughts anonymously with fellow NISTians. Your secrets are safe with us.
        </motion.p>
      </section>

      <NewConfession onConfessionAdded={fetchLatestConfessions} />

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Latest Confessions</h2>
          <button
            onClick={() => navigate('/confessions')}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors duration-300"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton
                key={`skeleton-${i}`}
                className="h-[200px] rounded-2xl"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))
          ) : (
            latestConfessions.map((confession, index) => (
              <motion.div
                key={confession.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ConfessionCard
                  confession={confession}
                  onUpdate={fetchLatestConfessions}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

