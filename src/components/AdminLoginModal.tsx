import React, { useState } from 'react';
import { verifyAdminPassword, saveAdminSession } from '../utils/cryptoAuth';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, X, KeyRound } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the tournament admin password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        saveAdminSession();
        setPassword('');
        onLoginSuccess();
        onClose();
      } else {
        setError('Invalid admin credentials. Access denied.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0e121d] border border-white/15 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Ambient red glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">
                Admin Control Room
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Master Tournament Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                autoFocus
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-900/40 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Unlock Control Room'}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-white/5">
            Default credentials authorized for Garam Prix organizers.
          </div>
        </form>
      </div>
    </div>
  );
};
