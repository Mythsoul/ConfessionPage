import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Lock } from 'lucide-react';
import { add_confessions } from "../appwrite/functions";
import { useToast } from '../hooks/use-toast';
import confetti from 'canvas-confetti';

export default function NewConfession({ onConfessionAdded }) {
  const [newConfession, setNewConfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const triggerConfetti = () => {
    const end = Date.now() + 1000;
    const colors = ['#a855f7', '#ec4899'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newConfession.trim()) {
      setIsSubmitting(true);
      try {
        await add_confessions(newConfession);
        setNewConfession("");
        onConfessionAdded();
        triggerConfetti();
        toast({
          title: "Confession submitted! 🎉",
          description: "Your secret is safe with us!",
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to submit confession:", error);
        toast({
          title: "Error",
          description: "Failed to submit confession. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden group"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Lock className="w-4 h-4" />
          <span>Anonymous • Only NISTians can see this</span>
        </div>
        <textarea 
          placeholder="Share your deepest secrets..." 
          value={newConfession}
          onChange={(e) => setNewConfession(e.target.value)}
          className="w-full min-h-[120px] bg-black/20 rounded-xl border-0 placeholder:text-gray-500 text-white resize-none p-4 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
        />
        <motion.button 
          type="submit" 
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {isSubmitting ? 'Confessing...' : 'Confess Anonymously'}
        </motion.button>
      </div>
    </motion.form>
  );
}

