// ==========================================
// 1. TIPOS DE INTERFAZ Y COMPONENTES (UI)
// ==========================================

export type Vibe = 'En la barra' | 'Bailando' | 'En reservados' | 'En la terraza' | 'Buscando compañía';

export interface Venue {
  id: string;
  name: string;
  address: string;
  coverImage: string;
  goingCount: number;
  music: string;
  rating: number;
  distance: string;
  openUntil: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  instagram: string;
  vibe: Vibe;
  photos: string[];
  bio?: string;
  venueId?: string;
  gender?: 'female' | 'male';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface ChatThread {
  profile: Profile;
  matchId: string;
  venueName: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastTimestamp: number;
  unread: boolean;
}

export interface Match {
  id: string;
  profile: Profile;
  timestamp: number;
}

export type SwipeAction = 'like' | 'pass' | 'superlike';

export type TabScreen = 'discotecas' | 'qr' | 'chats' | 'perfil';

export type FlowScreen = 'onboarding' | 'venue-lounge' | 'match-detail';


// ==========================================
// 2. ESQUEMA BASE DE DATOS (SUPABASE)
// ==========================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Functions: {
      delete_my_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      get_profiles_for_venue: {
        Args: { requested_venue_id: string };
        Returns: Database['public']['Tables']['profiles']['Row'][];
      };
      check_in_to_venue: {
        Args: { requested_venue_id: string };
        Returns: undefined;
      };
      get_my_matches: {
        Args: Record<string, never>;
        Returns: {
          match_id: string;
          other_user_id: string;
          full_name: string;
          age: number | null;
          instagram_handle: string | null;
          avatar_url: string | null;
          vibe: string;
          venue_id: string;
          venue_name: string;
          last_message_id: string | null;
          last_message_text: string | null;
          last_message_sender_id: string | null;
          last_message_created_at: string | null;
          unread_count: number;
        }[];
      };
      mark_match_messages_read: {
        Args: { requested_match_id: string };
        Returns: undefined;
      };
    };
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          age: number | null;
          instagram_handle: string | null;
          avatar_url: string | null;
          vibe: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          age?: number | null;
          instagram_handle?: string | null;
          avatar_url?: string | null;
          vibe?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      venues: {
        Row: {
          id: string;
          name: string;
          address: string;
          genres: string[];
          closing_time: string;
          image_url: string | null;
          qr_code_secret: string;
          created_at: string;
        };
      };
      venue_checkins: {
        Row: {
          id: string;
          user_id: string;
          venue_id: string;
          status: 'intent' | 'checked_in';
          event_date: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          venue_id: string;
          status: 'intent' | 'checked_in';
          event_date?: string;
        };
      };
      swipes: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          venue_id: string;
          type: 'like' | 'pass' | 'superlike';
          created_at: string;
        };
        Insert: {
          from_user_id: string;
          to_user_id: string;
          venue_id: string;
          type: 'like' | 'pass' | 'superlike';
        };
      };
      matches: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          venue_id: string;
          created_at: string;
        };
        Insert: {
          user1_id: string;
          user2_id: string;
          venue_id: string;
        };
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          text: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          match_id: string;
          sender_id: string;
          text: string;
        };
      };
    };
  };
}