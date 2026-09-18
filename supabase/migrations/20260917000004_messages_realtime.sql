create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(trim(text)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists messages_match_created_at_idx
  on public.messages (match_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "Permitir consultar mensajes de matches propios" on public.messages;
create policy "Permitir consultar mensajes de matches propios"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.matches
      where matches.id = messages.match_id
        and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

drop policy if exists "Permitir enviar mensajes de matches propios" on public.messages;
create policy "Permitir enviar mensajes de matches propios"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.matches
      where matches.id = messages.match_id
        and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end;
$$;
