
import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { ICONS } from '../constants';
import { IdeaLabLogo } from './Logo';
import { getAuthErrorMessage } from '../utils/authErrors';

interface AuthOverlayProps {
  onAuthenticated: () => void;
  forceVerificationView?: boolean;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onAuthenticated, forceVerificationView = false }) => {
  const [view, setView] = useState<'login' | 'signup' | 'reset' | 'verify'>(forceVerificationView ? 'verify' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fix: Sync view state with external forceVerificationView prop
  useEffect(() => {
    if (forceVerificationView) {
      setView('verify');
    }
  }, [forceVerificationView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (view === 'login') {
        await auth.signIn(email, password);
        const reloadedUser = await auth.reloadUser();
        if (reloadedUser && !reloadedUser.emailVerified) {
          setView('verify');
        } else {
          onAuthenticated();
        }
      } else if (view === 'signup') {
        await auth.signUp(email, password);
        // We stay in 'signup' mode for a tiny bit then onAuthStateChanged fires in parent,
        // but since App.tsx handles the unverified state, we manually set view here too.
        setView('verify');
        setSuccessMsg("Check your inbox for a verification link.");
        // Explicitly send verification email
        await auth.sendEmailVerification();
      } else if (view === 'reset') {
        await auth.resetPassword(email);
        setSuccessMsg("Recovery email sent.");
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'google') {
        await auth.signInWithGoogle();
      } else {
        await auth.signInWithGitHub();
      }
      
      const reloaded = await auth.reloadUser();
      if (reloaded && reloaded.emailVerified) {
        onAuthenticated();
      } else {
        setView('verify');
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (view === 'verify') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-4">
        <div className="w-full max-w-md glass p-12 rounded-[3rem] border-white/10 shadow-2xl text-center space-y-8 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/30">
            <ICONS.Shield />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Check Your Email</h2>
            <p className="text-sm text-slate-400 font-medium">We sent a link to <span className="text-white font-bold">{auth.currentUser?.email}</span> to confirm your account.</p>
          </div>
          <div className="space-y-4 pt-4">
            <button 
              onClick={async () => {
                setLoading(true);
                const user = await auth.reloadUser();
                if (user?.emailVerified) onAuthenticated();
                else setError("Still waiting... Please click the link in your email and then try this button again.");
                setLoading(false);
              }}
              className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl"
            >
              {loading ? 'Confirming...' : "I've Clicked the Link"}
            </button>
            <div className="flex flex-col gap-2">
              <button 
                onClick={async () => {
                  try {
                    await auth.sendEmailVerification();
                    setSuccessMsg("Verification email resent!");
                  } catch (e) {
                    setError("Too many requests. Try again later.");
                  }
                }} 
                className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
              >
                Resend verification email
              </button>
              <button onClick={() => auth.signOut()} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Log Out & Restart</button>
            </div>
          </div>
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-xl">{error}</div>}
          {successMsg && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase rounded-xl">{successMsg}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-4">
      <div className="w-full max-w-md glass p-10 md:p-14 rounded-[3rem] border-white/10 shadow-2xl space-y-10 animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center space-y-6">
          <IdeaLabLogo size={80} className="hover:rotate-12 transition-transform" />
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tight">
              {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Get Started' : 'Reset Password'}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">The Build Engine</p>
          </div>
        </div>

        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleProviderSignIn('google')}
                className="h-14 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white text-[10px] font-black uppercase"
              >
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button 
                onClick={() => handleProviderSignIn('github')}
                className="h-14 flex items-center justify-center gap-3 bg-[#24292e] border border-white/10 rounded-2xl hover:bg-black transition-all text-white text-[10px] font-black uppercase shadow-xl"
              >
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
              </button>
           </div>
           
           <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black text-slate-700 uppercase tracking-widest">or email</span>
              <div className="flex-grow border-t border-white/5"></div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Email Address" 
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-sm text-white outline-none focus:border-indigo-600 transition-all placeholder:text-slate-600" 
                required 
              />
              {view !== 'reset' && (
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Password" 
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-sm text-white outline-none focus:border-indigo-600 transition-all placeholder:text-slate-600" 
                  required 
                />
              )}
              
              {error && <p className="text-[10px] font-black text-red-500 uppercase text-center tracking-widest">{error}</p>}
              {successMsg && <p className="text-[10px] font-black text-emerald-500 uppercase text-center tracking-widest">{successMsg}</p>}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full h-16 premium-gradient text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? 'Wait a sec...' : view === 'login' ? 'Let me in' : 'Start Building'}
              </button>
           </form>

           <div className="flex flex-col gap-3 text-center">
              <button 
                onClick={() => setView(view === 'login' ? 'signup' : 'login')} 
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white"
              >
                {view === 'login' ? "Don't have an account?" : "Already have an account?"}
              </button>
              {view === 'login' && (
                <button onClick={() => setView('reset')} className="text-[9px] font-black text-slate-700 uppercase tracking-widest hover:text-white">Forgot password?</button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;
