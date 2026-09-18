'use client';

import { useEffect, useState } from 'react';

const COLORS = [
  'hsl(280 100% 65%)',
  'hsl(320 100% 50%)',
  'hsl(190 100% 50%)',
  'hsl(40 100% 55%)',
  'hsl(0 100% 60%)',
  'hsl(150 80% 50%)',
];

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'rect';
}

export function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const newPieces: Piece[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      shape: ['circle', 'square', 'rect'][Math.floor(Math.random() * 3)] as Piece['shape'],
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: p.shape === 'rect' ? `${p.size * 0.4}px` : `${p.size}px`,
            height: p.shape === 'rect' ? `${p.size * 1.5}px` : `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '1px',
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
