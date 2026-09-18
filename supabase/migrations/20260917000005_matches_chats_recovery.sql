alter table public.messages
  add column if not exists read_at timestamptz;

create or replace function public.get_my_matches()
returns table (
  match_id uuid,
  other_user_id uuid,
  full_name text,
  age integer,
  instagram_handle text,
  avatar_url text,
  vibe text,
  venue_id uuid,
  venue_name text,
  last_message_id uuid,
  last_message_text text,
  last_message_sender_id uuid,
  last_message_created_at timestamptz,
  unread_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    matches.id,
    other_profiles.id,
    other_profiles.full_name,
    other_profiles.age,
    other_profiles.instagram_handle,
    other_profiles.avatar_url,
    other_profiles.vibe,
    venues.id,
    venues.name,
    latest_message.id,
    latest_message.text,
    latest_message.sender_id,
    latest_message.created_at,
    (
      select count(*)
      from public.messages unread_messages
      where unread_messages.match_id = matches.id
        and unread_messages.sender_id <> auth.uid()
        and unread_messages.read_at is null
    )
  from public.matches
  join public.profiles other_profiles
    on other_profiles.id = case
      when matches.user1_id = auth.uid() then matches.user2_id
      else matches.user1_id
    end
  join public.venues
    on venues.id = matches.venue_id
  left join lateral (
    select messages.id, messages.text, messages.sender_id, messages.created_at
    from public.messages
    where messages.match_id = matches.id
    order by messages.created_at desc
    limit 1
  ) latest_message on true
  where matches.user1_id = auth.uid()
     or matches.user2_id = auth.uid()
  order by coalesce(latest_message.created_at, matches.created_at) desc;
$$;

revoke all on function public.get_my_matches() from public;
grant execute on function public.get_my_matches() to authenticated;

create or replace function public.mark_match_messages_read(requested_match_id uuid)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update public.messages
  set read_at = now()
  where messages.match_id = requested_match_id
    and messages.sender_id <> auth.uid()
    and messages.read_at is null
    and exists (
      select 1
      from public.matches
      where matches.id = requested_match_id
        and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    );
$$;

revoke all on function public.mark_match_messages_read(uuid) from public;
grant execute on function public.mark_match_messages_read(uuid) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.matches;
exception
  when duplicate_object then null;
end;
$$;
