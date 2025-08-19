import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  animate = true 
}) => {
  const baseClasses = 'rounded-xl shadow-lg border transition-all duration-300';
  
  const variants = {
    default: 'bg-white border-gray-200',
    dark: 'bg-gray-800 border-gray-700 text-white',
    glass: 'bg-white/10 backdrop-blur-md border-white/20 text-white',
    gradient: 'bg-gradient-to-br from-church-maroon to-church-darkMaroon text-white border-transparent'
  };
  
  const hoverClasses = hover ? 'hover:scale-105 hover:shadow-xl' : '';
  const animateClasses = animate ? 'animate-fade-in' : '';
  
  return (
    <div className={`
      ${baseClasses} 
      ${variants[variant]} 
      ${hoverClasses} 
      ${animateClasses}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
