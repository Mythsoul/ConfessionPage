import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useTheme } from '@/contexts/theme';
import { Sun, Moon } from 'lucide-react';

const Layout = ({ children }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#0a0b0f] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX }}
      />

      {theme === 'dark' && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        </div>
      )}

      <div className="relative z-10">
        <Navbar />
        <motion.main 
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>
        <Footer />
      </div>

      <motion.button
        onClick={toggleTheme}
        className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 
          ${theme === 'dark'
            ? 'bg-white/10 text-white hover:bg-white/20 hover:text-yellow-300'
            : 'bg-gray-900/10 text-gray-900 hover:bg-gray-900/20 hover:text-purple-600'
          }
          border border-white/10 hover:border-purple-500/50
          hover:shadow-purple-500/25 hover:scale-110
          hidden
        `}
        whileHover={{ rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: theme === 'dark' ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default Layout;

