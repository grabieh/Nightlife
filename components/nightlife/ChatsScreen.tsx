'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Instagram, MessageCircle } from 'lucide-react';
import type { Profile, ChatThread } from '@/lib/types';
import { ICEBREAKERS } from '@/lib/mock-data';

interface ChatsScreenProps {
  matches: Profile[];
  threads: Record<string, ChatThread>;
  onSendMessage: (profileId: string, text: string) => void;
  onOpenChat: (profileId: string) => void;
  onCloseChat: () => void;
  onOpenInstagram: (handle: string) => void;
  currentUserId: string;
}

export function ChatsScreen({ matches, threads, onSendMessage, onOpenChat, onCloseChat, onOpenInstagram, currentUserId }: ChatsScreenProps) {
  const [openChat, setOpenChat] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sortedMatches = [...matches].sort((a, b) => {
    const ta = threads[a.id]?.lastTimestamp ?? 0;
    const tb = threads[b.id]?.lastTimestamp ?? 0;
    return tb - ta;
  });

  const currentProfile = openChat ? matches.find((m) => m.id === openChat) : null;
  const currentThread = openChat ? threads[openChat] : null;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentThread?.messages.length]);

  const handleSend = () => {
    if (!inputText.trim() || !openChat) return;
    onSendMessage(openChat, inputText.trim());
    setInputText('');
  };

  // ===== CHAT CONVERSATION VIEW =====
  if (currentProfile && currentThread) {
    return (
      <div className="flex min-h-screen flex-col pb-24">
        <header className="sticky top-0 z-30 glass-strong border-b border-border">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-5 py-3">
            <button
              onClick={() => {
                setOpenChat(null);
                onCloseChat();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <img src={currentProfile.photos[0]} alt={currentProfile.name} className="h-9 w-9 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-sm font-bold">{currentProfile.name}, {currentProfile.age}</p>
              <p className="text-[10px] text-muted-foreground">{currentProfile.vibe}</p>
            </div>
            <button
              onClick={() => onOpenInstagram(currentProfile.instagram)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-colors hover:bg-secondary"
            >
              <Instagram className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pt-4">
          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto pb-4">
            {currentThread.messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe
                        ? 'bg-neon-gradient text-white'
                        : 'border border-border bg-card text-foreground'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Icebreakers */}
          {currentThread.messages.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {ICEBREAKERS.slice(0, 3).map((ice) => (
                <button
                  key={ice}
                  onClick={() => onSendMessage(currentProfile.id, ice)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
                >
                  {ice}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-background/80 py-3 backdrop-blur-md">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-gradient text-white transition-all active:scale-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== CHAT LIST VIEW =====
  return (
    <div className="pb-24">
      <header className="sticky top-0 z-30 glass-strong border-b border-border">
        <div className="mx-auto max-w-lg px-5 py-4">
          <h1 className="text-lg font-bold">Chats</h1>
          <p className="text-xs text-muted-foreground">Tus conexiones de esta noche</p>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5 pt-4">
        {sortedMatches.length > 0 ? (
          <>
            <div className="space-y-2">
              <AnimatePresence>
                {sortedMatches.map((profile, idx) => {
                  const thread = threads[profile.id];
                  return (
                    <motion.button
                      key={profile.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        setOpenChat(profile.id);
                        onOpenChat(profile.id);
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50"
                    >
                      <div className="relative">
                        <img src={profile.photos[0]} alt={profile.name} className="h-12 w-12 rounded-full object-cover" />
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-bold">{profile.name}, {profile.age}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {thread ? formatTime(thread.lastTimestamp) : ''}
                          </span>
                        </div>
                        <p className={`truncate text-xs ${thread?.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {thread?.lastMessage ?? 'Nuevo match'}
                        </p>
                        {thread?.venueName && (
                          <p className="truncate text-[10px] text-muted-foreground">{thread.venueName}</p>
                        )}
                      </div>
                      {thread?.unread && (
                        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">Sin chats aún</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando tengas matches, aquí podrás chatear con ellos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  return `${hours}h`;
}
