import React from 'react';
import { MOODS, ICONS } from '../constants';
import { VibeState } from '../types';

interface VibeFormProps {
  vibe: VibeState;
  setVibe: React.Dispatch<React.SetStateAction<VibeState>>;
  onGenerate: () => void;
  onUpgradeClick: () => void;
  isLoading: boolean;
  isPro: boolean;
  isVerified: boolean;
  generationsLeft: number;
}

const VibeForm: React.FC<VibeFormProps> = ({ vibe, setVibe, onGenerate, onUpgradeClick, isLoading, isPro, isVerified, generationsLeft }) => {
  return (
    <div className="w-full max-w-5xl mx-auto glass-card p-10 md:p-14 rounded-[3rem] space-y-12 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] border-white/10">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Core Settings */}
        <div className="space-y-8">
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 block">Foundation</label>
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setVibe(prev => ({ ...prev, blueprintType: 'solid-saas' }))}
              className={`p-8 rounded-[2rem] border-2 transition-all text-left ${
                vibe.blueprintType === 'solid-saas' 
                ? 'border-indigo-600 bg-indigo-600/10' 
                : 'border-white/5 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-xl font-black mb-1">Solid SaaS</div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Built for recurring revenue and long-term stability.</p>
            </button>
            <button
              onClick={() => setVibe(prev => ({ ...prev, blueprintType: 'viral-growth' }))}
              className={`p-8 rounded-[2rem] border-2 transition-all text-left ${
                vibe.blueprintType === 'viral-growth' 
                ? 'border-indigo-600 bg-indigo-600/10' 
                : 'border-white/5 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-xl font-black mb-1">Viral Growth</div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High-velocity logic designed to capture markets fast.</p>
            </button>
          </div>
        </div>

        {/* Style & Vibe */}
        <div className="space-y-8">
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 block">The Vibe</label>
          <div className="flex flex-wrap gap-2.5">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => setVibe(prev => ({ ...prev, mood: m }))}
                className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  vibe.mood === m ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button
              onClick={() => setVibe(prev => ({ ...prev, chaosMode: !prev.chaosMode }))}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${vibe.chaosMode ? 'bg-indigo-600/20 border-indigo-600/40' : 'bg-white/5 border-white/10'}`}
             >
               <span className="text-[10px] font-black uppercase tracking-widest">Wild Mode</span>
               <div className={`w-3 h-3 rounded-full ${vibe.chaosMode ? 'bg-indigo-400' : 'bg-white/20'}`}></div>
             </button>
             <button
              onClick={() => setVibe(prev => ({ ...prev, creatorMode: !prev.creatorMode }))}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${vibe.creatorMode ? 'bg-indigo-600/20 border-indigo-600/40' : 'bg-white/5 border-white/10'}`}
             >
               <span className="text-[10px] font-black uppercase tracking-widest">Profit Focus</span>
               <div className={`w-3 h-3 rounded-full ${vibe.creatorMode ? 'bg-indigo-400' : 'bg-white/20'}`}></div>
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
        <div className="text-center md:text-left">
           <p className="text-[12px] font-black uppercase tracking-[0.3em] text-indigo-400">Strategist is Ready</p>
           <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Available Credits: {isPro ? 'Unlimited' : generationsLeft}</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading || !isVerified || (!isPro && generationsLeft <= 0)}
          className="group relative h-20 w-full md:w-96 overflow-hidden rounded-2xl transition-all active:scale-[0.98] disabled:opacity-20 shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute inset-0 premium-gradient group-hover:scale-105 transition-transform duration-700"></div>
          <div className="relative z-10 flex items-center justify-center gap-4 text-white font-black text-[11px] uppercase tracking-[0.4em]">
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span>Synthesize New Idea</span> <ICONS.ArrowRight /></>}
          </div>
        </button>
      </div>
    </div>
  );
};

export default VibeForm;