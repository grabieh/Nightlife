'use client';

import { motion } from 'framer-motion';
import { Moon, QrCode, MessageCircle, User } from 'lucide-react';
import type { TabScreen } from '@/lib/types';

interface BottomNavProps {
  active: TabScreen;
  onChange: (tab: TabScreen) => void;
  matchCount: number;
  unreadCount: number;
}

const TABS: { id: TabScreen; label: string; icon: typeof Moon }[] = [
  { id: 'discotecas', label: 'Discotecas', icon: Moon },
  { id: 'qr', label: 'Escanear', icon: QrCode },
  { id: 'chats', label: 'Chats', icon: MessageCircle },
  { id: 'perfil', label: 'Perfil', icon: User },
];

export function BottomNav({ active, onChange, matchCount, unreadCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          const badge = tab.id === 'chats' ? unreadCount : 0;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-0.5 h-0.5 w-8 rounded-full"
                  style={{ background: 'hsl(280 100% 65%)', boxShadow: '0 0 8px hsl(280 100% 65%)' }}
                />
              )}
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                {badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
