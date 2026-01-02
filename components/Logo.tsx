import React from 'react';

export const IdeaLabLogo = ({ size = 40, className = "" }: { size?: number, className?: string }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-700`}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <g filter="url(#glow)">
        <circle cx="50" cy="50" r="8" fill="url(#logoGradient)"/>
        
        <circle cx="30" cy="35" r="4.5" fill="url(#logoGradient)" opacity="0.9"/>
        <circle cx="70" cy="35" r="4.5" fill="url(#logoGradient)" opacity="0.9"/>
        <circle cx="30" cy="65" r="4.5" fill="url(#logoGradient)" opacity="0.9"/>
        <circle cx="70" cy="65" r="4.5" fill="url(#logoGradient)" opacity="0.9"/>
        
        <line x1="30" y1="35" x2="50" y2="50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <line x1="70" y1="35" x2="50" y2="50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <line x1="30" y1="65" x2="50" y2="50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <line x1="70" y1="65" x2="50" y2="50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      </g>
      
      <path 
        d="M50 18 L54 26 L62 24 L56 30 L60 38 L50 34 L40 38 L44 30 L38 24 L46 26 Z" 
        fill="#ffffff"
        className="animate-pulse"
      />
    </svg>
  );
};

export const IdeaLabLogoFull = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { logo: 32, text: "text-md" },
    md: { logo: 40, text: "text-xl" },
    lg: { logo: 56, text: "text-3xl" }
  };
  
  const current = sizes[size] || sizes.md;
  
  return (
    <div className="flex items-center gap-4 group">
      <div className="relative transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
        <IdeaLabLogo size={current.logo} />
        <div className="absolute inset-0 bg-indigo-500/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="flex flex-col">
        <span className={`${current.text} font-black tracking-tighter text-white leading-none uppercase`}>
          Idea Lab
        </span>
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-400 mt-1">
          The Success Engine
        </span>
      </div>
    </div>
  );
};