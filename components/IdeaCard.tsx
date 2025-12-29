
import React, { useState, useCallback, memo } from 'react';
import { AppIdea, UserStats } from '../types';
import { ICONS, PAYPAL_BASE_URL } from '../constants';

interface IdeaCardProps {
  idea: AppIdea;
  userStats: UserStats;
  onRefine: () => void;
  isRefining: boolean;
  isSaved?: boolean;
  onSave?: (idea: AppIdea) => void;
  onRemove?: (id: string) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = memo(({ idea, userStats, onRefine, isRefining, isSaved, onSave, onRemove }) => {
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const isLocked = !userStats.isPro;

  const confidence = 92 + (idea.name.length % 7); 
  const rank = 12 + (idea.name.length % 88);

  const handleCopy = useCallback(() => {
    if (isLocked) return;
    navigator.clipboard.writeText(idea.promptPrototype);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [isLocked, idea.promptPrototype]);

  const handleShare = useCallback(() => {
    const text = `Check out this app blueprint from Idea Lab AI: ${idea.name}\n\nConcept: ${idea.coreConcept}\nAI Tool: ${idea.aiRecommendation}\n\nBuild yours at IdealabAI.com`;
    navigator.clipboard.writeText(text);
    setShareStatus('copied');
    setTimeout(() => setShareStatus('idle'), 2000);
  }, [idea]);

  const handleExport = useCallback(() => {
    window.print();
  }, []);

  const handleUnlock = useCallback(() => {
    const paypalUrl = `${PAYPAL_BASE_URL}/29`;
    window.open(paypalUrl, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="bg-white rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-30px_rgba(15,23,42,0.12)] border border-slate-100 animate-in fade-in slide-in-from-bottom-12 duration-1000 relative group/card transition-all hover:shadow-[0_80px_150px_-40px_rgba(79,70,229,0.15)] print:shadow-none print:border-none print:rounded-none">
      
      {/* Action Bar (Top Floating) */}
      <div className="absolute top-10 left-10 md:left-20 z-30 flex items-center gap-3 print:hidden">
        <button 
          onClick={handleShare}
          className={`p-4 rounded-2xl border transition-all hover:scale-110 active:scale-90 ${shareStatus === 'copied' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white/90 backdrop-blur border-slate-100 text-slate-400 hover:text-indigo-600'}`}
          title="Copy Share Link"
        >
          {shareStatus === 'copied' ? <ICONS.Check /> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
        </button>
        <button 
          onClick={handleExport}
          className="p-4 bg-white/90 backdrop-blur rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all hover:scale-110"
          title="Print / Export PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        </button>
        {isSaved && onRemove && (
          <button 
            onClick={() => onRemove(idea.id)}
            className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-500 transition-all hover:bg-rose-600 hover:text-white"
            title="Remove from Vault"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        )}
      </div>

      {/* Success Metrics Overlay */}
      <div className="absolute top-12 right-12 z-10 hidden lg:flex items-center gap-6 print:hidden" aria-hidden="true">
         <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SUCCESS RANK</div>
            <div className="text-3xl font-black text-slate-900 leading-none tracking-tighter italic"># {rank} PROJECTION</div>
         </div>
         <div className="w-20 h-20 rounded-[2rem] border-[6px] border-indigo-50 bg-indigo-600 flex items-center justify-center text-white text-base font-black shadow-2xl shadow-indigo-100 rotate-6 group-hover/card:rotate-0 transition-all">
           {confidence}%
         </div>
      </div>

      {/* Primary Header */}
      <div className="p-10 md:p-20 pb-0 pt-32 md:pt-40 flex flex-col xl:flex-row justify-between items-start gap-12">
        <div className="space-y-8 max-w-5xl w-full">
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em]">
              {idea.difficulty} EXTRACTION
            </span>
            {idea.tags.map((tag, idx) => (
              <span key={`${idea.id}-tag-${idx}`} className="px-6 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
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
        
        <div className="flex flex-col gap-4 w-full xl:w-96 shrink-0 print:hidden">
           <button 
             onClick={onRefine}
             disabled={isRefining}
             className="flex items-center justify-center gap-4 px-12 py-6 premium-gradient text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-indigo-200 group/btn"
           >
             {isRefining ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : <ICONS.Sparkles />}
             <span>
               {isRefining ? 'ENGINE ACTIVE...' : 'REFINE PATTERN'}
             </span>
           </button>

           {onSave && (
             <button 
               onClick={() => !isSaved && onSave(idea)}
               disabled={isSaved}
               className={`flex items-center justify-center gap-4 px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all ${
                 isSaved 
                 ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' 
                 : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-indigo-600 hover:text-indigo-600 hover:scale-105 active:scale-95'
               }`}
             >
               {isSaved ? <ICONS.Check /> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
               <span>{isSaved ? 'PATTERN SECURED' : 'SAVE TO VAULT'}</span>
             </button>
           )}
        </div>
      </div>

      {/* Winning Strategy Breakdown */}
      <div className="px-10 md:px-20 pt-16">
        <div className="p-12 md:p-16 rounded-[3.5rem] bg-indigo-50 border-2 border-indigo-100 space-y-8 relative overflow-hidden group/strategy transition-all hover:bg-white hover:border-indigo-300">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-indigo-900 group-hover/strategy:scale-125 transition-transform duration-1000" aria-hidden="true">
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
              <h4 className="text-slate-400 text-[10px] font-black uppercase tracking widest">ADDITIONAL STREAMS</h4>
              <div className="grid grid-cols-1 gap-4">
                {idea.monetization.additionalStreams?.map((stream, idx) => (
                  <div key={`${idea.id}-stream-${idx}`} className="flex items-center gap-4 text-sm font-bold text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
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
                <div key={`${idea.id}-feature-${i}`} className="flex gap-6 items-center p-7 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md group/feat">
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
          <div className="p-12 rounded-[4rem] bg-slate-900 text-white space-y-10 relative overflow-hidden min-h-[700px] border-beam print:border-none print:bg-slate-50 print:text-slate-900">
             <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform duration-1000 group-hover/card:rotate-0 print:hidden" aria-hidden="true">
                <ICONS.Crown />
             </div>
             
             <div className="space-y-8 relative z-30">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 print:bg-slate-900">
                      <ICONS.Sparkles />
                   </div>
                   <h3 className="text-indigo-400 text-[12px] font-black uppercase tracking-[0.6em] print:text-slate-500">
                      BEST VIBE CODING AI
                   </h3>
                </div>
                
                <div className="p-10 rounded-[3rem] bg-indigo-900/40 border border-indigo-500/30 space-y-6 transition-all hover:bg-indigo-900/60 group/tool print:bg-white print:border-slate-200">
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-4xl font-black shadow-3xl transition-transform group-hover/tool:scale-110 print:bg-slate-100 print:text-slate-900 print:shadow-none">
                      {idea.aiRecommendation?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="text-3xl font-black tracking-tighter mb-1 print:text-slate-900">{idea.aiRecommendation}</div>
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-80 print:text-slate-400">VERIFIED SUCCESS PAIRING</div>
                    </div>
                  </div>
                  <p className="text-lg font-medium leading-relaxed text-slate-300 italic px-2 border-l-2 border-indigo-500/30 print:text-slate-600 print:border-slate-300">
                    "{idea.aiReasoning || "This agent is optimal for the specific UI patterns indexed for this blueprint."}"
                  </p>
                </div>
             </div>

             <div className="space-y-10 relative">
               <div className={`space-y-6 transition-all duration-700 ${isLocked ? "blur-2xl opacity-10 pointer-events-none scale-95 print:blur-none print:opacity-100" : ""}`} aria-hidden={isLocked}>
                 <div className="space-y-4">
                    <h4 className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em] print:text-slate-500">VIRAL GROWTH HOOK</h4>
                    <div className="p-7 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 italic text-sm font-bold text-indigo-100 leading-relaxed print:bg-white print:border-slate-200 print:text-slate-800">
                      "{idea.viralStrategy.tiktokHook}"
                    </div>
                 </div>

                 <div className="space-y-5">
                   <div className="flex justify-between items-center print:hidden">
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
                   <div className="p-10 rounded-[3rem] bg-black/50 border border-white/5 font-mono text-xs leading-relaxed text-indigo-200/70 h-96 overflow-y-auto whitespace-pre-wrap selection:bg-indigo-500/50 custom-scrollbar print:bg-white print:border-slate-200 print:text-slate-600 print:h-auto">
                     {idea.promptPrototype}
                   </div>
                 </div>
               </div>

               {isLocked && (
                 <div className="absolute inset-x-0 -top-12 flex flex-col items-center justify-center z-40 bg-transparent animate-in zoom-in duration-700 print:hidden">
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
});

IdeaCard.displayName = 'IdeaCard';

export default IdeaCard;
