import React, { useState } from 'react';
import { AppIdea, UserStats } from '../types';
import { ICONS, PAYPAL_BASE_URL } from '../constants';

interface IdeaCardProps {
  idea: AppIdea;
  userStats: UserStats;
  onRefine: () => void;
  isRefining: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, userStats, onRefine, isRefining }) => {
  const [copied, setCopied] = useState(false);
  const isLocked = !userStats.isPro;

  const confidence = Math.floor(Math.random() * 10) + 90; 
  const rank = Math.floor(Math.random() * 100) + 1;

  const handleCopy = () => {
    if (isLocked) return;
    navigator.clipboard.writeText(idea.promptPrototype);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnlock = () => {
    const paypalUrl = `${PAYPAL_BASE_URL}/29`;
    window.open(paypalUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-30px_rgba(15,23,42,0.12)] border border-slate-100 animate-in fade-in slide-in-from-bottom-12 duration-1000 relative group/card transition-all hover:shadow-[0_80px_150px_-40px_rgba(79,70,229,0.15)]">
      
      {/* Success Metrics Overlay */}
      <div className="absolute top-12 right-12 z-10 hidden lg:flex items-center gap-6">
         <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SUCCESS RANK</div>
            <div className="text-3xl font-black text-slate-900 leading-none tracking-tighter italic"># {rank} PROJECTION</div>
         </div>
         <div className="w-20 h-20 rounded-[2rem] border-[6px] border-indigo-50 bg-indigo-600 flex items-center justify-center text-white text-base font-black shadow-2xl shadow-indigo-100 rotate-6 group-hover/card:rotate-0 transition-all">
           {confidence}%
         </div>
      </div>

      {/* Primary Header */}
      <div className="p-10 md:p-20 pb-0 flex flex-col xl:flex-row justify-between items-start gap-12">
        <div className="space-y-8 max-w-5xl w-full">
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em]">
              {idea.difficulty} EXTRACTION
            </span>
            {idea.tags.map((tag, idx) => (
              <span key={idx} className="px-6 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                {tag}
              </span>
            ))}
            <span className="text-indigo-500 text-[11px] font-black uppercase tracking-[0.5em] italic ml-2">{idea.vibeAesthetic}</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter">
            {idea.name}
          </h2>
          <p className="text-2xl md:text-4xl text-slate-600 leading-tight font-medium tracking-tight opacity-80">
            {idea.coreConcept}
          </p>
        </div>
        
        <div className="flex flex-col gap-6 w-full xl:w-96 shrink-0">
           <button 
             onClick={onRefine}
             disabled={isRefining}
             className="flex items-center justify-center gap-4 px-12 py-7 premium-gradient text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-indigo-200 group/btn"
           >
             {isRefining ? (
               <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : <ICONS.Sparkles />}
             <span>
               {isRefining ? 'ACCESSING ENGINE...' : 'REFINE FOR SUCCESS'}
             </span>
           </button>
        </div>
      </div>

      {/* Winning Strategy Breakdown */}
      <div className="px-10 md:px-20 pt-16">
        <div className="p-12 md:p-16 rounded-[3.5rem] bg-indigo-50 border-2 border-indigo-100 space-y-8 relative overflow-hidden group/strategy transition-all hover:bg-white hover:border-indigo-300">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-indigo-900 group-hover/strategy:scale-125 transition-transform duration-1000">
            <ICONS.Layers />
          </div>
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <ICONS.Check />
            </div>
            <h3 className="text-indigo-700 text-[12px] font-black uppercase tracking-[0.6em]">
               THE STRATEGY BLUEPRINT
            </h3>
          </div>
          <p className="text-indigo-900 text-3xl md:text-5xl font-black leading-[1.1] tracking-tight max-w-6xl italic">
            {idea.whyBuildThis}
          </p>
        </div>
      </div>

      {/* Grid: Profit & Features vs Tool Vault */}
      <div className="px-10 md:px-20 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Revenue Logic */}
        <div className="lg:col-span-5 space-y-16">
          <div className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-200 space-y-10 shadow-sm transition-all hover:border-indigo-200">
            <div className="space-y-4">
              <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em]">REVENUE EXTRACTION</h3>
              <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{idea.monetization.pricingModel}</p>
              <p className="text-base font-bold text-slate-600 leading-relaxed">{idea.monetization.strategy}</p>
            </div>

            <div className="space-y-6 pt-10 border-t border-slate-200/60">
              <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">ADDITIONAL STREAMS</h4>
              <div className="grid grid-cols-1 gap-4">
                {idea.monetization.additionalStreams?.map((stream, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-sm font-bold text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px]">
                      <ICONS.Check />
                    </div>
                    {stream}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-4">
              <ICONS.Layers /> KEY ARCHITECTURE
            </h4>
            <div className="grid grid-cols-1 gap-5">
              {idea.keyFeatures.map((f, i) => (
                <div key={i} className="flex gap-6 items-center p-7 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md group/feat">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black group-hover/feat:bg-indigo-600 transition-colors">
                    {i + 1}
                  </div>
                  <span className="text-slate-800 text-lg font-bold leading-tight tracking-tight">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Access Vault */}
        <div className="lg:col-span-7 space-y-12">
          <div className="p-12 rounded-[4rem] bg-slate-900 text-white space-y-10 relative overflow-hidden min-h-[700px] border-beam">
             <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform duration-1000 group-hover/card:rotate-0">
                <ICONS.Crown />
             </div>
             
             {/* Public Part: The Tool Recommendation Teaser */}
             <div className="space-y-8 relative z-30">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                      <ICONS.Sparkles />
                   </div>
                   <h3 className="text-indigo-400 text-[12px] font-black uppercase tracking-[0.6em]">
                      BEST VIBE CODING AI
                   </h3>
                </div>
                
                <div className="p-10 rounded-[3rem] bg-indigo-900/40 border border-indigo-500/30 space-y-6 transition-all hover:bg-indigo-900/60 group/tool">
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-4xl font-black shadow-3xl transition-transform group-hover/tool:scale-110">
                      {idea.aiRecommendation?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="text-3xl font-black tracking-tighter mb-1">{idea.aiRecommendation}</div>
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-80">VERIFIED SUCCESS PAIRING</div>
                    </div>
                  </div>
                  <p className="text-lg font-medium leading-relaxed text-slate-300 italic px-2 border-l-2 border-indigo-500/30">
                    "{idea.aiReasoning || "This agent is optimal for the specific UI patterns indexed for this blueprint."}"
                  </p>
                </div>
             </div>

             {/* Locked Strategy & Prompts */}
             <div className="space-y-10 relative">
               <div className={`space-y-6 transition-all duration-700 ${isLocked ? "blur-2xl opacity-10 pointer-events-none scale-95" : ""}`}>
                 <div className="space-y-4">
                    <h4 className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em]">VIRAL GROWTH HOOK</h4>
                    <div className="p-7 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 italic text-sm font-bold text-indigo-100 leading-relaxed">
                      "{idea.viralStrategy.tiktokHook}"
                    </div>
                 </div>

                 <div className="space-y-5">
                   <div className="flex justify-between items-center">
                     <h4 className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em]">MASTER AGENT PROMPT</h4>
                     {!isLocked && (
                       <button 
                         onClick={handleCopy}
                         className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all active:scale-95"
                       >
                         {copied ? 'COPIED TO CLIPBOARD' : 'COPY MASTER PROMPT'}
                       </button>
                     )}
                   </div>
                   <div className="p-10 rounded-[3rem] bg-black/50 border border-white/5 font-mono text-xs leading-relaxed text-indigo-200/70 h-96 overflow-y-auto whitespace-pre-wrap selection:bg-indigo-500/50 custom-scrollbar">
                     {idea.promptPrototype}
                   </div>
                 </div>
               </div>

               {/* Locked CTA Overlay */}
               {isLocked && (
                 <div className="absolute inset-x-0 -top-12 flex flex-col items-center justify-center z-40 bg-transparent animate-in zoom-in duration-700">
                    <div className="w-full p-12 rounded-[4rem] bg-white text-center space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-indigo-50">
                       <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-4xl shadow-indigo-600/40 animate-bounce">
                          <ICONS.Lock />
                       </div>
                       <div className="space-y-4">
                          <h5 className="text-4xl font-black text-slate-900 tracking-tighter">Unlock Master Blueprint</h5>
                          <p className="text-base text-slate-500 font-bold leading-relaxed px-10">
                            Get the 800-word <strong>Master Prompt</strong> and viral execution strategy from our 1.5M database.
                          </p>
                       </div>
                       <button 
                        onClick={handleUnlock}
                        className="w-full py-8 premium-gradient text-white rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.3em] hover:scale-[1.03] active:scale-95 transition-all shadow-3xl shadow-indigo-100 shimmer overflow-hidden"
                       >
                         ACCESS FULL PATTERN — $29
                       </button>
                       <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Instant Unlock // One-Time Access Engine</p>
                    </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;