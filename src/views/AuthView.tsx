import React, { useState } from 'react';
import { Layers, ArrowRight, Loader2, Lock, Mail, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthView: React.FC = () => {
  const { login, register, loginDemo } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginDemo();
    } catch (err: any) {
      setError(err.message || 'Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EADA] flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-[#EBDCC6] border border-[#D4C3A9] rounded-xl flex items-center justify-center text-[#B18A4A] shadow-xs">
            <Layers className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-medium tracking-tight text-[#33231D]">DesignVault</h1>
            <p className="text-xs text-[#766457] mt-1 font-sans italic">Classical Art & Digital Inspiration Archive</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#FAF5EB] border border-[#D4C3A9] rounded-xl p-6 shadow-xl space-y-5">
          {error && (
            <div className="p-3 bg-[#651F24]/10 border border-[#651F24]/30 rounded-md text-xs text-[#651F24]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-serif font-medium text-[#33231D]">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6831]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    placeholder="Ashutosh"
                    className="w-full bg-[#F4EADA] border border-[#D4C3A9] rounded-md pl-9 pr-3 py-2 text-xs text-[#33231D] focus:outline-none focus:border-[#B18A4A]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-serif font-medium text-[#33231D]">Curator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6831]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="adhoundiyal20@gmail.com"
                  className="w-full bg-[#F4EADA] border border-[#D4C3A9] rounded-md pl-9 pr-3 py-2 text-xs text-[#33231D] focus:outline-none focus:border-[#B18A4A]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-serif font-medium text-[#33231D]">Passphrase</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6831]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#F4EADA] border border-[#D4C3A9] rounded-md pl-9 pr-3 py-2 text-xs text-[#33231D] focus:outline-none focus:border-[#B18A4A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#651F24] hover:bg-[#7B282E] text-[#F4EADA] text-xs font-medium tracking-wide rounded-md transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{mode === 'signin' ? 'Enter Curatorial Archive' : 'Create Curator Account'}</span>
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-3 border-t border-[#E2D6C2]">
            <button
              type="button"
              onClick={handleDemoAccess}
              disabled={loading}
              className="w-full py-2 px-3 bg-[#EBDCC6] hover:bg-[#E0CFB5] text-xs font-medium text-[#33231D] border border-[#D4C3A9] rounded-md transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5 text-[#8C6831]" />
              <span>Quick Personal Access (Ashutosh)</span>
            </button>
          </div>

          {/* Toggle Mode */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'register' : 'signin');
                setError(null);
              }}
              className="text-xs text-[#766457] hover:text-[#651F24] transition-colors"
            >
              {mode === 'signin' ? "Need a curator account? Register here" : 'Already registered? Enter archive'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
