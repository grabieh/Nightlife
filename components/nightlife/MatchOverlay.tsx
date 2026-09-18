'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, MessageCircle, Heart } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { Confetti } from './Confetti';
import { ICEBREAKERS } from '@/lib/mock-data';

interface MatchOverlayProps {
  match: Profile | null;
  myProfile: Profile | null;
  onClose: () => void;
}

export function MatchOverlay({ match, myProfile, onClose }: MatchOverlayProps) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(280 100% 65% / 0.15), hsl(270 50% 4% / 0.95))',
          }}
        >
          <Confetti />

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="mb-6 flex items-center gap-2"
          >
            <Heart className="h-8 w-8 fill-primary text-primary glow-primary" />
            <h1 className="text-4xl font-bold text-glow-primary" style={{ color: 'hsl(280 100% 65%)' }}>
              ¡MATCH!
            </h1>
            <Heart className="h-8 w-8 fill-accent text-accent glow-accent" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 text-center text-sm text-muted-foreground"
          >
            Os habéis cruzado esta noche
          </motion.p>

          <div className="mb-8 flex items-center justify-center gap-4 sm:gap-8">
            <motion.div
              initial={{ x: -100, opacity: 0, rotate: -15 }}
              animate={{ x: 0, opacity: 1, rotate: -6 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
              className="relative"
            >
              <div
                className="h-32 w-32 overflow-hidden rounded-2xl border-2 sm:h-40 sm:w-40"
                style={{ borderColor: 'hsl(280 100% 65%)', boxShadow: '0 0 30px hsl(280 100% 65% / 0.5)' }}
              >
                {myProfile?.photos[0] && (
                  <img src={myProfile.photos[0]} alt="Tú" className="h-full w-full object-cover" />
                )}
              </div>
              <p className="mt-2 text-center text-sm font-semibold">{myProfile?.name ?? 'Tú'}</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.5 }}
              className="text-3xl"
              style={{ color: 'hsl(320 100% 50%)' }}
            >
              ✕
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0, rotate: 15 }}
              animate={{ x: 0, opacity: 1, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
              className="relative"
            >
              <div
                className="h-32 w-32 overflow-hidden rounded-2xl border-2 sm:h-40 sm:w-40"
                style={{ borderColor: 'hsl(320 100% 50%)', boxShadow: '0 0 30px hsl(320 100% 50% / 0.5)' }}
              >
                <img src={match.photos[0]} alt={match.name} className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 text-center text-sm font-semibold">{match.name}, {match.age}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex w-full max-w-sm flex-col gap-3"
          >
            <a
              href={`https://instagram.com/${match.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-transform active:scale-95"
              style={{
                background: 'linear-gradient(135deg, hsl(280 100% 65%), hsl(320 100% 50%))',
                color: 'white',
                boxShadow: '0 0 20px hsl(280 100% 65% / 0.4)',
              }}
            >
              <Instagram className="h-5 w-5" />
              Ver Instagram
            </a>

            <div className="rounded-xl border border-border p-3">
              <p className="mb-2 text-center text-xs text-muted-foreground">Mensajes de barra</p>
              <div className="flex flex-wrap justify-center gap-2">
                {ICEBREAKERS.slice(0, 4).map((msg) => (
                  <button
                    key={msg}
                    onClick={onClose}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary active:scale-95"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-95"
            >
              <X className="h-4 w-4" />
              Seguir descubriendo
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
