import React, { useState, useEffect, useRef } from 'react';
import { ADSENSE_CONFIG, ICONS } from '../constants';

interface AdRewardModalProps {
  onComplete: () => void;
  onClose: () => void;
  adsWatched: number;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdRewardModal: React.FC<AdRewardModalProps> = ({ onComplete, onClose, adsWatched }) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ADSENSE_CONFIG.AD_DURATION_SECONDS);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const adInitializedRef = useRef(false);

  // Detect AdBlock and Initialize AdSense
  useEffect(() => {
    const initAd = () => {
      try {
        if (adInitializedRef.current) return;
        adInitializedRef.current = true;
        
        // Push the ad request to AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        
        // Brief timeout to check if the ad element actually gets populated
        setTimeout(() => {
          const adIns = document.querySelector('.adsbygoogle-rewarded');
          if (adIns && adIns.innerHTML === '') {
            console.warn("AdSense ad failed to fill or was blocked.");
            setIsAdBlocked(true);
          } else {
            setIsAdLoaded(true);
          }
        }, 2000);
      } catch (e) {
        console.error("AdSense initialization error:", e);
        setIsAdBlocked(true);
      }
    };

    // Wait a tiny bit for the modal animation to settle before requesting ad
    const loadTimer = setTimeout(initAd, 800);
    return () => clearTimeout(loadTimer);
  }, []);

  // Reward Timer Logic
  useEffect(() => {
    // We start the timer regardless of ad load success to ensure user is not blocked
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 0.1;
        const currentProgress = ((ADSENSE_CONFIG.AD_DURATION_SECONDS - next) / ADSENSE_CONFIG.AD_DURATION_SECONDS) * 100;
        setProgress(Math.min(100, currentProgress));
        
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => onComplete(), 500);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#020617]/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-3xl px-6">
        
        {/* Ad Header */}
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black uppercase shadow-[0_0_15px_rgba(99,102,241,0.4)]">AD</div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Sponsored Content</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Rewards Active — {adsWatched + 1}/{ADSENSE_CONFIG.ADS_PER_CREDIT}</span>
             </div>
          </div>
          {timeLeft <= 0 ? (
            <button onClick={onClose} className="text-white text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors animate-pulse">Close & Claim</button>
          ) : (
            <div className="text-white text-[11px] font-black uppercase mono tracking-tighter flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              Reward in {Math.ceil(timeLeft)}s
            </div>
          )}
        </div>

        {/* Ad Body (AdSense Container) */}
        <div className="aspect-video glass rounded-[2.5rem] border border-white/10 overflow-hidden relative group shadow-2xl">
           
           {/* AdSense Placement */}
           <div className={`w-full h-full flex items-center justify-center bg-black/40 transition-opacity duration-1000 ${isAdLoaded && !isAdBlocked ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
              <ins className="adsbygoogle adsbygoogle-rewarded"
                   style={{ display: 'block', width: '100%', height: '100%' }}
                   data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
                   data-ad-slot={ADSENSE_CONFIG.SLOT_ID}
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
           </div>

           {/* Loading / Blocked Fallback State */}
           {(!isAdLoaded || isAdBlocked) && (
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900 to-purple-900/20 flex items-center justify-center animate-pulse">
                <div className="text-center space-y-6 px-12">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 mb-6 relative">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                      <div className="animate-spin-slow text-indigo-400">
                         <ICONS.Rocket />
                      </div>
                   </div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                     {isAdBlocked ? 'Neural Sync Mode' : 'Initializing Ad Stream'}
                   </h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed max-w-sm mx-auto">
                     {isAdBlocked 
                       ? 'Ad stream blocked. Processing alternate validation path to ensure your credit.' 
                       : 'Synchronizing with global success patterns to validate your build credit.'}
                   </p>
                </div>
             </div>
           )}

           {/* Progress Bar */}
           <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5">
              <div 
                className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
           </div>

           {/* Metadata Overlay */}
           <div className="absolute bottom-6 left-6 right-6 flex justify-between pointer-events-none">
              <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white/40 uppercase tracking-widest border border-white/5">Vibe Analytics v14.0</div>
              <div className="flex gap-2">
                 <div className="w-6 h-6 bg-black/40 backdrop-blur-md rounded-lg flex items-center justify-center text-white/40 text-[10px] border border-white/5">ⓘ</div>
              </div>
           </div>
        </div>

        {/* Ad Footer Info */}
        <div className="mt-8 text-center space-y-3">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-50">
             Partner Slot: {ADSENSE_CONFIG.SLOT_ID}
           </p>
           {timeLeft <= 0 && (
             <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest animate-bounce mt-4 flex items-center justify-center gap-2">
               <ICONS.Check /> Logic Validated. Credit Ready.
             </p>
           )}
        </div>

      </div>
    </div>
  );
};

export default AdRewardModal;