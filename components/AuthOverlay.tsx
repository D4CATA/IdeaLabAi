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
        const { user } = await auth.signIn(email, password);
        // Better check: Reload to get the most fresh status from the provider
        const reloadedUser = await auth.reloadUser();
        if (reloadedUser && !reloadedUser.emailVerified) {
          setView('verify');
        } else {
          onAuthenticated();
        }
      } else if (view === 'signup') {
        await auth.signUp(email, password);
        setView('verify');
        setSuccessMsg("Verification email sent.");
      } else if (view === 'reset') {
        await auth.resetPassword(email);
        setSuccessMsg("Password reset email sent.");
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await auth.sendEmailVerification();
      setSuccessMsg("New link sent. Check your inbox.");
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerificationStatus = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const reloadedUser = await auth.reloadUser();
      if (reloadedUser && reloadedUser.emailVerified) {
        onAuthenticated(); 
      } else {
        setError("Your account is still unverified. Please check your email or try again in a moment.");
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
      const { user } = await auth.signInWithGoogle();
      // Similar check for Google sign-in
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

  const renderVerifyView = () => (
    <div className="space-y-8 animate-in fade-in zoom-in-95">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ICONS.Shield />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">VERIFY YOUR EMAIL</h2>
          <p className="text-sm text-slate-500 font-medium px-4 leading-relaxed">
            We've sent a secure link to <span className="text-slate-900 font-bold">{auth.currentUser?.email}</span>. Please click it to activate your account.
          </p>
        </div>
      </div>

      <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-700">
          <ICONS.Bolt />
          <span className="text-[10px] font-black uppercase tracking-widest">Important</span>
        </div>
        <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
          Verification emails often end up in <span className="underline">Spam</span>. Please check there if you don't see it.
        </p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleCheckVerificationStatus}
          disabled={loading}
          className="w-full h-16 premium-gradient text-white rounded-2xl tracking-hyper text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 font-black"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'I HAVE VERIFIED MY EMAIL'
          )}
        </button>

        <button 
          onClick={handleResendVerification}
          disabled={loading}
          className="w-full h-16 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl tracking-hyper text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all font-black"
        >
          {loading ? 'SENDING...' : 'RESEND VERIFICATION LINK'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100">{error}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold text-center border border-emerald-100">{successMsg}</div>}

      <button 
        onClick={() => auth.signOut()}
        className="w-full text-slate-400 font-black tracking-hyper text-[8px] uppercase hover:text-slate-900 transition-colors"
      >
        GO BACK TO SIGN IN
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500 p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-in zoom-in-95">
        
        <div className="p-10 md:p-12 space-y-10">
          {view !== 'verify' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative transform group-hover:scale-110 transition-transform">
                <IdeaLabLogo size={70} />
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                  {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Reset Password'}
                </h1>
                <p className="tracking-hyper text-indigo-600 mt-1 font-black">
                  IDEA LAB AI PRO
                </p>
              </div>
            </div>
          )}

          {view === 'verify' ? renderVerifyView() : (
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
                    <span className="font-bold text-[10px] tracking-wider uppercase">{loading ? 'Searching...' : 'Continue with Google'}</span>
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink mx-4 tracking-hyper text-[8px] text-slate-300 font-black">OR EMAIL</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold focus:outline-none focus:border-indigo-600 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  {view !== 'reset' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Min. 8 characters"
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold focus:outline-none focus:border-indigo-600 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  )}
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100">{error}</div>}
                {successMsg && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold text-center border border-emerald-100">{successMsg}</div>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 premium-gradient text-white rounded-2xl tracking-hyper text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 font-black"
                >
                  {loading ? 'PLEASE WAIT...' : view === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </button>
              </form>

              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => { setView(view === 'signup' ? 'login' : 'signup'); setError(null); }}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {view === 'signup' ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
                {view === 'login' && (
                  <button 
                    onClick={() => setView('reset')}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 py-5 text-center tracking-hyper text-[8px] text-white/20 font-black uppercase">
          SECURE ENTERPRISE LAYER // PRO ACCESS
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;