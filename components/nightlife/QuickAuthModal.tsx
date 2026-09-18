'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Apple, ChevronRight, Check, Moon } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

interface QuickAuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (method: AuthMethod) => void;
  message?: string;
}

export type AuthMethod = 'google' | 'apple' | 'phone';

interface PhoneStep {
  phone: string;
  code: string;
  sent: boolean;
  verifying: boolean;
  verified: boolean;
}

export function QuickAuthModal({ open, onClose, onAuthenticated, message }: QuickAuthModalProps) {
  const [phoneStep, setPhoneStep] = useState<PhoneStep>({
    phone: '',
    code: '',
    sent: false,
    verifying: false,
    verified: false,
  });
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setSelectedMethod('google');
    setError(null);
    const { error: authError } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (authError) {
      setSelectedMethod(null);
      setError(authError.message);
    }
  };

  const handleApple = () => {
    setSelectedMethod('apple');
    setTimeout(() => onAuthenticated('apple'), 1200);
  };

  const handleSendCode = () => {
    if (phoneStep.phone.length < 6) return;
    setPhoneStep((prev) => ({ ...prev, sent: true }));
  };

  const handleVerifyCode = () => {
    if (phoneStep.code.length < 4) return;
    setPhoneStep((prev) => ({ ...prev, verifying: true }));
    setTimeout(() => {
      setPhoneStep((prev) => ({ ...prev, verifying: false, verified: true }));
      setTimeout(() => onAuthenticated('phone'), 600);
    }, 1000);
  };

  const reset = () => {
    setPhoneStep({ phone: '', code: '', sent: false, verifying: false, verified: false });
    setSelectedMethod(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ background: 'hsl(270 50% 4% / 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative w-full max-w-lg rounded-t-3xl border border-border bg-card p-6 pb-8 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

            <button
              onClick={handleClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Logo + title */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-gradient glow-primary">
                <Moon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Entra en After</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {message ?? 'Acceso rápido — en menos de 5 segundos'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}

              {/* Loading state */}
              {selectedMethod && !phoneStep.verified && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent"
                  />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {selectedMethod === 'google' && 'Conectando con Google...'}
                    {selectedMethod === 'apple' && 'Conectando con Apple...'}
                    {selectedMethod === 'phone' && 'Verificando código...'}
                  </p>
                </motion.div>
              )}

              {/* Phone verified */}
              {phoneStep.verified && (
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                    <Check className="h-7 w-7 text-green-500" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-green-500">Verificado</p>
                </motion.div>
              )}

              {/* Main auth options */}
              {!selectedMethod && (
                <motion.div
                  key="options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Google */}
                  <button
                    onClick={handleGoogle}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5 text-sm font-semibold transition-all hover:border-primary/50 active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                  </button>

                  {/* Apple */}
                  <button
                    onClick={handleApple}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5 text-sm font-semibold transition-all hover:border-primary/50 active:scale-[0.98]"
                  >
                    <Apple className="h-5 w-5" />
                    Continuar con Apple
                  </button>

                  {/* Phone */}
                  {!phoneStep.sent ? (
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">Continuar con teléfono</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={phoneStep.phone}
                          onChange={(e) => setPhoneStep((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="+34 600 000 000"
                          className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                        />
                        <button
                          onClick={handleSendCode}
                          disabled={phoneStep.phone.length < 6}
                          className="rounded-xl bg-neon-gradient px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-primary/40 bg-background p-4 glow-primary"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Código enviado a {phoneStep.phone}</span>
                      </div>
                      <p className="mb-3 text-xs text-muted-foreground">
                        Introduce el código de 4 dígitos (usa cualquier número para simular)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={phoneStep.code}
                          onChange={(e) => setPhoneStep((prev) => ({ ...prev, code: e.target.value.replace(/\D/g, '') }))}
                          placeholder="0000"
                          className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-center text-lg tracking-[0.5em] outline-none transition-colors focus:border-primary"
                        />
                        <button
                          onClick={handleVerifyCode}
                          disabled={phoneStep.code.length < 4 || phoneStep.verifying}
                          className="flex items-center gap-1 rounded-xl bg-neon-gradient px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
                        >
                          {phoneStep.verifying ? '...' : 'OK'}
                          {!phoneStep.verifying && <ChevronRight className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            {!selectedMethod && (
              <p className="mt-5 text-center text-[10px] text-muted-foreground">
                Al continuar aceptas los Términos y la Política de Privacidad de After.
                No publicamos nada en tus redes.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
