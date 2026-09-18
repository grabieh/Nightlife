alter table public.swipes enable row level security;
alter table public.matches enable row level security;

drop policy if exists "Permitir swipes a usuarios autenticados" on public.swipes;
create policy "Permitir swipes a usuarios autenticados"
  on public.swipes
  for insert
  to authenticated
  with check (auth.uid() = from_user_id);

drop policy if exists "Permitir consultar swipes propios o recibidos" on public.swipes;
create policy "Permitir consultar swipes propios o recibidos"
  on public.swipes
  for select
  to authenticated
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

drop policy if exists "Permitir crear matches propios" on public.matches;
create policy "Permitir crear matches propios"
  on public.matches
  for insert
  to authenticated
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

drop policy if exists "Permitir consultar matches propios" on public.matches;
create policy "Permitir consultar matches propios"
  on public.matches
  for select
  to authenticated
  using (auth.uid() = user1_id or auth.uid() = user2_id);