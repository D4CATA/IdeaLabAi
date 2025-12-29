
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { ICONS } from '../constants';

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
        setSuccessMsg("Protocol created. Check your inbox to verify your identity.");
        // We stay on sign-up or switch to login with a message
        setTimeout(() => onAuthenticated(), 3000);
      } else if (view === 'reset') {
        await auth.resetPassword(email);
        setSuccessMsg("Recovery link dispatched to your endpoint.");
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Action failed. Please check your parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("Google Provider is being optimized. Please use Email/Password protocol.");
    // In a real environment: await auth.signInWithGoogle();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500 p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
        
        <div className="p-10 md:p-12 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform">
              <ICONS.Layers />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                {view === 'login' ? 'Authorize Access' : view === 'signup' ? 'Create Protocol' : 'Recover Access'}
              </h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                IDEA LAB AI // ACCESS ENGINE v12
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Social Login */}
            {view !== 'reset' && (
              <div className="space-y-4">
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 group"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
                  <span className="text-xs uppercase tracking-widest">Sign in with Google</span>
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">or use protocol</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Endpoint (Email)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                  />
                </div>
                {view !== 'reset' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Access Key (Password)</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center text-[10px] font-black uppercase tracking-widest animate-shake">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-center text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">
                  {successMsg}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-16 premium-gradient text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  view === 'login' ? 'Initialize Engine' : view === 'signup' ? 'Deploy Protocol' : 'Send Recovery link'
                )}
              </button>
            </form>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView(view === 'signup' ? 'login' : 'signup')}
                className="text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-indigo-600 transition-colors"
              >
                {view === 'signup' ? "Existing protocol? Authorize →" : "New access? Create Protocol →"}
              </button>
              
              {view === 'login' && (
                <button 
                  onClick={() => setView('reset')}
                  className="text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-rose-500 transition-colors"
                >
                  Forgot Key?
                </button>
              )}
            </div>

            {view === 'reset' && (
              <button 
                onClick={() => setView('login')}
                className="text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-indigo-600 transition-colors"
              >
                Back to Authorization
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-900 py-6 text-center text-[9px] font-black text-white/30 uppercase tracking-[0.5em]">
          ENCRYPTED CONSULTING SESSION // v12.1
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;
