'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Heart, XCircle, Wine, Sparkles } from 'lucide-react';
import type { Venue, Profile, SwipeAction } from '@/lib/types';
import { SwipeCard } from './SwipeCard';
import { MatchOverlay } from './MatchOverlay';

interface VenueLoungeScreenProps {
  venue: Venue;
  deck: Profile[];
  matches: Profile[];
  myProfile: Profile | null;
  activeMatch: Profile | null;
  onSwipe: (action: SwipeAction, profile: Profile) => void;
  onButtonSwipe: (action: SwipeAction) => void;
  onMatchClose: () => void;
  onViewMatches: () => void;
  onExit: () => void;
}

export function VenueLoungeScreen({
  venue,
  deck,
  matches,
  myProfile,
  activeMatch,
  onSwipe,
  onButtonSwipe,
  onMatchClose,
  onViewMatches,
  onExit,
}: VenueLoungeScreenProps) {
  return (
    <div className="relative min-h-screen pb-24">
      <MatchOverlay match={activeMatch} myProfile={myProfile} onClose={onMatchClose} />

      <header className="sticky top-0 z-20 glass border-b border-border">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3">
          <button onClick={onExit} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Salir
          </button>
          <div className="text-center">
            <p className="text-sm font-bold">{venue.name}</p>
            <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <Users className="h-2.5 w-2.5" />
              {venue.goingCount} personas aquí
            </p>
          </div>
          <button onClick={onViewMatches} className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-colors hover:bg-secondary">
            <Heart className="h-4 w-4" />
            {matches.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {matches.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5 pt-6">
        {deck.length > 0 ? (
          <>
            <div className="relative mx-auto h-[520px] max-w-sm">
              <AnimatePresence>
                {deck.slice(0, 3).map((profile, idx) => (
                  <SwipeCard key={profile.id} profile={profile} onSwipe={onSwipe} isTop={idx === 0} index={idx} />
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => onButtonSwipe('pass')}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-card transition-all hover:border-red-500 hover:scale-110 active:scale-95"
              >
                <XCircle className="h-7 w-7 text-red-500" />
              </button>
              <button
                onClick={() => onButtonSwipe('superlike')}
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 bg-card transition-all hover:scale-110 active:scale-95 glow-accent"
                style={{ borderColor: 'hsl(320 100% 50%)' }}
              >
                <Wine className="h-8 w-8" style={{ color: 'hsl(320 100% 50%)' }} />
              </button>
              <button
                onClick={() => onButtonSwipe('like')}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-card transition-all hover:border-green-500 hover:scale-110 active:scale-95"
              >
                <Heart className="h-7 w-7 fill-green-500 text-green-500" />
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Desliza para descubrir gente en {venue.name}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Has visto a todos</h2>
            <p className="mt-1 text-sm text-muted-foreground">No hay más personas en {venue.name} por ahora.</p>
            {matches.length > 0 && (
              <button
                onClick={onViewMatches}
                className="mt-6 rounded-2xl bg-neon-gradient px-6 py-3 text-sm font-bold text-white transition-all active:scale-95 glow-primary"
              >
                Ver {matches.length} matches
              </button>
            )}
            <button
              onClick={onExit}
              className="mt-3 rounded-2xl border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cambiar de venue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
