import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            onLoadingComplete?.();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-church-maroon to-black">
      <div className="text-center space-y-8">
        {/* Church Icon */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-church-gold to-yellow-400 rounded-full flex items-center justify-center animate-pulse-glow mx-auto">
            <span className="text-4xl">⛪</span>
          </div>
          <div className="absolute -inset-2 bg-gradient-to-br from-church-gold/20 to-yellow-400/20 rounded-full animate-ping"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
            Living Faith Church
          </h2>
          <p className="text-church-gold font-medium">Preparing your spiritual experience...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-church-gold to-yellow-400 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">{Math.round(progress)}% loaded</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-church-gold rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-church-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-church-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
