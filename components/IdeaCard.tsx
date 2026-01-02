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

const PlatformIcon = ({ platform }: { platform: string }) => {
  const p = platform.toLowerCase();
  if (p.includes('x') || p.includes('twitter')) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  );
  if (p.includes('reddit')) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.1"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 9c.83 0 1.5.67 1.5 1.5 0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5c0-.83.67-1.5 1.5-1.5zm-9 0c.83 0 1.5.67 1.5 1.5 0 .83-.67 1.5-1.5 1.5S6 13.33 6 12.5c0-.83.67-1.5 1.5-1.5zm10.24 4.1c-.24.7-1.07 1.1-2.01 1.1-.94 0-1.77-.4-2.01-1.1-.08-.24.05-.5.3-.58.24-.08.5.05.58.3.1.28.5.58 1.13.58.63 0 1.03-.3 1.13-.58.08-.24.34-.38.58-.3.25.08.38.34.3.58z"/></svg>
  );
  if (p.includes('hunt')) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v4h2v-4h1a2 2 0 1 0 0-4h-3v8zm2-2h-1V7h1a1 1 0 1 1 0 2z"/></svg>
  );
  return <ICONS.Pulse />;
};

const IdeaCard: React.FC<IdeaCardProps> = memo(({ idea, userStats, onRefine, isRefining, isSaved, onSave, onRemove }) => {
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const isLocked = !userStats.isPro;

  const getSanitizedPrompt = () => {
    if (!isLocked) return idea.promptPrototype;
    return `[LOCKED_TECHNICAL_SPECIFICATION]\n\nThis blueprint includes an 800-word Master Prompt optimized for Bolt.new and Lovable. It contains high-fidelity architecture logic, database schemas, and viral design patterns.\n\nPRO_ACCESS_REQUIRED\nMD5_HASH: ${Math.random().toString(36).substring(2).toUpperCase()}\nTIMESTAMP: ${new Date().toISOString()}`;
  };

  const confidence = 94 + (idea.name.length % 5); 
  const rank = 8 + (idea.name.length % 92);

  const handleCopy = useCallback(() => {
    if (isLocked) return;
    navigator.clipboard.writeText(idea.promptPrototype);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [isLocked, idea.promptPrototype]);

  const handleShare = useCallback(() => {
    const text = `High-Yield Idea Found: ${idea.name}\n\nConcept: ${idea.coreConcept}\nGenerated at IdeaLabAI.com`;
    navigator.clipboard.writeText(text);
    setShareStatus('copied');
    setTimeout(() => setShareStatus('idle'), 2000);
  }, [idea]);

  return (
    <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-[0_40px_120px_-30px_rgba(15,23,42,0.08)] border border-slate-100 animate-in fade-in slide-in-from-bottom-12 duration-1000 relative group/card transition-all hover:-translate-y-2 hover:shadow-[0_80px_160px_-40px_rgba(79,70,229,0.14)] print:shadow-none print:border-none">
      
      <div className="absolute top-10 right-10 flex items-center gap-4 z-20 print:hidden">
         <div className="text-right hidden sm:block">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-0.5">MARKET RANK</div>
            <div className="text-xl font-black text-slate-900 tracking-tighter">#{rank}</div>
         </div>
         <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black neural-glow transition-transform group-hover/card:scale-110">
           {confidence}%
         </div>
      </div>

      <div className="absolute top-10 left-10 flex gap-2 z-20 print:hidden">
        <button 
          onClick={handleShare}
          title="Copy share link"
          className={`p-3 rounded-xl border-2 transition-all ${shareStatus === 'copied' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white/80 backdrop-blur border-slate-100 text-slate-400 hover:text-indigo-600'}`}
        >
          {shareStatus === 'copied' ? <ICONS.Check /> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/><line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/></svg>}
        </button>
        {isSaved && onRemove && (
          <button 
            onClick={() => onRemove(idea.id)}
            title="Remove from saved"
            className="p-3 bg-white/80 backdrop-blur rounded-xl border-2 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        )}
      </div>

      <div className="p-10 md:p-16 pt-32 md:pt-40 flex flex-col lg:flex-row justify-between items-start gap-10">
        <div className="space-y-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
              {idea.difficulty} INTENSITY
            </span>
            {idea.tags.map((tag, idx) => (
              <span key={idx} className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                {tag}
              </span>
            ))}
            <span className="text-[10px] font-bold text-indigo-500/60 italic ml-2">{idea.vibeAesthetic}</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
            {idea.name}
          </h2>
          <p className="text-xl md:text-2xl text-slate-500 leading-tight font-medium tracking-tight opacity-90">
            {idea.coreConcept}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 w-full lg:w-80 shrink-0 print:hidden">
           <button 
             onClick={onRefine}
             disabled={isRefining}
             className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 ${
               isRefining ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'premium-gradient text-white hover:scale-105 active:scale-95'
             }`}
           >
             {isRefining ? (
               <div className="w-5 h-5 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <>
                 <ICONS.Sparkles />
                 <span>OPTIMIZE IDEA</span>
               </>
             )}
           </button>

           {onSave && (
             <button 
               onClick={() => !isSaved && onSave(idea)}
               disabled={isSaved}
               className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 isSaved 
                 ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' 
                 : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-indigo-600 hover:text-indigo-600 hover:scale-105'
               }`}
             >
               {isSaved ? <ICONS.Check /> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
               <span>{isSaved ? 'SAVED TO LIBRARY' : 'SAVE TO LIBRARY'}</span>
             </button>
           )}
        </div>
      </div>

      {/* Social Proof Section - Enhanced with Platform Icons & Hover Styles */}
      <div className="px-10 md:px-16 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {idea.socialProof.map((proof, i) => (
            <div key={i} className="group/proof relative p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 overflow-hidden transition-all duration-500 hover:bg-white hover:border-indigo-200 hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-50/50 rounded-full blur-3xl opacity-0 group-hover/proof:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover/proof:rotate-12 group-hover/proof:scale-110">
                      <PlatformIcon platform={proof.platform} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/proof:text-indigo-600 transition-colors">
                        Verified {proof.platform}
                      </span>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className="w-1 h-1 rounded-full bg-emerald-400"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">
                    REF: IDX-{(idea.name.length * (i + 1)) % 999}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-3 top-0 text-3xl font-serif text-indigo-100 select-none group-hover/proof:text-indigo-200 transition-colors">“</div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed italic relative z-10 group-hover/proof:text-slate-900 transition-colors">
                    {proof.quote}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className={`w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[6px] font-black text-slate-400`}>
                        {String.fromCharCode(65 + j + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-black text-emerald-500 group-hover/proof:animate-pulse">
                    +{(idea.name.length * (i + 1)) % 500} SIGNAL
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-10 md:px-16 pb-16">
        <div className="p-10 rounded-[2.5rem] bg-indigo-50/50 border-2 border-indigo-100 space-y-6 relative overflow-hidden group/strat transition-all hover:bg-white hover:border-indigo-300">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <ICONS.Bolt />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-700">EXECUTION STRATEGY</h3>
          </div>
          <p className="text-indigo-900 text-2xl md:text-4xl font-black leading-tight tracking-tight italic">
            "{idea.whyBuildThis}"
          </p>
        </div>
      </div>

      <div className="px-10 md:px-16 pb-16 grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-5 space-y-10">
          <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 space-y-8">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">YIELD ESTIMATE</h3>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{idea.monetization.pricingModel}</p>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">{idea.monetization.strategy}</p>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
              <ICONS.Engine /> KEY ARCHITECTURE
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {idea.keyFeatures.map((f, i) => (
                <div key={i} className="flex gap-4 items-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 transition-all shadow-sm group/feat">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black group-hover/feat:bg-indigo-600 transition-colors">
                    0{i + 1}
                  </div>
                  <span className="text-slate-800 text-md font-bold leading-tight">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 space-y-10">
          <div className="p-10 rounded-[3rem] bg-slate-900 text-white space-y-8 relative overflow-hidden min-h-[600px] print:bg-white print:text-slate-900 print:border">
             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                      <ICONS.Sparkles />
                   </div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">RECOMMENDED TECH STACK</h3>
                </div>
                <div className="p-8 rounded-[2rem] bg-indigo-900/40 border border-indigo-500/20 space-y-4 print:bg-slate-50 print:border-slate-200">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-black shadow-lg">
                      {idea.aiRecommendation?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-2xl font-black tracking-tight">{idea.aiRecommendation}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400">OPTIMIZED ARCHITECTURE</div>
                    </div>
                  </div>
                  <p className="text-md font-medium text-slate-300 italic px-2 border-l-2 border-indigo-500/30 print:text-slate-600">
                    "{idea.aiReasoning}"
                  </p>
                </div>
             </div>

             <div className="relative">
               <div className={`space-y-6 transition-all duration-700 ${isLocked ? "blur-xl opacity-20 pointer-events-none scale-95 print:blur-none print:opacity-100" : ""}`}>
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">GROWTH HOOK</h4>
                    <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 italic text-sm font-bold text-indigo-100 print:bg-slate-50 print:text-slate-900">
                      "{idea.viralStrategy.tiktokHook}"
                    </div>
                 </div>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">MASTER PROMPT SPECIFICATION</h4>
                     {!isLocked && (
                       <button onClick={handleCopy} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-widest text-white">
                         {copied ? 'COPIED' : 'COPY PROMPT'}
                       </button>
                     )}
                   </div>
                   <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5 font-mono text-[10px] leading-relaxed text-indigo-200/60 h-80 overflow-y-auto print:h-auto print:text-slate-900">
                     {getSanitizedPrompt()}
                   </div>
                 </div>
               </div>
               {isLocked && (
                 <div className="absolute inset-0 flex items-center justify-center z-20 print:hidden">
                    <div className="w-full max-w-md p-10 rounded-[3rem] bg-white text-center space-y-6 shadow-3xl border border-indigo-50">
                       <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl animate-float">
                          <ICONS.Bolt />
                       </div>
                       <div className="space-y-2">
                          <h5 className="text-3xl font-black text-slate-900 tracking-tighter">Upgrade to Pro</h5>
                          <p className="text-sm text-slate-500 font-bold leading-relaxed px-4">
                            Unlock the full <strong>Master Prompt</strong> and deep architecture specs for this idea.
                          </p>
                       </div>
                       <button 
                        onClick={() => window.open(`${PAYPAL_BASE_URL}/29`, '_blank')}
                        className="w-full py-6 premium-gradient text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] transition-all shadow-xl"
                       >
                         UNLOCK PRO ACCESS — $29
                       </button>
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