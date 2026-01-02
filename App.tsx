import React, { useState, useCallback, useRef, Suspense, lazy, useMemo, useEffect } from 'react';
import { VibeState, UserStats, AppIdea, ToastMessage } from './types';
import { createOrUpdateUser, setUserPlan, auth } from './services/firebase';
import VibeForm from './components/VibeForm';
import IdeaCard from './components/IdeaCard';
import { MOODS, ICONS, ERROR_MESSAGES, PRO_TIER_GENERATIONS, FREE_TIER_GENERATIONS, STARTER_TIER_GENERATIONS } from './constants';
import { useAuth } from './hooks/useAuth';
import { useIdeas } from './hooks/useIdeas';
import { maskEmail } from './utils/helpers';
import { IdeaLabLogoFull } from './components/Logo';

const PaymentPortal = lazy(() => import('./components/PaymentPortal'));
const AuthOverlay = lazy(() => import('./components/AuthOverlay'));

const App: React.FC = () => {
  const { user, isChecking, logout } = useAuth();
  const { ideas, vault, status, error, generate, refine, saveToVault, removeFromVault, clearError } = useIdeas();
  
  const [activeTab, setActiveTab] = useState<'engine' | 'vault'>('engine');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isResending, setIsResending] = useState(false);
  
  const [vibe, setVibe] = useState<VibeState>({
    mood: MOODS[0],
    chaosMode: false,
    creatorMode: true,
    blueprintType: 'standard'
  });
  
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);
  const feedStartRef = useRef<HTMLDivElement>(null);

  // Fix: Corrected syntax for removing toasts and properly typed the state update to resolve scope errors.
  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // DAILY BONUS LOGIC
  useEffect(() => {
    if (user && user.emailVerified) {
      const today = new Date().toISOString().split('T')[0];
      if (user.lastDailyBonusDate !== today) {
        const checkAndAward = async () => {
          try {
            // Reward +1 blueprint daily for entering the site
            const newCount = (user.generationsLeft || 0) + 1;
            await createOrUpdateUser(user.uid, { 
              generationsLeft: newCount,
              lastDailyBonusDate: today 
            });
            addToast("Daily Architect Reward: +1 Extraction Blueprint Synchronized", "success");
          } catch (e) {
            console.error("Daily bonus sync failed", e);
          }
        };
        checkAndAward();
      }
    }
  }, [user?.uid, user?.emailVerified, user?.lastDailyBonusDate, addToast]);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
      clearError();
    }
  }, [error, addToast, clearError]);

  const handleGenerate = useCallback(async () => {
    if (!user) return;
    if (!user.emailVerified) {
      addToast("Verification required to execute patterns.", "warning");
      return;
    }
    
    // TIERED LIMITS
    let limit = FREE_TIER_GENERATIONS;
    if (user.plan === 'starter') limit = STARTER_TIER_GENERATIONS;
    if (user.plan === 'pro' || user.plan === 'business') limit = PRO_TIER_GENERATIONS;

    const generationsLeft = user.generationsLeft ?? limit;
    
    if (generationsLeft <= 0 && !user.isPro) {
      setShowPaymentPortal(true);
      return;
    }

    const result = await generate(vibe);
    if (result) {
      addToast("Pattern Synthesis Complete", "success");
      // Decrease count only for non-unlimited plans
      if (user.plan === 'free' || user.plan === 'starter') {
        await createOrUpdateUser(user.uid, { generationsLeft: Math.max(0, generationsLeft - 1) });
      }
    }
    feedStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [user, vibe, generate, addToast]);

  const handleResendVerification = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      await auth.sendEmailVerification();
      addToast("Verification link sent to your inbox.", "success");
    } catch (err: any) {
      addToast("Failed to resend. Please try again later.", "error");
    } finally {
      setIsResending(false);
    }
  };

  const checkVerification = async () => {
    const reloaded = await auth.reloadUser();
    if (reloaded?.emailVerified) {
      addToast("Identity Verified. Full access granted.", "success");
    } else {
      addToast("Still unverified. Please check your inbox.", "info");
    }
  };

  const handleSaveToVault = useCallback(async (idea: AppIdea) => {
    await saveToVault(idea);
    addToast("Blueprint Saved to Library", "success");
  }, [saveToVault, addToast]);

  const handlePaymentSuccess = useCallback(async (planId: string) => {
    if (user) {
      await setUserPlan(user.uid, planId as any);
      await auth.reloadUser();
    }
    addToast(`${planId.toUpperCase()} Access Activated`, "success");
    setShowPaymentPortal(false);
  }, [user, addToast]);

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
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Identity...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={null}>
        <AuthOverlay onAuthenticated={() => addToast("Logged in successfully", "success")} />
      </Suspense>
    );
  }

  let tierLimit = FREE_TIER_GENERATIONS;
  if (user.plan === 'starter') tierLimit = STARTER_TIER_GENERATIONS;
  if (user.plan === 'pro' || user.plan === 'business') tierLimit = PRO_TIER_GENERATIONS;
  const generationsLeftDisplay = user.generationsLeft ?? tierLimit;

  return (
    <div className="min-h-screen bg-[#f8fafc] blueprint-grid pb-20 selection:bg-indigo-100 selection:text-indigo-900 transition-all print:bg-white print:pb-0">
      
      {/* Verification Banner */}
      {!user.emailVerified && (
        <div className="sticky top-0 z-[150] bg-amber-500 text-white px-6 py-3 flex flex-col md:flex-row items-center justify-center gap-4 shadow-lg border-b border-amber-600">
           <div className="flex items-center gap-3">
              <ICONS.Shield />
              <span className="text-[10px] font-black uppercase tracking-widest">Verification Pending: {maskEmail(user.email)}</span>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={handleResendVerification} 
                disabled={isResending}
                className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {isResending ? 'SENDING...' : 'RESEND LINK'}
              </button>
              <button 
                onClick={checkVerification}
                className="px-4 py-1.5 bg-white text-amber-600 hover:bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                CHECK STATUS
              </button>
           </div>
        </div>
      )}

      <div className="fixed bottom-10 right-10 z-[300] flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl border-2 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 ${
            toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' :
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
            toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
            'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        ))}
      </div>

      <nav className={`sticky ${user.emailVerified ? 'top-6' : 'top-[5rem]'} inset-x-0 z-[100] px-6 flex items-center justify-center print:hidden transition-all duration-500`}>
        <div className="glass w-full max-w-6xl h-20 px-8 flex items-center justify-between rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-white/80">
          <div className="flex items-center gap-12">
            <button className="flex items-center gap-3 group" onClick={() => { setActiveTab('engine'); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
              <IdeaLabLogoFull size="md" />
            </button>
            <div className="hidden md:flex items-center gap-2 p-1 bg-slate-100/50 rounded-2xl border border-slate-200">
              <button onClick={() => setActiveTab('engine')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'engine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>IDEA ENGINE</button>
              <button onClick={() => setActiveTab('vault')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'vault' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                SAVED LIBRARY
                {vault.length > 0 && <span className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[7px] font-black">{vault.length}</span>}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user.plan && user.plan !== 'free' ? (
              <div className="flex items-center gap-3">
                 <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{user.plan} ARCHITECT</span>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">AUTHENTICATED PLAN</span>
                 </div>
                 <button className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-full text-white shadow-xl">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest">{user.plan} EDITION</span>
                 </button>
              </div>
            ) : (
              <button onClick={() => setShowPaymentPortal(true)} className="group relative flex items-center gap-4 px-6 py-3.5 overflow-hidden rounded-full transition-all hover:scale-105 shadow-xl shadow-indigo-100">
                <div className="absolute inset-0 premium-gradient group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10 flex items-center gap-2"><ICONS.Bolt /><span className="text-[10px] font-black uppercase tracking-widest text-white">UPGRADE</span></div>
              </button>
            )}
            <button onClick={logout} className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:border-red-100 transition-all hover:rotate-12 group"><svg className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
          </div>
        </div>
      </nav>

      <Suspense fallback={null}>{showPaymentPortal && <PaymentPortal onClose={() => setShowPaymentPortal(false)} onSuccess={handlePaymentSuccess} />}</Suspense>

      <main className="pt-24 container mx-auto px-6 max-w-7xl">
        {activeTab === 'engine' ? (
          <>
            <section className="text-center mb-24 space-y-8 animate-in fade-in slide-in-from-top-12">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm mx-auto">
                 <div className={`w-1.5 h-1.5 rounded-full ${user.emailVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                 Architect Identity: {maskEmail(user.email)}
                 {user.emailVerified && <span className="text-emerald-500"><ICONS.Check /></span>}
              </div>
              <div className="space-y-6">
                <h1 className="text-7xl md:text-[8.5rem] font-black text-slate-900 tracking-tighter leading-[0.82]">Build what's<br/><span className="shimmer-text italic">already winning.</span></h1>
                <p className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto font-semibold leading-tight tracking-tight px-4 opacity-70">Infinite viral idea blueprints generated from 1.5M success patterns. Ready for immediate execution.</p>
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
                isVerified={user.emailVerified ?? false}
                generationsLeft={generationsLeftDisplay} 
              />
            </section>

            <div ref={feedStartRef} className="space-y-16 mb-24 min-h-[400px]">
              {ideas.length === 0 && status === 'idle' && (
                <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 animate-in fade-in">
                   <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-200"><ICONS.Engine /></div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Ready for Synthesis...</h2>
                </div>
              )}
              <div className="space-y-24">
                {ideas.map((idea, index) => (
                  <IdeaCard key={idea.id} idea={idea} userStats={{ generationsLeft: generationsLeftDisplay, isPro: user.isPro, blueprintsUnlocked: 0, credits: 0 }} onRefine={() => refine(index)} isRefining={status === 'refining'} onSave={handleSaveToVault} isSaved={vault.some(v => v.id === idea.id)} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-2"><h2 className="text-5xl font-black text-slate-900 tracking-tighter">Saved Library</h2><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">YOUR CURATED SUCCESS BLUEPRINTS</p></div>
              <div className="w-full md:w-80 relative">
                 <input type="text" placeholder="FILTER SAVED IDEAS..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-600 transition-all shadow-sm" />
              </div>
            </div>
            <div className="space-y-20">
              {filteredVault.length > 0 ? (
                filteredVault.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} userStats={{ generationsLeft: generationsLeftDisplay, isPro: user.isPro, blueprintsUnlocked: 0, credits: 0 }} onRefine={() => { setActiveTab('engine'); }} isRefining={false} isSaved={true} onRemove={removeFromVault} />
                ))
              ) : (
                <div className="py-40 text-center glass rounded-[3rem] border-slate-100 shadow-sm"><p className="text-[10px] font-black uppercase tracking-widest text-slate-300">LIBRARY EMPTY. INITIALIZE THE ENGINE TO BEGIN.</p></div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-40 pt-24 border-t border-slate-200 bg-white print:hidden">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-start gap-12 pb-20">
          <div className="space-y-4 max-w-sm"><IdeaLabLogoFull size="md" /><p className="text-slate-500 text-sm font-medium leading-relaxed opacity-80">Professional execution blueprints for the modern solo-founder. Engineered for rapid building.</p></div>
        </div>
        <div className="bg-slate-900 py-8 text-center"><p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">IDEA LAB AI SUCCESS ENGINE // DATA SYNC v12.1</p></div>
      </footer>
    </div>
  );
};

export default App;