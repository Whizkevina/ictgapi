import React, { useState } from "react";
import logo from "./Winners-Logo.webp";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black/95 backdrop-blur-md shadow-2xl sticky top-0 z-50 border-b border-church-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
            <div className="relative">
              <img 
                src={logo} 
                alt="Winners Logo" 
                className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-church-gold/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="hidden lg:block">
              <span className="text-white font-display font-bold text-lg bg-gradient-to-r from-white to-church-gold bg-clip-text text-transparent">
                Living Faith Church
              </span>
            </div>
            <div className="hidden md:block lg:hidden">
              <span className="text-white font-display font-bold text-base">
                LFCWW
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="relative text-gray-300 hover:text-church-gold transition-all duration-300 font-medium group"
            >
              <span>Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-church-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/LiveService" 
              className="relative text-gray-300 hover:text-church-gold transition-all duration-300 font-medium group"
            >
              <span className="flex items-center space-x-1">
                <span>Live Service</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-church-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/youtube-service" 
              className="relative text-gray-300 hover:text-church-gold transition-all duration-300 font-medium group"
            >
              <span className="flex items-center space-x-1">
                <span>YouTube Service</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-church-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            {/* CTA Button */}
            <Link
              to="/UserCheck"
              className="bg-gradient-to-r from-church-maroon to-red-600 text-white px-4 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <span className="flex items-center space-x-2">
                <span>🔴</span>
                <span>Join Live</span>
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/90 backdrop-blur-md rounded-lg mt-2 border border-church-gold/20">
              <Link
                to="/"
                className="text-gray-300 hover:text-church-gold block px-3 py-2 text-base font-medium transition-colors rounded-lg hover:bg-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center space-x-2">
                  <span>🏠</span>
                  <span>Home</span>
                </span>
              </Link>
              <Link
                to="/LiveService"
                className="text-gray-300 hover:text-church-gold block px-3 py-2 text-base font-medium transition-colors rounded-lg hover:bg-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center space-x-2">
                  <span>📺</span>
                  <span>Live Service</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </span>
              </Link>
              <Link
                to="/youtube-service"
                className="text-gray-300 hover:text-church-gold block px-3 py-2 text-base font-medium transition-colors rounded-lg hover:bg-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center space-x-2">
                  <span>🎬</span>
                  <span>YouTube Service</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </span>
              </Link>
              <Link
                to="/UserCheck"
                className="block px-3 py-2 mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="bg-gradient-to-r from-church-maroon to-red-600 text-white px-4 py-2 rounded-lg font-semibold text-center">
                  🔴 Join Live Service
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
