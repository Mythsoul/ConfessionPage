import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, AlertTriangle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <motion.span 
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              NISTIANS
            </motion.span>
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link to="/">
              <motion.button 
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === '/' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Home</span>
              </motion.button>
            </Link>
            <Link to="/confessions">
              <motion.button 
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === '/confessions'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Confessions</span>
              </motion.button>
            </Link>
            <Link to="/complaints">
              <motion.button 
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === '/complaints'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AlertTriangle className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Complaints</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

