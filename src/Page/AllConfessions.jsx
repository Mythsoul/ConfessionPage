import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ConfessionCard from '../components/confession-card';
import { get_confessions } from "../appwrite/functions";
import { Skeleton } from '../components/ui/skeleton';
import { Filter, SortDesc, Search } from 'lucide-react';

export default function ConfessionsPage() {
  const [confessions, setConfessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const observer = useRef();

  const lastConfessionRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  useEffect(() => {
    fetchConfessions();
  }, [page, sortBy, searchTerm]);

  const fetchConfessions = async () => {
    try {
      setIsLoading(true);
      const response = await get_confessions();
      let filteredConfessions = response.documents;

      if (searchTerm) {
        filteredConfessions = filteredConfessions.filter(conf => 
          conf.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      filteredConfessions.sort((a, b) => {
        if (sortBy === 'latest') return new Date(b.$createdAt) - new Date(a.$createdAt);
        if (sortBy === 'popular') return (b.likes || 0) - (a.likes || 0);
        return 0;
      });

      setConfessions(filteredConfessions);
      setHasMore(filteredConfessions.length >= page * 10);
    } catch (error) {
      console.error("Failed to fetch confessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">All Confessions</h1>
        <p className="text-gray-400">Discover all the confessions shared by NISTians</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 backdrop-blur-lg rounded-2xl p-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search confessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-black/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/20 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="latest" className='text-black'>Latest</option>
              <option value="popular" className='text-black' >Most Liked</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <SortDesc className="w-4 h-4" />
          <span>{confessions.length} confessions</span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {isLoading && page === 1 ? (
          [...Array(4)].map((_, i) => (
            <Skeleton
              key={`skeleton-${i}`}
              className="h-[200px] rounded-2xl"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))
        ) : (
          confessions.slice(0, page * 10).map((confession, index) => (
            <motion.div
              key={confession.$id}
              ref={index === confessions.length - 1 ? lastConfessionRef : null}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <ConfessionCard
                confession={confession}
                onUpdate={fetchConfessions}
              />
            </motion.div>
          ))
        )}
      </div>

      {isLoading && page > 1 && (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
