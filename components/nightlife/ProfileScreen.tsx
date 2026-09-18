'use client';

import { motion } from 'framer-motion';
import { Instagram, Heart, MessageCircle, Moon, Edit2, LogOut, Trash2 } from 'lucide-react';
import type { Profile, Venue } from '@/lib/types';

interface ProfileScreenProps {
  profile: Profile | null;
  venue: Venue | null;
  matchCount: number;
  chatCount: number;
  onEdit: () => void;
  onSignOut: () => void;
  onDelete: () => void;
  isAccountActionLoading: boolean;
}

export function ProfileScreen({ profile, venue, matchCount, chatCount, onEdit, onSignOut, onDelete, isAccountActionLoading }: ProfileScreenProps) {
  if (!profile) {
    return (
      <div className="pb-24">
        <header className="sticky top-0 z-30 glass-strong border-b border-border">
          <div className="mx-auto max-w-lg px-5 py-4">
            <h1 className="text-lg font-bold">Perfil</h1>
          </div>
        </header>
        <div className="mx-auto max-w-lg px-5 pt-24 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Moon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">Aún no tienes perfil</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ve a Discotecas, elige un venue y configura tu perfil para empezar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-30 glass-strong border-b border-border">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
          <h1 className="text-lg font-bold">Perfil</h1>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Edit2 className="h-3 w-3" />
            Editar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5 pt-6">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="mt-3 text-2xl font-bold">{profile.name}, {profile.age}</h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Instagram className="h-3.5 w-3.5" />
            {profile.instagram}
          </p>
          <div className="mt-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: 'hsl(280 100% 65% / 0.15)',
                color: 'hsl(280 100% 80%)',
                border: '1px solid hsl(280 100% 65% / 0.3)',
              }}
            >
              {profile.vibe}
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <Heart className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold">{matchCount}</p>
            <p className="text-xs text-muted-foreground">Matches</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <MessageCircle className="mx-auto mb-1 h-5 w-5 text-accent" />
            <p className="text-2xl font-bold">{chatCount}</p>
            <p className="text-xs text-muted-foreground">Chats activos</p>
          </div>
        </div>

        {/* Current venue */}
        {venue && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Venue actual</p>
            <div className="flex items-center gap-3">
              <img src={venue.coverImage} alt={venue.name} className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-bold">{venue.name}</p>
                <p className="text-xs text-muted-foreground">{venue.address}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <img
            src={profile.photos[0]}
            alt={profile.name}
            className="h-48 w-48 rounded-3xl object-cover border-2"
            style={{ borderColor: 'hsl(280 100% 65%)', boxShadow: '0 0 20px hsl(280 100% 65% / 0.4)' }}
          />
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={onSignOut}
            disabled={isAccountActionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
          <button
            onClick={onDelete}
            disabled={isAccountActionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 py-3 text-sm font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {isAccountActionLoading ? 'Borrando cuenta...' : 'Borrar cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}
