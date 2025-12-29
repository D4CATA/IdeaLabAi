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
  generationsLeft: number;
}

const VibeForm: React.FC<VibeFormProps> = ({ vibe, setVibe, onGenerate, onUpgradeClick, isLoading, isPro, generationsLeft }) => {
  const handleTypeChange = (type: 'standard' | 'viral-vibe') => {
    if (type === 'viral-vibe' && !isPro) {
      onUpgradeClick();
      return;
    }
    setVibe(prev => ({ ...prev, blueprintType: type }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-10 md:p-16 rounded-[4rem] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-16">
      
      {/* Engine Selection */}
      <div className="space-y-8">
        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
          <ICONS.Layers /> ACCESS ENGINE SOURCE
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => handleTypeChange('standard')}
            className={`group p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden ${
              vibe.blueprintType === 'standard' 
              ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' 
              : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
            }`}
          >
            <div className="text-xl font-black mb-2">Standard Extraction</div>
            <p className="text-[11px] opacity-60 font-bold leading-relaxed">Proven SaaS logic and revenue patterns for steady growth.</p>
          </button>
          <button
            onClick={() => handleTypeChange('viral-vibe')}
            className={`group p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden ${
              vibe.blueprintType === 'viral-vibe' 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl' 
              : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200'
            }`}
          >
            {!isPro && (
              <div className="absolute top-6 right-6 bg-amber-400 text-slate-900 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest z-10 shadow-lg">
                LOCKED
              </div>
            )}
            <div className="text-xl font-black mb-2 flex items-center gap-2">
              Viral Engine Pro <ICONS.Sparkles />
            </div>
            <p className="text-[11px] opacity-60 font-bold leading-relaxed">Scans 1.5M+ high-yield patterns for exponential scaling.</p>
          </button>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-8">
          <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
            <ICONS.Sparkles /> VIBE CONFIGURATION
          </label>
          <div className="flex flex-wrap gap-3">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setVibe(prev => ({ ...prev, mood: m }))}
                className={`px-6 py-3.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
                  vibe.mood === m 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
             LOGIC OVERRIDES
          </label>
          <div className="space-y-4">
             {[
               { id: 'chaosMode', label: 'Radical Innovation', sub: 'High Risk / Pattern Divergence', icon: '⚡️' },
               { id: 'creatorMode', label: 'ROI Priority', sub: 'Profit First Revenue Logic', icon: '💰' }
             ].map((toggle) => (
               <button
                 key={toggle.id}
                 onClick={() => setVibe(prev => ({ ...prev, [toggle.id]: !prev[toggle.id] }))}
                 className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${
                   vibe[toggle.id as keyof VibeState] ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-50'
                 }`}
               >
                 <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${vibe[toggle.id as keyof VibeState] ? 'bg-white' : 'bg-slate-50'}`}>
                    {toggle.icon}
                   </div>
                   <div className="text-left leading-none">
                     <div className={`text-base font-black tracking-tight ${vibe[toggle.id as keyof VibeState] ? 'text-indigo-900' : 'text-slate-600'}`}>{toggle.label}</div>
                     <div className="text-[9px] uppercase tracking-widest font-black opacity-40 mt-1">{toggle.sub}</div>
                   </div>
                 </div>
                 <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${vibe[toggle.id as keyof VibeState] ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${vibe[toggle.id as keyof VibeState] ? 'left-7' : 'left-1'}`}></div>
                 </div>
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Main Generation CTA */}
      <div className="pt-12 border-t border-slate-50">
        <button
          onClick={onGenerate}
          disabled={isLoading || (generationsLeft <= 0 && !isPro)}
          className="group relative w-full h-24 overflow-hidden rounded-[2.5rem] transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {/* Enhanced Shimmer Layer */}
          <div className="absolute inset-0 bg-slate-900 transition-colors group-hover:bg-indigo-950"></div>
          <div className="absolute inset-0 premium-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative flex items-center justify-center gap-6 text-white font-black uppercase tracking-[0.3em] text-sm">
            {isLoading ? (
               <>
                 <div className="w-6 h-6 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                 ACCESSING THE 1.5M ENGINE...
               </>
            ) : (
               <>
                 <ICONS.Sparkles />
                 {isPro ? 'INITIALIZE PRO ACCESS ENGINE' : `ACCESS PATTERN ENGINE (${generationsLeft} LEFT)`}
                 <ICONS.ArrowRight />
               </>
            )}
          </div>
          
          {/* Animated Hover Glow */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </button>

        {!isPro && generationsLeft <= 0 && (
          <div className="text-center mt-8 p-6 rounded-3xl bg-indigo-50 border border-indigo-100 animate-in slide-in-from-bottom-2">
            <button onClick={onUpgradeClick} className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-800 transition-all underline decoration-2 underline-offset-8">
              DATABASE LIMIT REACHED. UNLOCK 1.5M WINNING PATTERNS →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibeForm;