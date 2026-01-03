
import React, { useState, useCallback, useRef, Suspense, lazy, useMemo, useEffect } from 'react';
import { VibeState, UserStats, AppIdea, ToastMessage, Product } from './types';
import { createOrUpdateUser, setUserPlan, auth } from './services/firebase';
import VibeForm from './components/VibeForm';
import IdeaCard from './components/IdeaCard';
import EvolutionTree from './components/EvolutionTree';
import { MOODS, ICONS, PRO_TIER_GENERATIONS, PRODUCTS, ADSENSE_CONFIG } from './constants';
import { useAuth } from './hooks/useAuth';
import { useIdeas } from './hooks/useIdeas';
import { IdeaLabLogoFull } from './components/Logo';

const PaymentPortal = lazy(() => import('./components/PaymentPortal'));
const AuthOverlay = lazy(() => import('./components/AuthOverlay'));
const AdRewardModal = lazy(() => import('./components/AdRewardModal'));

const App: React.FC = () => {
  const { user, isChecking, logout } = useAuth();
  const { ideas, vault, status, error, generate, mutate, refine, claimIdea, saveToVault, removeFromVault, clearError } = useIdeas();
  
  const [activeTab, setActiveTab] = useState<'engine' | 'evolution' | 'library'>('engine');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);
  
  // Ad Reward State
  const [showAdModal, setShowAdModal] = useState(false);
  const [adsWatchedCount, setAdsWatchedCount] = useState(0);

  const [vibe, setVibe] = useState<VibeState>({
    mood: MOODS[0],
    chaosMode: false,
    creatorMode: true,
    blueprintType: 'solid-saas'
  });

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
      clearError();
    }
  }, [error, addToast, clearError]);

  const checkCreditsAndRun = useCallback(async (action: () => Promise<any>) => {
    if (!user) return;
    
    const isPro = !!user.isPro;
    const credits = user.generationsLeft ?? 0;

    if (!isPro && credits <= 0) {
      addToast("Out of credits. Refill or watch ads to continue.", "warning");
      setShowPaymentPortal(true);
      return;
    }

    const result = await action();
    if (result && !isPro) {
      await createOrUpdateUser(user.uid, { generationsLeft: Math.max(0, credits - 1) });
    }
    return result;
  }, [user, addToast]);

  const handleGenerate = useCallback(async () => {
    await checkCreditsAndRun(async () => {
      const result = await generate(vibe);
      if (result) addToast("Idea Successfully Synthesized", "success");
      return result;
    });
  }, [vibe, generate, addToast, checkCreditsAndRun]);

  const handleRefine = useCallback(async (id: string) => {
    await checkCreditsAndRun(async () => {
      await refine(id);
      addToast("Strategy Polished", "success");
      return true;
    });
  }, [refine, addToast, checkCreditsAndRun]);

  const handleMutate = useCallback(async (id: string) => {
    await checkCreditsAndRun(async () => {
      const result = await mutate(id);
      if (result) {
        addToast("Evolution Successful", "success");
        setActiveTab('engine');
      }
      return result;
    });
  }, [mutate, addToast, checkCreditsAndRun]);

  const handleClaim = useCallback(async (id: string) => {
    const success = await claimIdea(id);
    if (success) addToast("Idea Claimed - This is now private.", "success");
    else addToast("Upgrade to PRO to claim ideas.", "info");
  }, [claimIdea, addToast]);

  const handlePaymentSuccess = useCallback(async (productId: string) => {
    if (!user) return;
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (product.type === 'subscription') {
      await setUserPlan(user.uid, product.id as any);
      addToast(`${product.name} Activated!`, "success");
    } else if (product.type === 'credit_pack') {
      const currentCredits = user.generationsLeft ?? 0;
      await createOrUpdateUser(user.uid, { generationsLeft: currentCredits + (product.credits ?? 0) });
      addToast(`Added ${product.credits} Credits!`, "success");
    }
    setShowPaymentPortal(false);
  }, [user, addToast]);

  // Reward Ad Handlers
  const handleAdComplete = useCallback(async () => {
    if (!user) return;
    const nextCount = adsWatchedCount + 1;
    
    if (nextCount >= ADSENSE_CONFIG.ADS_PER_CREDIT) {
      // Reward the user
      const currentCredits = user.generationsLeft ?? 0;
      await createOrUpdateUser(user.uid, { generationsLeft: currentCredits + 1 });
      addToast("Reward Earned: +1 Credit Added!", "success");
      setAdsWatchedCount(0);
      setShowAdModal(false);
    } else {
      setAdsWatchedCount(nextCount);
      addToast(`1/2 Ads Watched. One more for a credit!`, "info");
      setShowAdModal(false);
    }
  }, [user, adsWatchedCount, addToast]);

  const filteredVault = useMemo(() => {
    if (!searchQuery.trim()) return vault;
    const q = searchQuery.toLowerCase();
    return vault.filter(idea => 
      idea.name.toLowerCase().includes(q) || 
      idea.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [vault, searchQuery]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
        <div className="w-10 h-10 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fix: Show AuthOverlay if user is missing OR if they exist but are not verified.
  // This prevents the "flash and disappear" bug because the overlay stays mounted until verification is complete.
  if (!user || !user.emailVerified) {
    return (
      <Suspense fallback={null}>
        <AuthOverlay 
          onAuthenticated={() => addToast("Connection Established", "success")} 
          forceVerificationView={!!user && !user.emailVerified}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] px-6 py-4 flex justify-center">
        <div className="glass w-full max-w-6xl h-20 px-8 flex items-center justify-between rounded-[2rem]">
          <div className="flex items-center gap-10">
            <button onClick={() => setActiveTab('engine')}><IdeaLabLogoFull size="md" /></button>
            <div className="hidden md:flex gap-2">
              <button onClick={() => setActiveTab('engine')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'engine' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>IDEA LAB</button>
              <button onClick={() => setActiveTab('evolution')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'evolution' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>EVOLUTION TREE</button>
              <button onClick={() => setActiveTab('library')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'library' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>MY VAULT</button>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
               <div className="text-right flex flex-col hidden sm:flex">
                  <span className="text-[11px] font-black text-white uppercase leading-tight">{user.displayName || user.email.split('@')[0]}</span>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{user.plan || 'GUEST'} — {(user.isPro ? '∞' : user.generationsLeft) || 0} CREDITS</span>
               </div>
               {user.photoURL ? (
                 <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-white/20 shadow-lg" />
               ) : (
                 <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-sm">{user.displayName?.[0] || user.email[0].toUpperCase()}</div>
               )}
            </div>

            <div className="flex items-center gap-4">
              {!user.isPro && (
                <button onClick={() => setShowPaymentPortal(true)} className="px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5">REFILL</button>
              )}
              <button onClick={logout} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Sign Out">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Suspense fallback={null}>{showPaymentPortal && <PaymentPortal onClose={() => setShowPaymentPortal(false)} onSuccess={handlePaymentSuccess} onWatchAd={() => setShowAdModal(true)} />}</Suspense>
      <Suspense fallback={null}>{showAdModal && <AdRewardModal adsWatched={adsWatchedCount} onComplete={handleAdComplete} onClose={() => setShowAdModal(false)} />}</Suspense>

      <main className="container mx-auto px-6 max-w-7xl pt-12 pb-24">
        {activeTab === 'engine' ? (
          <div className="space-y-24">
            <section className="text-center space-y-8 animate-in fade-in duration-1000">
               <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                 Turn Vibes Into<br/><span className="shimmer-text">Profitable Software.</span>
               </h1>
               <p className="text-xl text-slate-400 max-w-2xl mx-auto italic">
                 Synthesize high-potential app strategies in seconds. Optimized for Bolt.new, Lovable, and the solo-founder workflow.
               </p>
               <VibeForm 
                 vibe={vibe} setVibe={setVibe} 
                 onGenerate={handleGenerate} 
                 onUpgradeClick={() => setShowPaymentPortal(true)}
                 isLoading={status === 'generating'}
                 isPro={user.isPro}
                 isVerified={user.emailVerified ?? true}
                 generationsLeft={user.generationsLeft || 0}
               />
            </section>
            
            <div className="space-y-16">
              {ideas.map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea} 
                  userStats={{ generationsLeft: user.generationsLeft || 0, isPro: user.isPro, blueprintsUnlocked: 0, credits: 0 }} 
                  onRefine={() => handleRefine(idea.id)} 
                  onMutate={() => handleMutate(idea.id)}
                  onClaim={() => handleClaim(idea.id)}
                  isRefining={status === 'refining' || status === 'mutating'} 
                  onSave={saveToVault}
                  isSaved={vault.some(v => v.id === idea.id)}
                />
              ))}
            </div>
          </div>
        ) : activeTab === 'evolution' ? (
          <EvolutionTree ideas={[...ideas, ...vault]} onSelect={(id) => { setActiveTab('engine'); }} />
        ) : (
          <div className="space-y-16 animate-in fade-in">
             <div className="flex justify-between items-end border-b border-white/5 pb-12">
               <div>
                 <h2 className="text-5xl font-black uppercase tracking-tighter">Your Secret Vault</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mt-2">Claimed & Saved Blueprints</p>
               </div>
               <input 
                type="text" placeholder="FILTER VAULT..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-indigo-500 outline-none w-80"
               />
             </div>
             <div className="space-y-16">
               {filteredVault.map(idea => (
                 <IdeaCard 
                   key={idea.id} 
                   idea={idea} 
                   userStats={{ generationsLeft: user.generationsLeft || 0, isPro: user.isPro, blueprintsUnlocked: 0, credits: 0 }} 
                   onRefine={() => handleRefine(idea.id)} 
                   onMutate={() => handleMutate(idea.id)}
                   onClaim={() => handleClaim(idea.id)}
                   isRefining={status === 'refining'} 
                   isSaved={true}
                   onRemove={removeFromVault}
                 />
               ))}
             </div>
          </div>
        )}
      </main>
      
      <div className="fixed bottom-12 right-12 z-[200] flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className="glass px-6 py-4 rounded-2xl border-l-4 border-indigo-500 animate-in slide-in-from-right-10 shadow-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest">{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
