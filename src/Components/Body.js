import React from 'react';
import background from './bbackground.jpg';
import { Link } from 'react-router-dom';
import logo from './Winners-Logo.webp'; // Correctly import the logo

const Body = () => {
  return (
    <div className="relative min-h-screen bg-gray-900 text-white font-sans">
      {/* Background Image with a darker, more subtle overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${background})`,
        }}
      />
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          
          {/* Logo */}
          <div className="mb-6">
            <img src={logo} alt="Living Faith Church Logo" className="mx-auto h-24 md:h-32 w-auto" />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold font-display bg-gradient-to-r from-gray-200 via-yellow-400 to-gray-200 bg-clip-text text-transparent leading-tight">
            Living Faith Church Worldwide
          </h1>
          
          {/* Subtitle */}
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Home of Signs and Wonders
          </p>
          
          {/* Divider */}
          <div className="my-8 w-24 h-1 bg-yellow-400/50 mx-auto rounded-full"></div>
          
          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link 
              to="/UserCheck" 
              className="inline-block px-10 py-4 text-lg font-semibold text-white bg-red-600 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50"
            >
              Join Live Service
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <a 
                href="https://play.google.com/store/apps/details?id=com.winnersworlwide" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 text-white border border-gray-400 rounded-full transition-colors duration-300 hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-gray-400/50"
              >
                Download App
              </a>
              
              <a 
                href="https://domimedia.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 text-white border border-gray-400 rounded-full transition-colors duration-300 hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-gray-400/50"
              >
                Domi Radio
              </a>
            </div>
          </div>
          
        </div>
        
        {/* Footer Status (optional, can be placed in a separate footer component) */}
        <div className="absolute bottom-8 text-center w-full">
            <div className="inline-flex items-center space-x-3 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full border border-yellow-400/30">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-semibold">LIVE</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-white">Service Available Now</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Body;
