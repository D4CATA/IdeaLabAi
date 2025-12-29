import React, { useState, useEffect } from 'react';
import { VibeState, AppIdea, UserStats } from './types';
import { generateAppIdea, refineAppIdea } from './services/geminiService';
import { auth, getUserData, createOrUpdateUser, setUserProStatus, MockUser } from './services/firebase';
import VibeForm from './components/VibeForm';
import IdeaCard from './components/IdeaCard';
import PaymentPortal from './components/PaymentPortal';
import AuthOverlay from './components/AuthOverlay';
import { MOODS, ICONS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [vibe, setVibe] = useState<VibeState>({
    mood: MOODS[0],
    chaosMode: false,
    creatorMode: true,
    blueprintType: 'standard'
  });
  
  const [stats, setStats] = useState<UserStats>({
    generationsLeft: 3,
    isPro: false,
    blueprintsUnlocked: 0,
    credits: 0
  });

  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);

  // Auth & Sync Logic
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setStats({
          generationsLeft: currentUser.generationsLeft ?? 3,
          isPro: currentUser.isPro ?? false,
          blueprintsUnlocked: 0,
          credits: 0
        });

        // Background update stats from DB
        getUserData(currentUser.uid, currentUser.idToken).then(dbData => {
          if (dbData) {
            setStats({
              generationsLeft: dbData.generationsLeft ?? 3,
              isPro: dbData.isPro ?? false,
              blueprintsUnlocked: dbData.blueprintsUnlocked ?? 0,
              credits: dbData.credits ?? 0
            });
          }
        }).catch(() => {});
      } else {
        setUser(null);
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    if (!user) return;
    
    if (stats.generationsLeft <= 0 && !stats.isPro) {
      setError("Limit reached. Initialize Access Engine to keep going!");
      setShowPaymentPortal(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateAppIdea(vibe);
      setIdeas(prev => [result, ...prev]);
      
      if (!stats.isPro) {
        const newGens = stats.generationsLeft - 1;
        setStats(prev => ({ ...prev, generationsLeft: newGens }));
        await createOrUpdateUser(user.uid, { generationsLeft: newGens });
      }
      
      setTimeout(() => {
        document.getElementById('feed-start')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("The Access Engine is recalibrating. Try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (index: number) => {
    const ideaToRefine = ideas[index];
    if (!ideaToRefine) return;
    
    setRefining(true);
    setError(null);
    try {
      const result = await refineAppIdea(ideaToRefine);
      setIdeas(prev => {
        const newIdeas = [...prev];
        newIdeas[index] = result;
        return newIdeas;
      });
    } catch (err) {
      console.error(err);
      setError("Refinement failed. Pattern complexity exceeded.");
    } finally {
      setRefining(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (user) {
      await setUserProStatus(user.uid, true);
      setStats(prev => ({ ...prev, isPro: true }));
    }
    setShowPaymentPortal(false);
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Restoring Access Engine...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthOverlay onAuthenticated={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] blueprint-grid pb-20 selection:bg-indigo-100 selection:text-indigo-900 transition-all">
      
      {/* Navigation */}
      <nav className="sticky top-6 inset-x-0 z-[100] px-6 flex items-center justify-center">
        <div className="glass w-full max-w-6xl h-20 px-8 flex items-center justify-between rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/80">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all group-hover:bg-indigo-600">
              <ICONS.Layers />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-slate-900 leading-none text-nowrap">IDEA LAB AI</span>
              <span className="text-[7px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">ACCESS ENGINE v12</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => !stats.isPro && setShowPaymentPortal(true)}
              className={`relative px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                stats.isPro 
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                : 'bg-slate-900 text-white shadow-xl hover:bg-indigo-600 overflow-hidden group'
              }`}
            >
              <div className="relative z-10 flex items-center gap-2">
                {stats.isPro ? <ICONS.Check /> : <ICONS.Crown />}
                {stats.isPro ? 'PRO UNLOCKED' : 'UNLOCK 1.5M'}
              </div>
            </button>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-red-500 hover:border-red-100 transition-all hover:rotate-12"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </nav>

      {showPaymentPortal && (
        <PaymentPortal 
          onClose={() => setShowPaymentPortal(false)} 
          onSuccess={handlePaymentSuccess} 
        />
      )}

      {/* Main Content */}
      <main className="pt-24 md:pt-32 container mx-auto px-6 max-w-7xl">
        <section className="text-center mb-32 space-y-10 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="inline-flex items-center gap-2.5 px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm mx-auto">
             <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </span>
             {user.email} // ACCESS ENGINE INITIALIZED
          </div>
          
          <div className="space-y-8 relative">
            <h1 className="text-6xl md:text-[10rem] font-black text-slate-900 tracking-tighter leading-[0.82] mb-4">
              Build what’s <br/><span className="shimmer-text italic">already winning.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-4xl mx-auto font-semibold leading-tight tracking-tight px-4 opacity-70">
              Infinite Viral Idea Engine scans trends, products, and patterns—then turns them into build-ready blueprints and master prompts your AI agent can execute.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="mb-32 relative z-20">
          <VibeForm 
            vibe={vibe} 
            setVibe={setVibe} 
            onGenerate={handleGenerate} 
            onUpgradeClick={() => setShowPaymentPortal(true)}
            isLoading={loading}
            isPro={stats.isPro}
            generationsLeft={stats.isPro ? 999 : stats.generationsLeft}
          />
        </section>

        {/* Results / Feed Section */}
        <div id="feed-start" className="space-y-16 mb-24 min-h-[400px] relative">
          {ideas.length === 0 && !loading && (
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

          {error && (
            <div className="p-10 bg-red-50 border border-red-100 rounded-[2.5rem] text-red-600 text-center font-black uppercase tracking-widest text-xs shadow-xl animate-bounce">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 space-y-10 animate-in fade-in duration-500">
               <div className="relative">
                  <div className="w-20 h-20 border-[6px] border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                     <ICONS.Sparkles />
                  </div>
               </div>
               <div className="text-center space-y-3">
                 <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">ACCESSING THE 1.5M ENGINE</p>
                 <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Identifying High-Yield Revenue Patterns</p>
               </div>
            </div>
          )}

          <div className="space-y-24">
            {ideas.map((idea, index) => (
              <IdeaCard 
                key={`${idea.name}-${index}`}
                idea={idea} 
                userStats={stats} 
                onRefine={() => handleRefine(index)}
                isRefining={refining}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-40 pt-24 border-t border-slate-100 bg-white">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-start gap-16 pb-20">
          <div className="space-y-6 max-w-sm">
             <div className="text-2xl font-black tracking-tighter text-slate-900 leading-none">IDEA LAB AI</div>
             <p className="text-slate-500 text-sm font-semibold leading-relaxed opacity-70">
               Access the unfair advantage built on patterns, not guesses.
             </p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest">
            <div className="space-y-6">
              <h5 className="text-slate-400 tracking-[0.3em]">SOCIAL</h5>
              <div className="flex flex-col gap-4">
                <a href="https://twitter.com/catalinsparios" target="_blank" className="text-slate-900 hover:text-indigo-600 transition-colors">X / TWITTER</a>
                <a href="mailto:support@idealab.ai" className="text-slate-900 hover:text-indigo-600 transition-colors">EMAIL</a>
              </div>
            </div>
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