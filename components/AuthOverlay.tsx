
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { ICONS } from '../constants';
import { IdeaLabLogo } from './Logo';
import { getAuthErrorMessage } from '../utils/authErrors';

interface AuthOverlayProps {
  onAuthenticated: () => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onAuthenticated }) => {
  const [view, setView] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (view === 'login') {
        await auth.signIn(email, password);
        onAuthenticated();
      } else if (view === 'signup') {
        await auth.signUp(email, password);
        setSuccessMsg("Profile synced. Verify your endpoint to activate core.");
        setTimeout(() => onAuthenticated(), 3000);
      } else if (view === 'reset') {
        await auth.resetPassword(email);
        setSuccessMsg("Recovery data dispatched.");
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await auth.signInWithGoogle();
      onAuthenticated();
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500 p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-in zoom-in-95">
        
        <div className="p-10 md:p-12 space-y-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative transform group-hover:scale-110 transition-transform">
              <IdeaLabLogo size={70} />
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                {view === 'login' ? 'System Login' : view === 'signup' ? 'Core Initialization' : 'Recovery Sync'}
              </h1>
              <p className="tracking-hyper text-indigo-600 mt-1">
                IDEA LAB // CORE v12
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {view !== 'reset' && (
              <div className="space-y-3">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-all group disabled:opacity-50 shadow-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
                  )}
                  <span className="tracking-hyper text-[9px]">{loading ? 'SCANNING...' : 'CONTINUE WITH GOOGLE'}</span>
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 tracking-hyper text-[8px] text-slate-300">OR DIRECT CHANNEL</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="tracking-hyper text-[8px] text-slate-400 px-1">ENDPOINT (EMAIL)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@endpoint.com"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold focus:outline-none focus:border-indigo-600 transition-all"
                  />
                </div>
                {view !== 'reset' && (
                  <div className="space-y-1.5">
                    <label className="tracking-hyper text-[8px] text-slate-400 px-1">ACCESS KEY (PASSWORD)</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold focus:outline-none focus:border-indigo-600 transition-all"
                    />
                  </div>
                )}
              </div>

              {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl tracking-hyper text-[8px] text-center">{error}</div>}
              {successMsg && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl tracking-hyper text-[8px] text-center">{successMsg}</div>}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-16 premium-gradient text-white rounded-2xl tracking-hyper text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : view === 'login' ? 'INITIALIZE LINK' : 'CREATE CORE ID'}
              </button>
            </form>
          </div>

          <div className="flex flex-col items-center gap-4">
              <button 
                onClick={() => { setView(view === 'signup' ? 'login' : 'signup'); setError(null); }}
                className="tracking-hyper text-[8px] text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {view === 'signup' ? "EXISTING CORE? LOG IN" : "NEW ARCHITECT? SYNC UP"}
              </button>
              {view === 'login' && (
                <button 
                  onClick={() => setView('reset')}
                  className="tracking-hyper text-[8px] text-slate-400 hover:text-rose-500"
                >
                  LOST ACCESS KEY?
                </button>
              )}
          </div>
        </div>

        <div className="bg-slate-900 py-5 text-center tracking-hyper text-[8px] text-white/20">
          ENCRYPTED SUCCESS ENGINE // SESSION ACTIVE
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;
