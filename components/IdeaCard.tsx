import React, { useState, useCallback, memo } from 'react';
import { AppIdea, UserStats } from '../types';
import { ICONS, PAYPAL_BASE_URL } from '../constants';

interface IdeaCardProps {
  idea: AppIdea;
  userStats: UserStats;
  onRefine: () => void;
  onMutate: () => void;
  onClaim?: () => void;
  isRefining: boolean;
  isSaved?: boolean;
  onSave?: (idea: AppIdea) => void;
  onRemove?: (id: string) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = memo(({ idea, userStats, onRefine, onMutate, onClaim, isRefining, isSaved, onSave, onRemove }) => {
  const [copied, setCopied] = useState(false);
  const isLocked = !userStats.isPro;

  const handleCopy = useCallback(() => {
    if (isLocked) return;
    navigator.clipboard.writeText(idea.promptPrototype);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [isLocked, idea.promptPrototype]);

  return (
    <div className="glass-card rounded-[3rem] overflow-hidden border border-white/5 transition-all duration-700 hover:border-indigo-500/30 group bg-slate-900/40">
      
      {/* Enhanced Mockup Showcase */}
      {idea.mockupImageUrl && (
        <div className="w-full h-[400px] overflow-hidden relative border-b border-white/5 group/mockup">
           <img 
            src={idea.mockupImageUrl} 
            alt={idea.name} 
            className="w-full h-full object-cover transition-all duration-1000 group-hover/mockup:scale-105"
           />
           {/* Glass Overlays for Depth */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80"></div>
           <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay"></div>
           
           <div className="absolute top-8 right-10 flex gap-2">
             <div className="glass px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80">AI Generated Concept</span>
             </div>
           </div>

           <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
             <div className="space-y-1">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Visual Direction</span>
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">{idea.name} Interface</h3>
             </div>
             <button className="glass p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <ICONS.Rocket />
             </button>
           </div>
        </div>
      )}

      {/* Blueprint Header */}
      <div className="p-10 md:p-14 flex flex-col lg:flex-row justify-between items-start gap-12">
        <div className="flex-grow space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">{idea.difficulty}</span>
            <span className="px-4 py-1.5 bg-white text-black rounded-lg text-[9px] font-black uppercase tracking-widest border border-white animate-pulse">{idea.successTag || "Must Succeed"}</span>
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] px-4 border-l border-white/10">{idea.vibeAesthetic}</span>
            <div className="flex gap-2">
              {idea.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-bold text-slate-500 uppercase tracking-widest">{tag}</span>
              ))}
            </div>
            {idea.isClaimed && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                 <ICONS.Shield /> PRIVATE
              </span>
            )}
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase group-hover:shimmer-text transition-all duration-1000">{idea.name}</h2>
          <p className="text-xl text-slate-300 max-w-4xl leading-relaxed font-medium italic">
            "{idea.coreConcept}"
          </p>
          
          <div className="flex items-center gap-6 pt-4">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recommended Tool</span>
               <span className="text-lg font-black text-white">{idea.toolRecommendation}</span>
             </div>
             <div className="w-px h-10 bg-white/10"></div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Originality Score</span>
               <div className="flex items-end gap-2">
                 <span className={`text-2xl font-black ${idea.originalityScore > 80 ? 'text-emerald-400' : 'text-white'}`}>{idea.originalityScore}</span>
                 <span className="text-[10px] font-bold text-slate-500 mb-1">/100</span>
               </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
          <button 
            onClick={onRefine}
            disabled={isRefining}
            className="w-full h-16 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 shadow-xl"
          >
            {isRefining ? 'Polishing...' : 'Make it Better'}
          </button>
          <button 
            onClick={onMutate}
            disabled={isRefining}
            className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:border-indigo-500 transition-all disabled:opacity-50"
          >
            Branch Variation
          </button>
          <div className="flex gap-2">
            {onClaim && !idea.isClaimed && (
              <button 
                onClick={onClaim}
                className="flex-grow h-16 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/20"
              >
                Claim Idea
              </button>
            )}
            {onSave && (
              <button 
                onClick={() => !isSaved && onSave(idea)}
                className={`w-16 h-16 rounded-2xl border-2 transition-all flex items-center justify-center ${isSaved ? 'bg-indigo-600/20 border-indigo-600/50 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                {isSaved ? <ICONS.Check /> : <ICONS.Bolt />}
              </button>
            )}
            {onRemove && (
              <button 
                onClick={() => onRemove(idea.id)}
                className="w-16 h-16 rounded-2xl border-2 border-white/5 text-slate-500 hover:text-red-500 transition-all flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Why Build This? - Visually Distinct Section */}
      <div className="px-10 md:px-14 pb-14">
        <div className="relative p-10 md:p-12 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20 group/why overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/why:opacity-20 transition-opacity">
            <ICONS.Lightbulb />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-indigo-500"></span>
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-400">Why Build This?</h3>
            </div>
            <p className="text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-tighter max-w-4xl">
              {idea.whyBuildThis}
            </p>
          </div>
          {/* Subtle Decorative Glow */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full"></div>
        </div>
      </div>

      {/* Competitor Intelligence Section */}
      <div className="p-10 md:p-14 bg-white/5 border-y border-white/5">
        <div className="flex items-center gap-4 mb-10">
           <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center">
             <ICONS.Pulse />
           </div>
           <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Market & Competitor Intel</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="space-y-4">
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Market Gaps</span>
             <ul className="space-y-2">
               {idea.marketGaps.map((gap, i) => (
                 <li key={i} className="text-sm font-bold text-slate-400 flex gap-3">
                   <span className="text-indigo-600">→</span> {gap}
                 </li>
               ))}
             </ul>
          </div>
          <div className="space-y-4">
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Unfair Advantage</span>
             <p className="text-sm font-bold text-slate-200 leading-relaxed italic">"{idea.competitiveEdge.unfairAdvantage}"</p>
          </div>
          <div className="space-y-4">
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Defensibility (Moat)</span>
             <div className="p-5 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-sm font-bold text-indigo-300">
               {idea.competitiveEdge.moat}
             </div>
          </div>
        </div>
      </div>

      {/* Execution Specs */}
      <div className="p-10 md:p-14 grid grid-cols-1 lg:grid-cols-2 gap-16 bg-black/20">
        <div className="space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Build Roadmap</h3>
          <div className="space-y-3">
            {idea.scalingRoadmap.slice(0, 3).map((step, i) => (
              <div key={i} className="flex gap-4 text-[11px] font-bold text-slate-400 mono p-4 bg-white/5 rounded-xl">
                <span className="text-indigo-400 font-black">{i+1}.</span> {step}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Revenue Logic</h3>
          <div className="p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-600/20 space-y-6">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Model</span>
                <span className="text-xl font-black text-white uppercase">{idea.monetization.pricingModel}</span>
             </div>
             <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic border-l-2 border-indigo-600/40 pl-4">
               {idea.monetization.strategy}
             </p>
          </div>
        </div>
      </div>

      {/* Build Terminal */}
      <div className="p-10 md:p-14 space-y-12 bg-black/40">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
                <ICONS.Sparkles />
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Master Build instructions</h3>
           </div>
           {!isLocked && (
             <button onClick={handleCopy} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all">
               {copied ? 'Copied to Clipboard' : 'Copy Build Roadmap'}
             </button>
           )}
        </div>

        <div className="relative">
           <div className={`p-12 rounded-[3rem] bg-black border border-white/5 mono text-[11px] leading-relaxed transition-all duration-1000 ${isLocked ? 'blur-3xl opacity-10 select-none' : 'text-indigo-400/80'}`}>
              <div className="space-y-8">
                 <div>
                   <span className="text-white font-bold block mb-4">// BUILDING_GUIDE_v1.0</span>
                   {idea.promptPrototype}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5 pt-10">
                    <div>
                      <span className="text-white font-bold block mb-4">// WHY_THIS_WINS</span>
                      {idea.aiRecommendation}
                    </div>
                    <div>
                       <span className="text-white font-bold block mb-4">// LOGIC_VALIDATION</span>
                       {idea.aiReasoning}
                    </div>
                 </div>
              </div>
           </div>
           
           {isLocked && (
             <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="glass p-12 rounded-[3rem] text-center space-y-8 max-w-sm border-white/20">
                   <div className="w-16 h-16 bg-white text-black rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,255,255,0.3)]"><ICONS.Lock /></div>
                   <div className="space-y-2">
                     <h4 className="text-2xl font-black text-white tracking-tight uppercase">Strategy Locked</h4>
                     <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Upgrade to PRO to unlock the 800+ word build instructions and claim this idea as private.</p>
                   </div>
                   <button 
                    onClick={() => window.open(`${PAYPAL_BASE_URL}/29`, '_blank')}
                    className="w-full h-16 premium-gradient text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                   >
                     Unlock Pro — $29
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
});

IdeaCard.displayName = 'IdeaCard';
export default IdeaCard;