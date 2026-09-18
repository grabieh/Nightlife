'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Venue, Profile, TabScreen, SwipeAction, ChatThread, ChatMessage } from '@/lib/types';
import { checkInToVenue, deleteAccount, fetchMatchId, fetchMessages, fetchMyMatches, fetchProfileById, fetchProfilesForVenue, fetchVenues, getSupabaseClient, insertMessage, markMatchMessagesRead, saveSwipe, updateProfile } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { BottomNav } from '@/components/nightlife/BottomNav';
import { DiscotecasScreen } from '@/components/nightlife/DiscotecasScreen';
import { OnboardingScreen } from '@/components/nightlife/OnboardingScreen';
import { QRScanner } from '@/components/nightlife/QRScanner';
import { VenueLoungeScreen } from '@/components/nightlife/VenueLoungeScreen';
import { ChatsScreen } from '@/components/nightlife/ChatsScreen';
import { ProfileScreen } from '@/components/nightlife/ProfileScreen';
import { MatchOverlay } from '@/components/nightlife/MatchOverlay';
import { QuickAuthModal } from '@/components/nightlife/QuickAuthModal';

type PendingAction = { type: 'enter' | 'qr'; venue: Venue | null };
const pendingActionStorageKey = 'noche.pending-action';

export default function Home() {
  const { user, isLoading: isAuthLoading, profileMissing } = useAuth();
  const [tab, setTab] = useState<TabScreen>('discotecas');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [deck, setDeck] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [activeMatch, setActiveMatch] = useState<Profile | null>(null);
  const [threads, setThreads] = useState<Record<string, ChatThread>>({});
  const [inOnboarding, setInOnboarding] = useState(false);
  const [inLounge, setInLounge] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isAccountActionLoading, setIsAccountActionLoading] = useState(false);
  const [openChatProfileId, setOpenChatProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!profileMissing) return;

    setMyProfile(null);
    setDeck([]);
    setMatches([]);
    setThreads({});
    setSelectedVenue(null);
    setDataError(null);
    setPendingAction(null);
    setTab('discotecas');
    setInOnboarding(false);
    setInLounge(false);
    setAuthOpen(true);
  }, [profileMissing]);

  const resumeAction = useCallback((action: PendingAction) => {
    localStorage.removeItem(pendingActionStorageKey);
    setPendingAction(null);

    if (action.type === 'qr') {
      setTab('qr');
    } else if (action.type === 'enter' && action.venue) {
      setSelectedVenue(action.venue);
      if (!user) return;
      checkInToVenue(action.venue.id)
        .then(() => fetchProfilesForVenue(action.venue!.id, user.id))
        .then((profiles) => {
          setDeck(profiles);
          setInLounge(true);
        })
        .catch((error: unknown) => setDataError(error instanceof Error ? error.message : 'No se pudieron cargar los perfiles.'));
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading || !user) return;

    const storedAction = localStorage.getItem(pendingActionStorageKey);
    const action = storedAction ? (JSON.parse(storedAction) as PendingAction) : null;

    fetchProfileById(user.id)
      .then((profile) => {
        setMyProfile(profile);
        const isComplete = Boolean(
          profile?.name.trim() &&
          profile.age > 0 &&
          profile.photos.length > 0 &&
          profile.instagram.trim().startsWith('@'),
        );

        if (!isComplete) {
          setPendingAction(action);
          setInOnboarding(true);
        } else if (action) {
          resumeAction(action);
        }
      })
      .catch((error: unknown) => setDataError(error instanceof Error ? error.message : 'No se pudo cargar tu perfil.'));
  }, [isAuthLoading, resumeAction, user]);

  const refreshMatches = useCallback(async () => {
    if (!user) return;

    const remoteMatches = await fetchMyMatches();
    setMatches(remoteMatches.map((match) => match.profile));
    setThreads((previous) => Object.fromEntries(remoteMatches.map((match) => {
      const existing = previous[match.profile.id];
      return [match.profile.id, {
        profile: match.profile,
        matchId: match.matchId,
        venueName: match.venueName,
        messages: existing?.messages ?? [],
        lastMessage: match.lastMessage,
        lastTimestamp: match.lastTimestamp,
        unread: match.unread,
      } satisfies ChatThread];
    })));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setMatches([]);
      setThreads({});
      return;
    }

    let isMounted = true;
    const supabase = getSupabaseClient();
    const reloadMatches = () => {
      refreshMatches().catch((error: unknown) => {
        if (isMounted) {
          console.error('[refreshMatches] No se pudieron cargar los matches', error);
          setDataError(error instanceof Error ? error.message : 'No se pudieron cargar tus matches.');
        }
      });
    };

    reloadMatches();

    const matchesChannel = supabase
      .channel(`matches:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, reloadMatches)
      .subscribe();
    const messagesChannel = supabase
      .channel(`chat-list:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, reloadMatches)
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(matchesChannel);
      void supabase.removeChannel(messagesChannel);
    };
  }, [refreshMatches, user]);

  useEffect(() => {
    let isMounted = true;

    const refreshVenues = () => {
      fetchVenues().then((loadedVenues) => {
        if (isMounted) setVenues(loadedVenues);
      });
    };

    fetchVenues()
      .then((loadedVenues) => {
        if (isMounted) setVenues(loadedVenues);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setDataError(error instanceof Error ? error.message : 'No se pudieron cargar los locales.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingVenues(false);
      });

    if (!user) {
      return () => {
        isMounted = false;
      };
    }

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('venue-checkins-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'venue_checkins' },
        refreshVenues,
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    const nextAction = { type: 'enter', venue } satisfies PendingAction;
    setPendingAction(nextAction);

    const hasCompleteProfile = Boolean(
      myProfile?.name.trim() &&
      myProfile.age > 0 &&
      myProfile.photos.length > 0 &&
      myProfile.instagram.trim().startsWith('@'),
    );

    if (user && hasCompleteProfile) {
      resumeAction(nextAction);
    } else {
      setInOnboarding(true);
    }
  };

  const handleRequestAuth = (action: 'enter', venue: Venue) => {
    const nextAction = { type: action, venue } satisfies PendingAction;
    localStorage.setItem(pendingActionStorageKey, JSON.stringify(nextAction));
    setPendingAction(nextAction);
    setAuthOpen(true);
  };

  const handleSignOut = async () => {
    setIsAccountActionLoading(true);
    await getSupabaseClient().auth.signOut();
    setIsAccountActionLoading(false);
    setMyProfile(null);
    setTab('discotecas');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Seguro que quieres borrar tu cuenta? Esta acción no se puede deshacer.')) return;

    setIsAccountActionLoading(true);
    try {
      await deleteAccount();
      setMyProfile(null);
      setTab('discotecas');
    } catch (error: unknown) {
      setDataError(error instanceof Error ? error.message : 'No se pudo borrar la cuenta.');
    } finally {
      setIsAccountActionLoading(false);
    }
  };

  const completeOnboarding = async (profile: Profile) => {
    if (!user) return;

    try {
      const instagramHandle = profile.instagram.startsWith('@') ? profile.instagram : `@${profile.instagram}`;
      const savedProfile = await updateProfile(user.id, {
        full_name: profile.name,
        age: profile.age,
        instagram_handle: instagramHandle,
        avatar_url: profile.photos[0],
        vibe: profile.vibe,
      });
      const savedProfileForUi = { ...savedProfile, venueId: profile.venueId };
      setMyProfile(savedProfileForUi);
      setInOnboarding(false);

      if (pendingAction) {
        resumeAction(pendingAction);
      } else if (selectedVenue) {
        setTab('qr');
      } else {
        setTab('discotecas');
      }
    } catch (error: unknown) {
      setDataError(error instanceof Error ? error.message : 'No se pudo guardar tu perfil.');
    }
  };

  const handleQRVerified = () => {
    if (selectedVenue) {
      if (!user) return;
      checkInToVenue(selectedVenue.id)
        .then(() => fetchProfilesForVenue(selectedVenue!.id, user.id))
        .then((profiles) => {
          setDeck(profiles);
          setInLounge(true);
        })
        .catch((error: unknown) => setDataError(error instanceof Error ? error.message : 'No se pudieron cargar los perfiles.'));
    }
  };

  const handleSwipe = useCallback(async (action: SwipeAction, profile: Profile) => {
    if (!user || !selectedVenue || !profile.id) {
      console.error('[handleSwipe] Datos incompletos', {
        action,
        from_user_id: user?.id,
        to_user_id: profile?.id,
        venue_id: selectedVenue?.id,
      });
      return;
    }
    setDeck((prev) => prev.filter((p) => p.id !== profile.id));

    try {
      const isMatch = await saveSwipe(user.id, profile.id, selectedVenue.id, action);
      if (isMatch) {
        const matchId = await fetchMatchId(user.id, profile.id, selectedVenue.id);
        if (!matchId) throw new Error('No se encontró el match recién creado.');
        setMatches((prev) => [...prev, profile]);
        setActiveMatch(profile);
        setThreads((prev) => ({
          ...prev,
          [profile.id]: {
            profile,
            matchId,
            venueName: selectedVenue.name,
            messages: [],
            lastMessage: 'Nuevo match',
            lastTimestamp: Date.now(),
            unread: true,
          },
        }));
      }
    } catch (error: unknown) {
      console.error('[handleSwipe] No se pudo guardar el swipe', error);
      setDeck((prev) => [profile, ...prev]);
      setDataError(error instanceof Error ? error.message : 'No se pudo guardar tu swipe.');
    }
  }, [selectedVenue, user]);

  const handleButtonSwipe = (action: SwipeAction) => {
    if (deck.length === 0) return;
    handleSwipe(action, deck[0]);
  };

  const handleOpenChat = async (profileId: string) => {
    const thread = threads[profileId];
    if (!thread) return;

    try {
      await markMatchMessagesRead(thread.matchId);
      const messages = await fetchMessages(thread.matchId);
      setThreads((prev) => {
        const current = prev[profileId];
        if (!current) return prev;
        const lastMessage = messages[messages.length - 1];
        return {
          ...prev,
          [profileId]: {
            ...current,
            messages,
            lastMessage: lastMessage?.text ?? 'Nuevo match',
            lastTimestamp: lastMessage?.timestamp ?? current.lastTimestamp,
            unread: false,
          },
        };
      });
      setOpenChatProfileId(profileId);
    } catch (error: unknown) {
      console.error('[handleOpenChat] No se pudieron cargar los mensajes', error);
      setDataError(error instanceof Error ? error.message : 'No se pudieron cargar los mensajes.');
    }
  };

  const handleSendMessage = async (profileId: string, text: string) => {
    const thread = threads[profileId];
    if (!user || !thread || !text.trim()) return;

    try {
      const message = await insertMessage(thread.matchId, user.id, text.trim());
      setThreads((prev) => {
        const current = prev[profileId];
        if (!current || current.messages.some((item) => item.id === message.id)) return prev;
        return {
          ...prev,
          [profileId]: {
            ...current,
            messages: [...current.messages, message],
            lastMessage: message.text,
            lastTimestamp: message.timestamp,
            unread: false,
          },
        };
      });
    } catch (error: unknown) {
      console.error('[handleSendMessage] No se pudo insertar el mensaje', error);
      setDataError(error instanceof Error ? error.message : 'No se pudo enviar el mensaje.');
    }
  };

  useEffect(() => {
    const thread = openChatProfileId ? threads[openChatProfileId] : null;
    if (!thread) return;
    const matchId = thread.matchId;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const row = payload.new as { id: string; sender_id: string; text: string; created_at: string };
          const message: ChatMessage = {
            id: row.id,
            senderId: row.sender_id,
            text: row.text,
            timestamp: new Date(row.created_at).getTime(),
          };
          setThreads((prev) => {
            const current = openChatProfileId ? prev[openChatProfileId] : null;
            if (!current || current.messages.some((item) => item.id === message.id)) return prev;
            return {
              ...prev,
              [openChatProfileId!]: {
                ...current,
                messages: [...current.messages, message],
                lastMessage: message.text,
                lastTimestamp: message.timestamp,
                unread: message.senderId !== user?.id,
              },
            };
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [openChatProfileId, threads[openChatProfileId ?? '']?.matchId, user?.id]);

  const handleTabChange = (newTab: TabScreen) => {
    if (activeMatch) setActiveMatch(null);
    setInOnboarding(false);
    setInLounge(false);

    if (newTab === 'qr' && !user) {
      const nextAction = { type: 'qr', venue: null } satisfies PendingAction;
      localStorage.setItem(pendingActionStorageKey, JSON.stringify(nextAction));
      setPendingAction(nextAction);
      setAuthOpen(true);
      return;
    }

    setTab(newTab);
  };

  const exitLounge = () => {
    setInLounge(false);
    setTab('discotecas');
  };

  const unreadCount = Object.values(threads).filter((t) => t.unread).length;

  const authMessage = pendingAction?.type === 'qr'
    ? 'Inicia sesión para escanear el QR del local'
    : pendingAction?.type === 'enter'
    ? 'Inicia sesión para entrar en la discoteca'
    : undefined;

  const isLoggedIn = Boolean(user);

  if (isLoadingVenues || isAuthLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Cargando locales...</div>;
  }

  if (dataError) {
    return <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-muted-foreground">{dataError}</div>;
  }

  // ===== ONBOARDING FLOW =====
  if (inOnboarding) {
    return (
      <OnboardingScreen
        onComplete={completeOnboarding}
        onBack={() => setInOnboarding(false)}
        venue={selectedVenue}
        existingProfile={myProfile}
      />
    );
  }

  // ===== VENUE LOUNGE FLOW =====
  if (inLounge && selectedVenue) {
    return (
      <>
        <VenueLoungeScreen
          venue={selectedVenue}
          deck={deck}
          matches={matches}
          myProfile={myProfile}
          activeMatch={activeMatch}
          onSwipe={handleSwipe}
          onButtonSwipe={handleButtonSwipe}
          onMatchClose={() => setActiveMatch(null)}
          onViewMatches={() => {
            setInLounge(false);
            setTab('chats');
          }}
          onExit={exitLounge}
        />
        <BottomNav active={tab} onChange={handleTabChange} matchCount={matches.length} unreadCount={unreadCount} />
      </>
    );
  }

  // ===== TAB SCREENS =====
  return (
    <>
      {tab === 'discotecas' && (
        <DiscotecasScreen
          venues={venues}
          onSelectVenue={handleSelectVenue}
          isLoggedIn={isLoggedIn}
          onRequestAuth={handleRequestAuth}
        />
      )}

      {tab === 'qr' && (
        <QRScanner
          onVerified={handleQRVerified}
          onBack={() => setTab('discotecas')}
          venueName={selectedVenue?.name}
        />
      )}

      {tab === 'chats' && (
        <ChatsScreen
          matches={matches}
          threads={threads}
          onSendMessage={handleSendMessage}
          onOpenChat={handleOpenChat}
          onCloseChat={() => setOpenChatProfileId(null)}
          onOpenInstagram={(handle) => window.open(`https://instagram.com/${handle.replace('@', '')}`, '_blank')}
          currentUserId={user?.id ?? ''}
        />
      )}

      {tab === 'perfil' && (
        <ProfileScreen
          profile={myProfile}
          venue={selectedVenue}
          matchCount={matches.length}
          chatCount={Object.keys(threads).length}
          onEdit={() => setInOnboarding(true)}
          onSignOut={handleSignOut}
          onDelete={handleDeleteAccount}
          isAccountActionLoading={isAccountActionLoading}
        />
      )}

      {activeMatch && tab !== 'chats' && (
        <MatchOverlay match={activeMatch} myProfile={myProfile} onClose={() => setActiveMatch(null)} />
      )}

      <QuickAuthModal
        open={authOpen}
        onClose={() => { setAuthOpen(false); setPendingAction(null); }}
        onAuthenticated={() => undefined}
        message={authMessage}
      />

      <BottomNav active={tab} onChange={handleTabChange} matchCount={matches.length} unreadCount={unreadCount} />
    </>
  );
}
