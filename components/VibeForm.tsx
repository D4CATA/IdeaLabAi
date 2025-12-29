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
  const handleTypeChange = (type: 'standard' | 'viral-vibe') => {
    if (type === 'viral-vibe' && !isPro) {
      onUpgradeClick();
      return;
    }
    setVibe(prev => ({ ...prev, blueprintType: type }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto glass p-10 md:p-14 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.12)] space-y-12 animate-in fade-in slide-in-from-bottom-8">
      
      {/* Core Protocol Selection */}
      <div className="space-y-6">
        <label className="tracking-hyper text-slate-400 flex items-center gap-3">
          <ICONS.Engine /> CORE PROTOCOL
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleTypeChange('standard')}
            className={`group p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden ${
              vibe.blueprintType === 'standard' 
              ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' 
              : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
            }`}
          >
            <div className="text-xl font-extrabold mb-1">Foundational Sync</div>
            <p className="text-[11px] opacity-60 font-semibold leading-relaxed">Proven SaaS logic for stable scaling.</p>
          </button>
          <button
            onClick={() => handleTypeChange('viral-vibe')}
            className={`group p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden ${
              vibe.blueprintType === 'viral-vibe' 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' 
              : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
            }`}
          >
            {!isPro && (
              <div className="absolute top-4 right-4 bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-10">
                LOCKED
              </div>
            )}
            <div className="text-xl font-extrabold mb-1 flex items-center gap-2">
              Neural Override <ICONS.Bolt />
            </div>
            <p className="text-[11px] opacity-60 font-semibold leading-relaxed">Advanced patterns for exponential viral growth.</p>
          </button>
        </div>
      </div>

      {/* Config Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <label className="tracking-hyper text-slate-400 flex items-center gap-3">
            <ICONS.Sparkles /> NEURAL ATMOSPHERE
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setVibe(prev => ({ ...prev, mood: m }))}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all border-2 ${
                  vibe.mood === m 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <label className="tracking-hyper text-slate-400 flex items-center gap-3">
             LOGIC PARAMETERS
          </label>
          <div className="grid grid-cols-1 gap-3">
             {[
               { id: 'chaosMode', label: 'Entropy Factor', icon: <ICONS.Bolt /> },
               { id: 'creatorMode', label: 'ROI Priority', icon: <ICONS.Shield /> }
             ].map((toggle) => (
               <button
                 key={toggle.id}
                 onClick={() => setVibe(prev => ({ ...prev, [toggle.id]: !prev[toggle.id] }))}
                 className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all hover:scale-[1.01] ${
                   vibe[toggle.id as keyof VibeState] ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-50'
                 }`}
               >
                 <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${vibe[toggle.id as keyof VibeState] ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {toggle.icon}
                   </div>
                   <span className={`text-sm font-bold ${vibe[toggle.id as keyof VibeState] ? 'text-indigo-900' : 'text-slate-600'}`}>{toggle.label}</span>
                 </div>
                 <div className={`w-10 h-5 rounded-full relative transition-colors ${vibe[toggle.id as keyof VibeState] ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${vibe[toggle.id as keyof VibeState] ? 'left-5.5' : 'left-0.5'}`}></div>
                 </div>
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Core Action */}
      <div className="pt-8 border-t border-slate-100">
        <button
          onClick={() => isVerified && onGenerate()}
          disabled={isLoading || !isVerified || (generationsLeft <= 0 && !isPro)}
          className={`group relative w-full h-20 overflow-hidden rounded-[2rem] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-40 ${!isVerified ? 'cursor-not-allowed grayscale' : ''}`}
        >
          {/* Animated Liquid Background */}
          <div className="absolute inset-0 bg-slate-900 transition-transform group-hover:scale-110 duration-700"></div>
          <div className="absolute inset-0 premium-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute inset-0 shimmer opacity-10"></div>
          
          <div className="relative z-10 flex items-center justify-center gap-5 text-white">
            {!isVerified ? (
              <>
                <ICONS.Lock />
                <span className="tracking-hyper text-xs">VERIFICATION REQUIRED TO EXECUTE</span>
              </>
            ) : isLoading ? (
               <>
                 <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                 <span className="tracking-hyper text-xs">SYNTHESIZING PATTERNS...</span>
               </>
            ) : (
               <>
                 <ICONS.Bolt />
                 <span className="tracking-hyper text-xs">
                   {isPro ? 'INITIALIZE NEURAL CORE' : `EXECUTE GENERATION (${generationsLeft} LEFT)`}
                 </span>
                 <ICONS.ArrowRight />
               </>
            )}
          </div>
        </button>

        {!isPro && generationsLeft <= 0 && isVerified && (
          <div className="text-center mt-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
            <button onClick={onUpgradeClick} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-800 transition-all">
              NEURAL LIMIT REACHED. UNLOCK THE 1.5M CORE →
            </button>
          </div>
        )}
        
        {!isVerified && (
          <div className="text-center mt-6 p-5 rounded-2xl bg-amber-50 border border-amber-100">
             <p className="text-amber-800 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
               Identity Synthesis Incomplete. Check your email to activate features.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibeForm;