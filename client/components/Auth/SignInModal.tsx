'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ShieldCheck, Zap } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (provider: string, options?: any) => void;
}

export default function SignInModal({ isOpen, onClose, onSignIn }: SignInModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10 pt-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-3 italic tracking-tight">Sign in</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sign in with Google to use <span className="font-bold text-white">GeoTag Free</span>.
                  <br />
                  You're already using <span className="font-bold text-primary">GeoTag Pro!</span>
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => onSignIn('google')}
                  className="w-full py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-muted-foreground">Or test it now</span>
                  </div>
                </div>

                <button
                  onClick={() => onSignIn('credentials', { username: 'demo', password: 'demo', callbackUrl: '/tool' })}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-white/5 flex items-center justify-center gap-3"
                >
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Try Demo Login
                </button>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 space-y-4 text-[11px] text-muted-foreground leading-relaxed text-center">
                <p>
                  If you already have a <span className="text-white font-semibold">Pro</span> subscription then you don't need to sign in. 
                  Just close this dialog and enter your license key at the top.
                </p>
                <p>
                  Signing in with Google still has the advantage that your license key is remembered across browsers and devices.
                </p>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-2 bg-gradient-to-r from-blue-600 via-primary to-emerald-500" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
