import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/10 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} NISTIANS Confessions. All rights reserved.
            </p>
          </div>
          <div className="flex justify-center md:justify-end gap-6">
        
            <Link to="/contact" className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-300">
              Contact Us
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-pink-500 animate-pulse" /> by BOBITA
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

