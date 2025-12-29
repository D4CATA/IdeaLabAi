
import React, { useState, useCallback, useRef, Suspense, lazy, useMemo } from 'react';
import { VibeState, UserStats, AppIdea } from './types';
import { createOrUpdateUser, setUserProStatus } from './services/firebase';
import VibeForm from './components/VibeForm';
import IdeaCard from './components/IdeaCard';
import { MOODS, ICONS, ERROR_MESSAGES, PRO_TIER_GENERATIONS, FREE_TIER_GENERATIONS } from './constants';
import { useAuth } from './hooks/useAuth';
import { useIdeas } from './hooks/useIdeas';
import { maskEmail } from './utils/helpers';

const PaymentPortal = lazy(() => import('./components/PaymentPortal'));
const AuthOverlay = lazy(() => import('./components/AuthOverlay'));

const App: React.FC = () => {
  const { user, isChecking, logout } = useAuth();
  const { ideas, vault, status, error, generate, refine, saveToVault, removeFromVault } = useIdeas();
  
  const [activeTab, setActiveTab] = useState<'engine' | 'vault'>('engine');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [vibe, setVibe] = useState<VibeState>({
    mood: MOODS[0],
    chaosMode: false,
    creatorMode: true,
    blueprintType: 'standard'
  });
  
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);
  const feedStartRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!user) return;
    const generationsLeft = user.generationsLeft ?? FREE_TIER_GENERATIONS;
    if (generationsLeft <= 0 && !user.isPro) {
      setShowPaymentPortal(true);
      return;
    }
    const result = await generate(vibe);
    if (result && !user.isPro) {
      await createOrUpdateUser(user.uid, { generationsLeft: generationsLeft - 1 });
    }
    feedStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [user, vibe, generate]);

  const handlePaymentSuccess = useCallback(async () => {
    if (user) await setUserProStatus(user.uid, true);
    setShowPaymentPortal(false);
  }, [user]);

  // Search Logic for Vault
  const filteredVault = useMemo(() => {
    if (!searchQuery.trim()) return vault;
    const query = searchQuery.toLowerCase();
    return vault.filter(idea => 
      idea.name.toLowerCase().includes(query) || 
      idea.tags.some(t => t.toLowerCase().includes(query)) ||
      idea.aiRecommendation.toLowerCase().includes(query)
    );
  }, [vault, searchQuery]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6" aria-live="polite">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Restoring Access Engine...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={null}>
        <AuthOverlay onAuthenticated={() => {}} />
      </Suspense>
    );
  }

  const generationsLeftDisplay = user.isPro ? PRO_TIER_GENERATIONS : (user.generationsLeft ?? FREE_TIER_GENERATIONS);

  return (
    <div className="min-h-screen bg-[#fcfcfd] blueprint-grid pb-20 selection:bg-indigo-100 selection:text-indigo-900 transition-all print:bg-white print:pb-0">
      <nav className="sticky top-6 inset-x-0 z-[100] px-6 flex items-center justify-center print:hidden">
        <div className="glass w-full max-w-6xl h-20 px-8 flex items-center justify-between rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/80">
          <div className="flex items-center gap-12">
            <button 
              className="flex items-center gap-3 group" 
              onClick={() => { setActiveTab('engine'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
            >
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all group-hover:bg-indigo-600">
                <ICONS.Layers />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">IDEA LAB</span>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <button 
                onClick={() => setActiveTab('engine')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'engine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                PATTERN ENGINE
              </button>
              <button 
                onClick={() => setActiveTab('vault')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'vault' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                MY VAULT
                {vault.length > 0 && <span className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[8px]">{vault.length}</span>}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => !user.isPro && setShowPaymentPortal(true)}
              className={`relative px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                user.isPro 
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                : 'bg-slate-900 text-white shadow-xl hover:bg-indigo-600 overflow-hidden group'
              }`}
            >
              <div className="relative z-10 flex items-center gap-2">
                {user.isPro ? <ICONS.Check /> : <ICONS.Crown />}
                {user.isPro ? 'PRO UNLOCKED' : 'UNLOCK 1.5M'}
              </div>
            </button>
            <button 
              onClick={logout}
              className="p-3 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-red-500 hover:border-red-100 transition-all hover:rotate-12"
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </nav>

      <Suspense fallback={null}>
        {showPaymentPortal && (
          <PaymentPortal onClose={() => setShowPaymentPortal(false)} onSuccess={handlePaymentSuccess} />
        )}
      </Suspense>

      <main className="pt-24 md:pt-32 container mx-auto px-6 max-w-7xl">
        {activeTab === 'engine' ? (
          <>
            <section className="text-center mb-32 space-y-10 animate-in fade-in slide-in-from-top-12 duration-1000 print:hidden">
              <div className="inline-flex items-center gap-2.5 px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm mx-auto">
                 <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                 </span>
                 {maskEmail(user.email)} // ENGINE ACTIVE
              </div>
              <div className="space-y-8 relative">
                <h1 className="text-6xl md:text-[10rem] font-black text-slate-900 tracking-tighter leading-[0.82] mb-4">
                  Build what’s <br/><span className="shimmer-text italic">already winning.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 max-w-4xl mx-auto font-semibold leading-tight tracking-tight px-4 opacity-70">
                  Infinite Viral Idea Engine turns trends into execution blueprints your AI agent can execute.
                </p>
              </div>
            </section>

            <section className="mb-32 relative z-20 print:hidden">
              <VibeForm 
                vibe={vibe} 
                setVibe={setVibe} 
                onGenerate={handleGenerate} 
                onUpgradeClick={() => setShowPaymentPortal(true)}
                isLoading={status === 'generating'}
                isPro={user.isPro}
                generationsLeft={generationsLeftDisplay}
              />
            </section>

            <div ref={feedStartRef} className="space-y-16 mb-24 min-h-[400px] relative">
              {ideas.length === 0 && status === 'idle' && (
                <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in duration-1000">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-200">
                      <ICONS.Shield />
                   </div>
                   <div className="space-y-3">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Engine Standby...</h2>
                      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Access the 1.5M database above</p>
                   </div>
                </div>
              )}
              {error && <div className="p-10 bg-red-50 border border-red-100 rounded-[2.5rem] text-red-600 text-center font-black uppercase tracking-widest text-xs shadow-xl animate-bounce">{error}</div>}
              {status === 'generating' && (
                <div className="flex flex-col items-center justify-center py-32 space-y-10 animate-in fade-in duration-500">
                   <div className="relative">
                      <div className="w-20 h-20 border-[6px] border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-indigo-600"><ICONS.Sparkles /></div>
                   </div>
                   <div className="text-center space-y-3">
                     <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">ACCESSING THE 1.5M ENGINE</p>
                   </div>
                </div>
              )}
              <div className="space-y-24">
                {ideas.map((idea, index) => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    userStats={{ generationsLeft: generationsLeftDisplay, isPro: user.isPro, blueprintsUnlocked: 0, credits: 0 }} 
                    onRefine={() => refine(index)}
                    isRefining={status === 'refining'}
                    onSave={saveToVault}
                    isSaved={vault.some(v => v.id === idea.id)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 print:hidden">
              <div className="space-y-4">
                 <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Success Vault</h2>
                 <p className="text-slate-400 font-black uppercase tracking-widest text-xs">The 1.5M database // Your Curated Extractions</p>
              </div>
              <div className="w-full md:w-96 relative">
                 <input 
                  type="text"
                  placeholder="SEARCH YOUR BLUEPRINTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-8 py-5 bg-white border-2 border-slate-100 rounded-3xl font-black text-xs uppercase tracking-widest focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300 shadow-sm"
                 />
                 <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300"><ICONS.Rocket /></div>
              </div>
            </div>

            <div className="space-y-24">
              {filteredVault.length > 0 ? (
                filteredVault.map((idea, index) => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    userStats={{ generationsLeft: generationsLeftDisplay, isPro: user.isPro, blueprintsUnlocked: 0, credits: 0 }} 
                    onRefine={() => { setActiveTab('engine'); /* refinement logic in engine only for simplicity or refactor hook to handle global index */ }}
                    isRefining={false}
                    isSaved={true}
                    onRemove={removeFromVault}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 bg-white border border-slate-100 rounded-[4rem] shadow-sm">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                      <ICONS.Layers />
                   </div>
                   <div className="space-y-3 px-10">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Vault Empty</h2>
                      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Generate and save winning patterns to see them here.</p>
                      <button 
                        onClick={() => setActiveTab('engine')}
                        className="mt-6 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                      >
                        Launch Pattern Engine
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-40 pt-24 border-t border-slate-100 bg-white print:hidden">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-start gap-16 pb-20">
          <div className="space-y-6 max-w-sm">
             <div className="text-2xl font-black tracking-tighter text-slate-900 leading-none">IDEA LAB AI</div>
             <p className="text-slate-500 text-sm font-semibold leading-relaxed opacity-70">
               Access the unfair advantage built on patterns, not guesses.
             </p>
          </div>
        </div>
        <div className="bg-slate-900 py-10 text-center">
          <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em]">ACCESS ENGINE v12.1 // 1.5M PATTERNS INDEXED</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
