import React from 'react';

// Refined Neural Mesh Logo (Background-free)
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
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      
      {/* Neural Core */}
      <circle cx="50" cy="50" r="7" fill="url(#logoGradient)"/>
      
      {/* Nodes */}
      <circle cx="30" cy="35" r="4" fill="url(#logoGradient)" opacity="0.8"/>
      <circle cx="70" cy="35" r="4" fill="url(#logoGradient)" opacity="0.8"/>
      <circle cx="30" cy="65" r="4" fill="url(#logoGradient)" opacity="0.8"/>
      <circle cx="70" cy="65" r="4" fill="url(#logoGradient)" opacity="0.8"/>
      
      {/* Connections */}
      <line x1="30" y1="35" x2="50" y2="50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      <line x1="70" y1="35" x2="50" y2="50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      <line x1="30" y1="65" x2="50" y2="50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      <line x1="70" y1="65" x2="50" y2="50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      
      {/* Accent Pulse */}
      <path 
        d="M50 22 L53 30 L61 28 L55 34 L59 42 L50 38 L41 42 L45 34 L39 28 L47 30 Z" 
        fill="url(#logoGradient)"
        opacity="0.9"
        className="animate-pulse"
      />
    </svg>
  );
};

export const IdeaLabLogoFull = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { logo: 32, text: "text-lg" },
    md: { logo: 40, text: "text-2xl" },
    lg: { logo: 56, text: "text-4xl" }
  };
  
  const current = sizes[size] || sizes.md;
  
  return (
    <div className="flex items-center gap-3 group">
      <div className="relative transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
        <IdeaLabLogo size={current.logo} />
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="flex flex-col">
        <span className={`${current.text} font-black tracking-tighter text-slate-900 leading-none group-hover:text-indigo-600 transition-colors`}>
          IDEA LAB AI
        </span>
        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mt-0.5">
          Success Engine
        </span>
      </div>
    </div>
  );
};