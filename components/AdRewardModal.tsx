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
        
        console.info("Idea Lab Engine: Requesting AdSense Sync...");

        // Push the ad request to AdSense global queue
        // We use a small timeout to ensure the DOM element is fully painted by React
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } else {
          console.warn("AdSense script not detected in global scope.");
          setIsAdBlocked(true);
        }
        
        // Monitoring period for ad fill
        const checkInterval = setInterval(() => {
          const adElement = document.querySelector('.adsbygoogle');
          // If AdSense successfully fills the tag, it adds data-ad-status="filled" or inserts an iframe
          if (adElement && (adElement.innerHTML !== '' || adElement.getAttribute('data-ad-status') === 'filled')) {
            console.info("Idea Lab Engine: AdSense Payload Received.");
            setIsAdLoaded(true);
            setIsAdBlocked(false);
            clearInterval(checkInterval);
          }
        }, 500);

        // Fail-safe timeout (4 seconds)
        setTimeout(() => {
          clearInterval(checkInterval);
          const adElement = document.querySelector('.adsbygoogle');
          if (adElement && adElement.innerHTML === '') {
            console.warn("AdSense Timeout: Site might be under review or domain not authorized.");
            setIsAdBlocked(true);
          }
        }, 4000);

      } catch (e) {
        console.error("AdSense runtime exception:", e);
        setIsAdBlocked(true);
      }
    };

    const loadTimer = setTimeout(initAd, 1000);
    return () => clearTimeout(loadTimer);
  }, []);

  // Reward Timer Logic (Independent of Ad Load)
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, prev - 0.1);
        const currentProgress = ((ADSENSE_CONFIG.AD_DURATION_SECONDS - next) / ADSENSE_CONFIG.AD_DURATION_SECONDS) * 100;
        setProgress(Math.min(100, currentProgress));
        
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#020617]/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-4xl px-6">
        
        {/* Ad Header */}
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-[12px] font-black uppercase shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/10">AD</div>
             <div className="flex flex-col">
                <span className="text-[12px] font-black text-white uppercase tracking-widest">Sponsored Intelligence</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Sync — {adsWatched + 1}/{ADSENSE_CONFIG.ADS_PER_CREDIT}</span>
             </div>
          </div>
          {timeLeft <= 0 ? (
            <button 
              onClick={onComplete} 
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              Claim Credit
            </button>
          ) : (
            <div className="text-white text-[11px] font-black uppercase mono tracking-tighter flex items-center gap-3 glass px-4 py-2 rounded-xl border-white/10">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              Reward Ready in {Math.ceil(timeLeft)}s
            </div>
          )}
        </div>

        {/* Ad Body (Fixed-Dimension AdSense Container) */}
        <div className="aspect-video glass rounded-[3rem] border border-white/10 overflow-hidden relative group shadow-[0_32px_128px_-16px_rgba(0,0,0,1)] bg-black/40">
           
           {/* AdSense Placement - MANDATORY DIMENSIONS AND CLASS */}
           <div className={`w-full h-full flex items-center justify-center transition-opacity duration-1000 ${isAdLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
              <ins className="adsbygoogle"
                   style={{ 
                     display: 'block', 
                     width: '100%', 
                     height: '100%',
                     minHeight: '280px', // Explicit dimensions for AdSense layout calculation
                     minWidth: '300px'
                   }}
                   data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
                   data-ad-slot={ADSENSE_CONFIG.SLOT_ID}
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
           </div>

           {/* Loading / Blocked Fallback State */}
           {(!isAdLoaded) && (
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-purple-950/20 flex items-center justify-center">
                <div className="text-center space-y-8 px-12 animate-in fade-in duration-1000">
                   <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10 mb-6 relative group">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
                      <div className="animate-spin-slow text-indigo-400 group-hover:text-white transition-colors">
                         <ICONS.Pulse />
                      </div>
                   </div>
                   <div className="space-y-4">
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                       {isAdBlocked ? 'Pattern Sync Active' : 'Loading Global Ad Stream'}
                     </h3>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] leading-relaxed max-w-sm mx-auto italic">
                       {isAdBlocked 
                         ? 'Ad restricted. Logic engine is manually verifying your build cycle to ensure credit continuity.' 
                         : 'Contacting success servers to authorize your session credit...'}
                     </p>
                   </div>
                </div>
             </div>
           )}

           {/* Progress Bar */}
           <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/5">
              <div 
                className="h-full bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,1)] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
           </div>

           {/* Metadata Overlay */}
           <div className="absolute bottom-8 left-8 right-8 flex justify-between pointer-events-none items-center">
              <div className="px-4 py-1.5 bg-black/60 backdrop-blur-xl rounded-full text-[9px] font-black text-white/50 uppercase tracking-widest border border-white/10">Vibe Analytics v14.0 — Security Layer: AES-256</div>
              <div className="flex gap-3">
                 <div className="px-3 py-1 bg-indigo-600/20 backdrop-blur-xl rounded-lg flex items-center justify-center text-indigo-400 text-[9px] font-bold border border-indigo-500/20 uppercase tracking-widest">Verified Partner</div>
              </div>
           </div>
        </div>

        {/* Ad Footer Info */}
        <div className="mt-10 text-center space-y-4">
           <div className="flex items-center justify-center gap-6">
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pub-ID: {ADSENSE_CONFIG.CLIENT_ID}</span>
             <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Slot-ID: {ADSENSE_CONFIG.SLOT_ID}</span>
           </div>
           {timeLeft <= 0 && (
             <div className="animate-in slide-in-from-bottom-4 duration-500">
               <p className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                 <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center text-[10px]"><ICONS.Check /></div> 
                 Build Logic Validated. Credit Ready to Claim.
               </p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default AdRewardModal;