import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { ICONS } from '../constants';

interface AuthOverlayProps {
  onAuthenticated: () => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await auth.signIn(email, password);
      } else {
        await auth.signUp(email, password);
      }
      onAuthenticated();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500 p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
        
        <div className="p-10 md:p-12 space-y-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform">
              <ICONS.Layers />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                {isLogin ? 'AUTHORIZE ACCESS' : 'CREATE PROTOCOL'}
              </h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                IDEA LAB AI // ACCESS ENGINE v12
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identity Endpoint (Email)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                />
              </div>
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
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center text-xs font-black uppercase tracking-widest animate-shake">
                {error}
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
                isLogin ? 'INITIALIZE ENGINE' : 'CREATE PROTOCOL'
              )}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "Need a protocol? Create Account →" : "Already registered? Authorize Access →"}
            </button>
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