'use client';

import { useState } from 'react';
import { motion, useMotionValue, type PanInfo } from 'framer-motion';
import { Instagram } from 'lucide-react';
import type { Profile, SwipeAction } from '@/lib/types';

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (action: SwipeAction, profile: Profile) => void;
  isTop: boolean;
  index: number;
}

const ACTION_INDICATORS = {
  like: { text: 'LIKE', color: 'hsl(150 80% 50%)', rotate: -20 },
  pass: { text: 'NOPE', color: 'hsl(0 84% 60%)', rotate: 20 },
  superlike: { text: 'COPA', color: 'hsl(320 100% 50%)', rotate: 0 },
};

export function SwipeCard({ profile, onSwipe, isTop, index }: SwipeCardProps) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const x = useMotionValue(0);
  const [dragState, setDragState] = useState<SwipeAction | null>(null);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.y < -threshold) {
      onSwipe('superlike', profile);
    } else if (info.offset.x > threshold) {
      onSwipe('like', profile);
    } else if (info.offset.x < -threshold) {
      onSwipe('pass', profile);
    }
    setDragState(null);
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -80) setDragState('superlike');
    else if (info.offset.x > 80) setDragState('like');
    else if (info.offset.x < -80) setDragState('pass');
    else setDragState(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev + 1) % profile.photos.length);
  };

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0"
        style={{
          scale: 1 - index * 0.04,
          y: index * 12,
          zIndex: 10 - index,
          opacity: Math.max(0, 1 - index * 0.2),
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-border bg-card">
          <img
            src={profile.photos[0]}
            alt={profile.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      </motion.div>
    );
  }

  const indicator = dragState ? ACTION_INDICATORS[dragState] : null;

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, zIndex: 10 }}
      drag
      dragSnapToOrigin
      dragElastic={0.7}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl border-2 border-border bg-card shadow-2xl">
        {/* Photo */}
        <div className="relative h-full w-full" onClick={nextPhoto}>
          <img
            src={profile.photos[photoIdx]}
            alt={profile.name}
            className="h-full w-full object-cover"
            draggable={false}
          />

          {/* Photo indicators */}
          <div className="absolute left-0 right-0 top-3 flex justify-center gap-1.5">
            {profile.photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === photoIdx ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Swipe indicators */}
          {indicator && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className="rounded-xl border-4 px-6 py-2 text-3xl font-bold"
                style={{
                  borderColor: indicator.color,
                  color: indicator.color,
                  transform: `rotate(${indicator.rotate}deg)`,
                  textShadow: `0 0 20px ${indicator.color}`,
                }}
              >
                {indicator.text}
              </div>
            </motion.div>
          )}

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="mb-2 flex items-end gap-2">
              <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
              <span className="mb-1 text-lg text-white/80">{profile.age}</span>
            </div>

            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: 'hsl(280 100% 65% / 0.25)',
                  color: 'hsl(280 100% 80%)',
                  border: '1px solid hsl(280 100% 65% / 0.4)',
                }}
              >
                {profile.vibe}
              </span>
            </div>

            <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
              <Instagram className="h-4 w-4" />
              {profile.instagram}
            </div>

            <p className="text-sm text-white/80">{profile.bio}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
