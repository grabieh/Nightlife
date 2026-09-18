import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ChatMessage, Database, Profile, Venue, Vibe } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno.',
    );
  }

  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return client;
}

export async function deleteAccount(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  await supabase.auth.signOut();
}

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface RemoteMatch {
  matchId: string;
  profile: Profile;
  venueId: string;
  venueName: string;
  lastMessage: string;
  lastTimestamp: number;
  unread: boolean;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

export async function fetchProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? adaptProfile(data) : null;
}

export async function updateProfile(userId: string, profile: ProfileUpdate): Promise<Profile> {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .update(profile as never)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return adaptProfile(data);
}

const validVibes: Vibe[] = [
  'En la barra',
  'Bailando',
  'En reservados',
  'En la terraza',
  'Buscando compañía',
];

function toVibe(value: string | null | undefined): Vibe {
  return validVibes.includes(value as Vibe) ? (value as Vibe) : 'En la barra';
}

export function adaptProfile(
  row: Database['public']['Tables']['profiles']['Row'],
  venueId?: string,
): Profile {
  return {
    id: row.id,
    name: row.full_name,
    age: row.age ?? 0,
    instagram: row.instagram_handle ?? '',
    vibe: toVibe(row.vibe),
    photos: row.avatar_url ? [row.avatar_url] : [],
    venueId,
  };
}

export function adaptVenue(row: Database['public']['Tables']['venues']['Row']): Venue {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    coverImage: row.image_url ?? '',
    goingCount: 0,
    music: row.genres.length > 0 ? row.genres.join(' · ') : 'Música variada',
    rating: 0,
    distance: 'Distancia no disponible',
    openUntil: row.closing_time,
  };
}

export async function fetchVenues(): Promise<Venue[]> {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);
  const [venuesResult, checkinsResult] = await Promise.all([
    supabase.from('venues').select('*').order('name'),
    supabase
      .from('venue_checkins')
      .select('venue_id')
      .eq('event_date', today)
      .eq('status', 'checked_in'),
  ]);

  if (venuesResult.error) throw venuesResult.error;
  if (checkinsResult.error) throw checkinsResult.error;

  const checkinCounts = new Map<string, number>();
  const checkins = (checkinsResult.data ?? []) as Pick<
    Database['public']['Tables']['venue_checkins']['Row'],
    'venue_id'
  >[];
  for (const checkin of checkins) {
    checkinCounts.set(checkin.venue_id, (checkinCounts.get(checkin.venue_id) ?? 0) + 1);
  }

  const typedVenues = venuesResult.data as Database['public']['Tables']['venues']['Row'][];
  return typedVenues.map((venue) => ({
    ...adaptVenue(venue),
    goingCount: checkinCounts.get(venue.id) ?? 0,
  }));
}

export async function checkInToVenue(venueId: string): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClient;
  const { error } = await supabase.rpc('check_in_to_venue', {
    requested_venue_id: venueId,
  });

  if (error) throw error;
}

export async function fetchProfilesForVenue(venueId: string, _userId: string): Promise<Profile[]> {
  const supabase = getSupabaseClient() as SupabaseClient;
  const { data, error } = await supabase.rpc('get_profiles_for_venue', {
    requested_venue_id: venueId,
  });

  if (error) throw error;
  const profiles = (data ?? []) as Database['public']['Tables']['profiles']['Row'][];
  return profiles.map((profile) => adaptProfile(profile, venueId));
}

export async function saveSwipe(
  userId: string,
  profileId: string,
  venueId: string,
  type: 'like' | 'pass' | 'superlike',
): Promise<boolean> {
  if (!userId || !profileId || !venueId || !type) {
    throw new Error(
      `No se puede guardar el swipe: faltan datos (from_user_id=${userId}, to_user_id=${profileId}, venue_id=${venueId}, type=${type}).`,
    );
  }

  const supabase = getSupabaseClient();
  const swipe = {
    from_user_id: userId,
    to_user_id: profileId,
    venue_id: venueId,
    type,
  };
  const { error } = await supabase.from('swipes').insert(swipe as never);

  if (error) {
    console.error('[saveSwipe] Error al insertar swipe', { error, swipe });
    throw error;
  }
  if (type === 'pass') return false;

  const { data: mutualSwipe, error: mutualError } = await supabase
    .from('swipes')
    .select('id')
    .eq('from_user_id', profileId)
    .eq('to_user_id', userId)
    .eq('venue_id', venueId)
    .in('type', ['like', 'superlike'])
    .maybeSingle();

  if (mutualError) {
    console.error('[saveSwipe] Error al buscar swipe recíproco', {
      error: mutualError,
      from_user_id: profileId,
      to_user_id: userId,
      venue_id: venueId,
    });
    throw mutualError;
  }
  if (!mutualSwipe) return false;

  const [user1Id, user2Id] = [userId, profileId].sort();
  const { error: matchError } = await supabase.from('matches').upsert(
    { user1_id: user1Id, user2_id: user2Id, venue_id: venueId } as never,
    { onConflict: 'user1_id,user2_id,venue_id', ignoreDuplicates: true },
  );

  if (matchError) {
    console.error('[saveSwipe] Error al crear match', {
      error: matchError,
      user1_id: user1Id,
      user2_id: user2Id,
      venue_id: venueId,
    });
    throw matchError;
  }
  return true;
}

export async function fetchMatchId(userId: string, profileId: string, venueId: string): Promise<string | null> {
  const supabase = getSupabaseClient() as SupabaseClient;
  const { data, error } = await supabase
    .from('matches')
    .select('id')
    .eq('venue_id', venueId)
    .or(`and(user1_id.eq.${userId},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${userId})`)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function fetchMyMatches(): Promise<RemoteMatch[]> {
  const supabase = getSupabaseClient() as SupabaseClient;
  const { data, error } = await supabase.rpc('get_my_matches');
  if (error) throw error;

  type MatchRow = {
    match_id: string;
    other_user_id: string;
    full_name: string;
    age: number | null;
    instagram_handle: string | null;
    avatar_url: string | null;
    vibe: string;
    venue_id: string;
    venue_name: string;
    last_message_text: string | null;
    last_message_created_at: string | null;
    unread_count: number;
  };
  const rows = (data ?? []) as MatchRow[];

  return rows.map((row) => ({
    matchId: row.match_id,
    profile: adaptProfile({
      id: row.other_user_id,
      full_name: row.full_name,
      age: row.age,
      instagram_handle: row.instagram_handle,
      avatar_url: row.avatar_url,
      vibe: row.vibe,
      created_at: '',
      updated_at: '',
    }),
    venueId: row.venue_id,
    venueName: row.venue_name,
    lastMessage: row.last_message_text ?? 'Nuevo match',
    lastTimestamp: row.last_message_created_at ? new Date(row.last_message_created_at).getTime() : 0,
    unread: row.unread_count > 0,
  }));
}

export async function markMatchMessagesRead(matchId: string): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClient;
  const { error } = await supabase.rpc('mark_match_messages_read', {
    requested_match_id: matchId,
  });
  if (error) throw error;
}

export async function fetchMessages(matchId: string): Promise<ChatMessage[]> {
  const supabase = getSupabaseClient() as SupabaseClient;
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, text, created_at, read_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  const messages = (data ?? []) as Database['public']['Tables']['messages']['Row'][];
  return messages.map((message) => ({
    id: message.id,
    senderId: message.sender_id,
    text: message.text,
    timestamp: new Date(message.created_at).getTime(),
  }));
}

export async function insertMessage(matchId: string, senderId: string, text: string): Promise<ChatMessage> {
  const supabase = getSupabaseClient() as SupabaseClient;
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: senderId, text } as Database['public']['Tables']['messages']['Insert'])
    .select('id, sender_id, text, created_at')
    .single();

  if (error) throw error;
  const message = data as Database['public']['Tables']['messages']['Row'];
  return {
    id: message.id,
    senderId: message.sender_id,
    text: message.text,
    timestamp: new Date(message.created_at).getTime(),
  };
}