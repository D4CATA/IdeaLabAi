
import React, { useState, useCallback, useRef, Suspense, lazy, useMemo } from 'react';
import { VibeState, UserStats, AppIdea } from './types';
import { createOrUpdateUser, setUserProStatus } from './services/firebase';
import VibeForm from './components/VibeForm';
import IdeaCard from './components/IdeaCard';
import { MOODS, ICONS, ERROR_MESSAGES, PRO_TIER_GENERATIONS, FREE_TIER_GENERATIONS } from './constants';
import { useAuth } from './hooks/useAuth';
import { useIdeas } from './hooks/useIdeas';
import { maskEmail } from './utils/helpers';
import { IdeaLabLogoFull } from './components/Logo';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="tracking-hyper text-slate-400">SYNCING CORE...</span>
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
    <div className="min-h-screen bg-[#f8fafc] blueprint-grid pb-20 selection:bg-indigo-100 selection:text-indigo-900 transition-all print:bg-white print:pb-0">
      <nav className="sticky top-6 inset-x-0 z-[100] px-6 flex items-center justify-center print:hidden">
        <div className="glass w-full max-w-6xl h-20 px-8 flex items-center justify-between rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-white/80">
          <div className="flex items-center gap-12">
            <button 
              className="flex items-center gap-3 group" 
              onClick={() => { setActiveTab('engine'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
            >
              <IdeaLabLogoFull size="md" />
            </button>

            <div className="hidden md:flex items-center gap-2 p-1 bg-slate-100/50 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setActiveTab('engine')}
                className={`px-5 py-2 rounded-xl tracking-hyper transition-all ${activeTab === 'engine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                PATTERN ENGINE
              </button>
              <button 
                onClick={() => setActiveTab('vault')}
                className={`px-5 py-2 rounded-xl tracking-hyper transition-all flex items-center gap-2 ${activeTab === 'vault' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                VAULT
                {vault.length > 0 && <span className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[7px] font-black">{vault.length}</span>}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user.isPro ? (
              <button className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-full">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                <span className="tracking-hyper text-indigo-600">CORE ACTIVE</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowPaymentPortal(true)}
                className="group relative flex items-center gap-4 px-6 py-3.5 overflow-hidden rounded-full transition-all hover:scale-105 shadow-xl shadow-indigo-100"
              >
                <div className="absolute inset-0 premium-gradient group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10 flex items-center gap-2">
                   <ICONS.Bolt />
                   <span className="tracking-hyper text-[10px] text-white">UNLOCK CORE</span>
                </div>
              </button>
            )}

            <button 
              onClick={logout}
              className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:border-red-100 transition-all hover:rotate-12 group"
            >
              <svg className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </nav>

      <Suspense fallback={null}>
        {showPaymentPortal && (
          <PaymentPortal onClose={() => setShowPaymentPortal(false)} onSuccess={handlePaymentSuccess} />
        )}
      </Suspense>

      <main className="pt-24 container mx-auto px-6 max-w-7xl">
        {activeTab === 'engine' ? (
          <>
            <section className="text-center mb-24 space-y-8 animate-in fade-in slide-in-from-top-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-full tracking-hyper shadow-sm mx-auto">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                 {maskEmail(user.email)} // SYNCED
              </div>
              <div className="space-y-6">
                <h1 className="text-7xl md:text-[8rem] font-black text-slate-900 tracking-tighter leading-[0.85]">
                  Stop guessing.<br/><span className="shimmer-text">Start building.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                  Turn successful patterns into technical blueprints for Bolt, Lovable, and v0.
                </p>
              </div>
            </section>

            <section className="mb-32 relative z-20">
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

            <div ref={feedStartRef} className="space-y-16 mb-24 min-h-[400px]">
              {ideas.length === 0 && status === 'idle' && (
                <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 animate-in fade-in">
                   <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-200">
                      <ICONS.Engine />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Engine Standby...</h2>
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
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-2">
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Vault Terminal</h2>
                 <p className="tracking-hyper text-slate-400">YOUR SAVED PATTERNS</p>
              </div>
              <div className="w-full md:w-80 relative">
                 <input 
                  type="text"
                  placeholder="FILTER BLUEPRINTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl tracking-hyper text-[9px] focus:outline-none focus:border-indigo-600 transition-all shadow-sm"
                 />
              </div>
            </div>

            <div className="space-y-20">
              {filteredVault.length > 0 ? (
                filteredVault.map((idea) => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    userStats={{ generationsLeft: generationsLeftDisplay, isPro: user.isPro, blueprintsUnlocked: 0, credits: 0 }} 
                    onRefine={() => { setActiveTab('engine'); }}
                    isRefining={false}
                    isSaved={true}
                    onRemove={removeFromVault}
                  />
                ))
              ) : (
                <div className="py-40 text-center glass rounded-[3rem] border-slate-100 shadow-sm">
                   <p className="tracking-hyper text-slate-300">VAULT EMPTY. INITIALIZE GENERATION.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-40 pt-24 border-t border-slate-200 bg-white print:hidden">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-start gap-12 pb-20">
          <div className="space-y-4 max-w-sm">
             <IdeaLabLogoFull size="md" />
             <p className="text-slate-500 text-sm font-medium leading-relaxed opacity-80">
               Infinite viral idea patterns for the modern solo-founder. Built for execution.
             </p>
          </div>
        </div>
        <div className="bg-slate-900 py-8 text-center">
          <p className="tracking-hyper text-[8px] text-white/20">SUCCESS CORE v12.1 // 1.5M PATTERNS INDEXED</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
