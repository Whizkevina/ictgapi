import React from 'react';
import unitLogo from './ictgroup_logo.png';

const Footer = () => {
    return ( 
        <footer className="bg-gray-900 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    
                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-church-gold">Quick Links</h3>
                        <div className="space-y-2">
                            <a 
                                href="https://ftwinnersictg.org/membership-application-form/" 
                                target='_blank' 
                                rel="noopener noreferrer"
                                className="block text-gray-300 hover:text-church-gold transition-colors"
                            >
                                🌟 Join ICTG
                            </a>
                            <a 
                                href="http://radio.shoutcastmedia.net:8302/stream" 
                                target='_blank' 
                                rel="noopener noreferrer"
                                className="block text-gray-300 hover:text-church-gold transition-colors"
                            >
                                📻 Domi Radio
                            </a>
                            <a 
                                href="https://ftwinnersictg.org/download-our-mobile-apps/" 
                                target='_blank' 
                                rel="noopener noreferrer"
                                className="block text-gray-300 hover:text-church-gold transition-colors"
                            >
                                📱 Download Winners World App
                            </a>
                        </div>
                    </div>
                    
                    {/* About Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-church-gold">About Us</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Living Faith Church Worldwide - Home of Signs and Wonders. 
                            Join us for inspiring live services and connect with our global community.
                        </p>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-church-gold">Connect With Us</h3>
                        <div className="text-gray-300 text-sm space-y-1">
                            <p>📍 Canaanland, Ota, Ogun State</p>
                            <p>🌐 www.ftwinnersictg.org</p>
                            <p>📧 info@ftwinnersictg.org</p>
                        </div>
                    </div>
                </div>
                
                {/* Bottom Section */}
                <div className="border-t border-gray-700 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        
                        {/* Copyright */}
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm">
                                © 2025 Living Faith Church Worldwide. All rights reserved.
                            </p>
                        </div>
                        
                        {/* Powered By */}
                        <div className="flex items-center space-x-3">
                            <img 
                                src={unitLogo} 
                                alt="ICT Group Logo" 
                                className="w-8 h-8 object-contain"
                            />
                            <span className="text-gray-400 text-sm">
                                Powered by ICTGroup, Canaanland
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
 
export default Footer;