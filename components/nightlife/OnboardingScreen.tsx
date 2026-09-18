'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Instagram, Camera, X, Plus, Check } from 'lucide-react';
import type { Profile, Vibe, Venue } from '@/lib/types';
import { VIBES } from '@/lib/mock-data';
import { useAuth } from '@/components/AuthProvider';
import { uploadAvatar } from '@/lib/supabase';

interface OnboardingScreenProps {
  onComplete: (profile: Profile) => void;
  onBack: () => void;
  venue?: Venue | null;
  existingProfile?: Profile | null;
}

export function OnboardingScreen({ onComplete, onBack, venue, existingProfile }: OnboardingScreenProps) {
  const { user } = useAuth();
  const [name, setName] = useState(existingProfile?.name ?? '');
  const [age, setAge] = useState(existingProfile ? String(existingProfile.age) : '');
  const [handle, setHandle] = useState(existingProfile?.instagram ?? '');
  const [vibe, setVibe] = useState<Vibe>(existingProfile?.vibe ?? 'En la barra');
  const [photos, setPhotos] = useState<string[]>(existingProfile?.photos ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const file = files[0];
    if (!user) {
      setUploadError('Necesitas iniciar sesión para subir una foto.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const avatarUrl = await uploadAvatar(user.id, file);
      setPhotos([avatarUrl]);
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : 'No se pudo subir la foto.');
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  };

  const complete = () => {
    const profile: Profile = {
      id: 'me',
      name: name || 'Tú',
      age: parseInt(age) || 25,
      instagram: handle || '@noche_user',
      vibe,
      photos: photos.length >= 1 ? photos : [],
      bio: 'Listo para esta noche',
      venueId: venue?.id,
      gender: 'female',
    };
    onComplete(profile);
  };

  const canComplete = name && age && handle && photos.length >= 1 && !isUploading;

  return (
    <div className="min-h-screen pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <header className="sticky top-0 z-30 glass-strong border-b border-border">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-5 py-4">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-bold">Configura tu perfil</h1>
            <p className="text-xs text-muted-foreground">Rápido — menos de 15 segundos</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5 pt-8">
        {/* Photo upload - 1 required */}
        <div className="mb-6">
          <h2 className="mb-1 text-2xl font-bold">Tu foto de perfil</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Sube 1 foto desde tu galería. Es obligatoria para continuar.
          </p>

          {photos.length >= 1 ? (
            <div className="relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-3xl border-2 border-primary/50">
              <img src={photos[0]} alt="Foto de perfil" className="h-full w-full object-cover" />
              <button
                onClick={() => setPhotos([])}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-colors hover:bg-red-500"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-500/80 backdrop-blur-sm">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto mb-4 flex h-48 w-48 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-[0.97]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <Plus className="h-7 w-7" />
              </div>
              <span className="text-sm font-medium">Añadir foto</span>
            </button>
          )}

          {photos.length === 0 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-[0.98]"
            >
              <Camera className="h-4 w-4" />
              Subir foto
            </button>
          )}
          {isUploading && <p className="mt-2 text-center text-xs text-muted-foreground">Subiendo foto...</p>}
          {uploadError && <p className="mt-2 text-center text-xs text-red-400">{uploadError}</p>}
        </div>

        {/* Profile info - all on same screen */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nombre para mostrar</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Valeria"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Edad</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ej. 24"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Tu Instagram
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <Instagram className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@tu_usuario"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Introduce tu usuario manualmente. No vinculamos tu cuenta.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">¿Cuál es tu vibe esta noche?</label>
            <div className="flex flex-wrap gap-2">
              {VIBES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVibe(v)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition-all active:scale-95 ${
                    vibe === v
                      ? 'border-primary bg-primary/15 text-primary glow-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={complete}
          disabled={!canComplete}
          className="mt-6 w-full rounded-2xl bg-neon-gradient py-4 font-bold text-white transition-all active:scale-[0.97] glow-primary disabled:opacity-40 disabled:active:scale-100"
        >
          {venue ? `Entrar en ${venue.name}` : 'Continuar'}
        </button>

        {!canComplete && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Necesitas foto, nombre, edad e Instagram para continuar
          </p>
        )}
      </div>
    </div>
  );
}
