'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock } from 'lucide-react';
import type { Venue } from '@/lib/types';

interface DiscotecasScreenProps {
  venues: Venue[];
  onSelectVenue: (venue: Venue) => void;
  isLoggedIn: boolean;
  onRequestAuth: (action: 'enter', venue: Venue) => void;
}

export function DiscotecasScreen({ venues, onSelectVenue, isLoggedIn, onRequestAuth }: DiscotecasScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVenues = useMemo(() => {
    if (!searchQuery) return venues;
    return venues.filter(
      (v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.music.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [venues, searchQuery]);

  const handleEnter = (venue: Venue) => {
    if (!isLoggedIn) {
      onRequestAuth('enter', venue);
    } else {
      onSelectVenue(venue);
    }
  };

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-30 glass-strong border-b border-border">
        <div className="relative mx-auto flex max-w-lg items-center justify-center px-5 py-4">
          <h1
            className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-500 bg-clip-text text-2xl font-black tracking-tight text-transparent"
            style={{ textShadow: '0 0 18px hsl(320 100% 60% / 0.35)' }}
          >
            After
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5 pt-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Busca discoteca, zona o música..."
            className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {filteredVenues.length} venues activos
            </h3>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              En vivo
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredVenues.map((venue, idx) => (
              <motion.div
                key={venue.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-primary/50"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={venue.coverImage}
                    alt={venue.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
                    <span className="text-xs font-medium text-white">👥 {venue.goingCount} en vivo</span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{venue.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-white/70">
                      <MapPin className="h-3 w-3" />
                      {venue.address}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                      {venue.music}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                      <Clock className="h-3 w-3" />
                      Hasta {venue.openUntil}
                    </span>
                  </div>

                  <div className="flex">
                    <button
                      onClick={() => handleEnter(venue)}
                      className="group/enter flex w-full items-center justify-center gap-2 rounded-xl bg-neon-gradient py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:brightness-110 hover:shadow-lg active:scale-[0.97] active:brightness-90 glow-primary"
                    >
                      Entrar <span className="transition-transform duration-200 group-hover/enter:translate-x-1">→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredVenues.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p>No se encontraron venues para "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
