import React, { useState, useEffect, useRef } from 'react';
import { ADMOB_CONFIG, ICONS } from '../constants';

interface AdRewardModalProps {
  onComplete: () => void;
  onClose: () => void;
  adsWatched: number;
}

const AdRewardModal: React.FC<AdRewardModalProps> = ({ onComplete, onClose, adsWatched }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ADMOB_CONFIG.AD_DURATION_SECONDS);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Simulate loading/initialization
    const loadTimer = setTimeout(() => setIsPlaying(true), 1500);
    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 0.1;
          setProgress(((ADMOB_CONFIG.AD_DURATION_SECONDS - next) / ADMOB_CONFIG.AD_DURATION_SECONDS) * 100);
          return Math.max(0, next);
        });
      }, 100);
    } else if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      const finishTimer = setTimeout(() => onComplete(), 500);
      return () => clearTimeout(finishTimer);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft, onComplete]);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#020617]/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-2xl px-6">
        
        {/* Ad Header */}
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black uppercase">AD</div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Sponsored Content</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Rewards Enabled — {adsWatched + 1}/{ADMOB_CONFIG.ADS_PER_CREDIT}</span>
             </div>
          </div>
          {timeLeft <= 0 ? (
            <button onClick={onClose} className="text-white text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors">Close</button>
          ) : (
            <div className="text-white text-[11px] font-black uppercase mono tracking-tighter">Reward in {Math.ceil(timeLeft)}s</div>
          )}
        </div>

        {/* Ad Body (Simulated Player) */}
        <div className="aspect-video glass rounded-[2.5rem] border border-white/10 overflow-hidden relative group">
           {/* Abstract Background for the "Ad" */}
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900 to-purple-900/20 animate-pulse"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 px-12">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 mb-6 scale-110">
                    <div className={`transition-all duration-1000 ${isPlaying ? 'rotate-180' : 'rotate-0'}`}>
                       <ICONS.Rocket />
                    </div>
                 </div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Idea Lab Success Patterns</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed">Analyzing 1.5M viral loops to predict your next 6-figure exit.</p>
              </div>
           </div>

           {/* Progress Bar */}
           <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5">
              <div 
                className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
           </div>

           {/* Mute/Info Overlay */}
           <div className="absolute bottom-6 left-6 right-6 flex justify-between">
              <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white/40 uppercase tracking-widest">Vibe Analytics v14.0</div>
              <div className="flex gap-2">
                 <div className="w-6 h-6 bg-black/40 backdrop-blur-md rounded-lg flex items-center justify-center text-white/40 cursor-pointer hover:text-white transition-colors">ⓘ</div>
              </div>
           </div>
        </div>

        {/* Ad Footer */}
        <div className="mt-8 text-center space-y-2">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ad Unit: {ADMOB_CONFIG.REWARDED_UNIT_ID}</p>
           {timeLeft <= 0 && (
             <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest animate-bounce mt-4">✓ Ad Finished. Syncing Credit Progress...</p>
           )}
        </div>

      </div>
    </div>
  );
};

export default AdRewardModal;