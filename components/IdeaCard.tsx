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
    <div className={`glass-card rounded-[3rem] overflow-hidden border transition-all duration-700 group bg-slate-900/40 ${idea.isClaimed ? 'border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-indigo-500/30'}`}>
      
      {/* Enhanced Mockup Showcase */}
      {idea.mockupImageUrl && (
        <div className="w-full h-[450px] overflow-hidden relative border-b border-white/5 group/mockup">
           <img 
            src={idea.mockupImageUrl} 
            alt={idea.name} 
            className="w-full h-full object-cover transition-all duration-1000 group-hover/mockup:scale-105"
           />
           {/* Glass Overlays for Depth */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90"></div>
           <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay"></div>
           
           <div className="absolute top-8 right-10 flex gap-3">
             {idea.isClaimed && (
                <div className="glass px-5 py-2.5 rounded-full border border-emerald-500/30 flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md animate-in zoom-in">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Vault Protected</span>
                </div>
             )}
             <div className="glass px-5 py-2.5 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80">ID: {idea.id.slice(0,8)}</span>
             </div>
           </div>

           <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
             <div className="space-y-1">
               <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-[8px] font-black text-white/60 uppercase tracking-widest border border-white/5">Synthesized by {idea.synthesizedBy || 'Alpha-Mind'}</span>
               </div>
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{idea.difficulty} Tier Prototype</span>
               <h3 className="text-3xl font-black text-white uppercase tracking-tight">{idea.name}</h3>
             </div>
             <button className="glass p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group/btn shadow-2xl">
                <div className="group-hover/btn:translate-x-1 transition-transform">
                  <ICONS.Rocket />
                </div>
             </button>
           </div>
        </div>
      )}

      {/* Blueprint Header */}
      <div className="p-10 md:p-14 flex flex-col lg:flex-row justify-between items-start gap-12">
        <div className="flex-grow space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">v14.0 Engine</span>
            <span className="px-4 py-1.5 bg-white text-black rounded-lg text-[9px] font-black uppercase tracking-widest border border-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              {idea.successTag || "High Alpha"}
            </span>
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] px-4 border-l border-white/10">{idea.vibeAesthetic}</span>
            <div className="flex gap-2">
              {idea.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-bold text-slate-500 uppercase tracking-widest">{tag}</span>
              ))}
            </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase group-hover:shimmer-text transition-all duration-1000">{idea.name}</h2>
          <p className="text-xl text-slate-300 max-w-4xl leading-relaxed font-medium italic">
            "{idea.coreConcept}"
          </p>
          
          <div className="flex items-center gap-8 pt-4">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recommended Tech</span>
               <span className="text-lg font-black text-white">{idea.toolRecommendation}</span>
             </div>
             <div className="w-px h-10 bg-white/10"></div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Viral Potential</span>
               <div className="flex items-end gap-2">
                 <span className={`text-2xl font-black ${idea.originalityScore > 80 ? 'text-emerald-400' : 'text-white'}`}>{idea.originalityScore}%</span>
                 <span className="text-[10px] font-bold text-slate-500 mb-1">PROBABILITY</span>
               </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0">
          <button 
            onClick={onRefine}
            disabled={isRefining}
            className="w-full h-16 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 shadow-xl"
          >
            {isRefining ? 'Polishing Logic...' : 'Optimize Strategy'}
          </button>
          
          <div className="flex gap-2">
            {onClaim && (
              <button 
                onClick={onClaim}
                disabled={idea.isClaimed}
                className={`flex-grow h-16 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl border ${
                  idea.isClaimed 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                  : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-500 active:scale-95'
                }`}
              >
                {idea.isClaimed ? (
                  <>
                    <ICONS.Check /> CLAIMED PRIVATE
                  </>
                ) : (
                  <>
                    <ICONS.Shield /> CLAIM THIS IDEA
                  </>
                )}
              </button>
            )}
            {onSave && (
              <button 
                onClick={() => !isSaved && onSave(idea)}
                className={`w-16 h-16 rounded-2xl border-2 transition-all flex items-center justify-center ${isSaved ? 'bg-indigo-600/20 border-indigo-600/50 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
              >
                {isSaved ? <ICONS.Check /> : <ICONS.Bolt />}
              </button>
            )}
          </div>
          <button 
            onClick={onMutate}
            disabled={isRefining}
            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] hover:text-white hover:border-white/30 transition-all disabled:opacity-50"
          >
            Generate Mutant Branch
          </button>
        </div>
      </div>

      {/* Competitor Analysis Section */}
      <div className="mx-10 md:mx-14 mb-14 p-12 rounded-[3rem] bg-slate-900/60 border border-white/5 space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                <ICONS.Pulse />
             </div>
             <div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Competitor Intelligence</h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Defensibility Analysis v2.4</p>
             </div>
          </div>
          <div className="hidden md:flex gap-8">
             <div className="text-right">
               <span className="text-[9px] font-black text-slate-600 uppercase block">Market Saturation</span>
               <span className="text-xs font-black text-white">LOW_DENSITY</span>
             </div>
             <div className="text-right">
               <span className="text-[9px] font-black text-slate-600 uppercase block">Moat Strength</span>
               <span className="text-xs font-black text-emerald-400">REINFORCED</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Market Gaps */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Structural Gaps</span>
            </div>
            <div className="space-y-3">
              {(idea.marketGaps || []).map((gap, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[12px] font-bold text-slate-300 leading-relaxed">
                  {gap}
                </div>
              ))}
            </div>
          </div>

          {/* Unfair Advantage */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest">Unfair Advantage</span>
            </div>
            <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 relative group/advantage">
               <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">!</div>
               <p className="text-sm font-bold text-slate-200 leading-relaxed italic">
                 "{idea.competitiveEdge?.unfairAdvantage || 'Strategic Positioning'}"
               </p>
            </div>
          </div>

          {/* The Moat */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Defensibility Moat</span>
            </div>
            <div className="space-y-4">
               <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 border-dashed">
                 <p className="text-[12px] font-bold text-emerald-100/70 leading-relaxed">
                   {idea.competitiveEdge?.moat || 'Logic-based entry barrier via proprietary data mapping.'}
                 </p>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full w-fit border border-emerald-500/20">
                 <ICONS.Shield />
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Locked Strategy</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Reviews / Neural Feedback */}
      <div className="mx-10 md:mx-14 mb-14 space-y-8">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">Neural Feedback Loop</span>
          <div className="flex-grow h-px bg-white/5"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(idea.socialProof || []).map((review, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-6 hover:bg-white/[0.04] transition-colors group/review">
              <p className="text-sm font-medium text-slate-400 leading-relaxed italic group-hover/review:text-slate-200 transition-colors">"{review.quote}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-black border border-white/10 shadow-lg">
                     {review.authorName?.[0] || review.platform[0]}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">{review.authorName || 'Market Analyst'}</span>
                      <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Verified {review.platform}</span>
                   </div>
                </div>
                <div className="flex gap-1.5">
                   {[...Array(5)].map((_, j) => <div key={j} className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>)}
                </div>
              </div>
            </div>
          ))}
          {/* Simulation Placeholder */}
          <div className="p-8 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-3 opacity-40 hover:opacity-100 transition-opacity cursor-default">
             <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                <ICONS.Pulse />
             </div>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Synthesizing live market sentiment...</p>
          </div>
        </div>
      </div>

      {/* Why Build This? */}
      <div className="px-10 md:px-14 pb-14">
        <div className="relative p-12 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 group/why overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover/why:opacity-20 transition-opacity">
            <ICONS.Lightbulb />
          </div>
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <span className="w-12 h-px bg-indigo-500"></span>
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-400">The Ultimate Lever</h3>
            </div>
            <p className="text-3xl md:text-4xl font-black text-white leading-tight uppercase tracking-tighter max-w-4xl">
              {idea.whyBuildThis}
            </p>
          </div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/20 blur-[120px] rounded-full"></div>
        </div>
      </div>

      {/* Execution Specs & Monetization */}
      <div className="p-10 md:p-14 grid grid-cols-1 lg:grid-cols-2 gap-16 bg-black/20 border-t border-white/5">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
                <ICONS.Layers />
             </div>
             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Build Roadmap</h3>
          </div>
          <div className="space-y-4">
            {(idea.scalingRoadmap || []).slice(0, 4).map((step, i) => (
              <div key={i} className="flex gap-5 text-[12px] font-bold text-slate-300 mono p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <span className="text-indigo-400 font-black">{i+1}.</span> {step}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
                <ICONS.Engine />
             </div>
             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Revenue Logic</h3>
          </div>
          <div className="p-10 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 space-y-8 relative overflow-hidden">
             <div className="flex justify-between items-center">
                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Pricing Model</span>
                <span className="text-2xl font-black text-white uppercase tracking-tighter">{idea.monetization?.pricingModel || 'Subscription'}</span>
             </div>
             <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Primary Strategy</span>
                <p className="text-[13px] font-bold text-slate-300 leading-relaxed italic border-l-4 border-indigo-600/40 pl-6">
                  {idea.monetization?.strategy || 'High-LTV capture through niche automation.'}
                </p>
             </div>
             <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Est. LTV</span>
                <span className="text-sm font-black text-emerald-400">{idea.monetization?.ltvEstimate || '$1,200'}</span>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px]"></div>
          </div>
        </div>
      </div>

      {/* Build Terminal */}
      <div className="p-10 md:p-14 space-y-12 bg-black/40 border-t border-white/5">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white text-black rounded-3xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-6">
                <ICONS.Sparkles />
              </div>
              <div>
                <h3 className="text-[13px] font-black uppercase tracking-[0.4em] text-white">Neural Blueprint</h3>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Build-Ready Logic Structure</p>
              </div>
           </div>
           {!isLocked && (
             <button onClick={handleCopy} className="px-8 py-3 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
               {copied ? 'Copied Roadmap' : 'Copy System Instructions'}
             </button>
           )}
        </div>

        <div className="relative">
           <div className={`p-12 rounded-[3.5rem] bg-black border border-white/5 mono text-[12px] leading-relaxed transition-all duration-1000 ${isLocked ? 'blur-3xl opacity-10 select-none pointer-events-none' : 'text-indigo-400/80'}`}>
              <div className="space-y-10">
                 <div>
                   <span className="text-white font-black block mb-6 text-[10px] tracking-widest uppercase opacity-40"># SYSTEM_INSTRUCTIONS_v1.0.4</span>
                   <div className="whitespace-pre-wrap">{idea.promptPrototype}</div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/5 pt-12">
                    <div className="space-y-4">
                      <span className="text-white font-black block text-[10px] tracking-widest uppercase opacity-40"># SUCCESS_FACTORS</span>
                      <p className="font-bold text-slate-300">{idea.aiRecommendation}</p>
                    </div>
                    <div className="space-y-4">
                       <span className="text-white font-black block text-[10px] tracking-widest uppercase opacity-40"># LOGIC_VERIFICATION</span>
                       <p className="font-bold text-slate-300">{idea.aiReasoning}</p>
                    </div>
                 </div>
              </div>
           </div>
           
           {isLocked && (
             <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="glass p-14 rounded-[3.5rem] text-center space-y-10 max-w-sm border border-white/20 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                   <div className="w-20 h-20 bg-white text-black rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,255,255,0.3)] rotate-3">
                     <ICONS.Lock />
                   </div>
                   <div className="space-y-4">
                     <h4 className="text-3xl font-black text-white tracking-tighter uppercase">Blueprint Locked</h4>
                     <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-[0.2em]">Upgrade to the <span className="text-indigo-400">Pro Engine</span> to unlock the 800+ word execution roadmap and claim this niche exclusively.</p>
                   </div>
                   <button 
                    onClick={() => window.open(`${PAYPAL_BASE_URL}/29`, '_blank')}
                    className="w-full h-18 premium-gradient text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     ACTIVATE PRO — $29
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