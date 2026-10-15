import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Cloud, CloudOff, LogIn, LogOut, UserPlus, Key, Mail, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncTriggered?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSyncTriggered }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUserEmail(data.user.email ?? 'Connected');
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserEmail(session?.user.email ?? null);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error: signUpErr, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpErr) throw signUpErr;
        if (data.user && !data.session) {
          setMessage('Account created! Please check your email to verify your account.');
        } else {
          setMessage('Account created & logged in successfully!');
          if (onSyncTriggered) onSyncTriggered();
        }
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
        setMessage('Successfully logged in!');
        if (onSyncTriggered) onSyncTriggered();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    setUserEmail(null);
    setMessage('Logged out successfully.');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f111a] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Supabase Cloud Sync
              </h2>
              <p className="text-xs text-gray-400">Backup & sync daily records across devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase status check */}
        {!isSupabaseConfigured ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Supabase Not Configured
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Winter Arc is running in local-first mode (`localStorage`). To enable cloud sync:
                </p>
              </div>
            </div>

            <div className="bg-[#090a0f] p-3 rounded-lg border border-gray-800 text-[11px] font-mono text-gray-300 space-y-1.5">
              <p className="text-gray-400 font-sans">Add to <code className="text-sky-400">.env</code> file:</p>
              <div className="text-sky-300">VITE_SUPABASE_URL=https://xyz.supabase.co</div>
              <div className="text-sky-300">VITE_SUPABASE_ANON_KEY=eyJ...</div>
            </div>

            <p className="text-[11px] text-gray-400">
              Run <code className="text-amber-300 font-mono">supabase/schema.sql</code> in your Supabase SQL Editor to set up tables.
            </p>
          </div>
        ) : userEmail ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-emerald-300">Connected & Synced</div>
                  <div className="text-xs font-mono text-gray-300">{userEmail}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onSyncTriggered) onSyncTriggered();
                  setMessage('Cloud sync completed!');
                }}
                className="px-2.5 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Now
              </button>
            </div>

            {message && (
              <p className="text-xs font-medium text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                {message}
              </p>
            )}

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#090a0f] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-sky-400" /> Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090a0f] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" /> Create Supabase Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In & Sync
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-sky-400 hover:underline cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
