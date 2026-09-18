with duplicate_checkins as (
  select
    ctid,
    row_number() over (
      partition by user_id, venue_id, event_date
      order by created_at desc, ctid desc
    ) as row_number
  from public.venue_checkins
)
delete from public.venue_checkins as checkins
using duplicate_checkins
where checkins.ctid = duplicate_checkins.ctid
  and duplicate_checkins.row_number > 1;

create unique index if not exists venue_checkins_user_venue_date_idx
  on public.venue_checkins (user_id, venue_id, event_date);

create or replace function public.check_in_to_venue(requested_venue_id uuid)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  insert into public.venue_checkins (user_id, venue_id, status, event_date)
  select auth.uid(), requested_venue_id, 'checked_in', current_date
  where auth.uid() is not null
  on conflict (user_id, venue_id, event_date)
  do update set status = 'checked_in';
$$;

revoke all on function public.check_in_to_venue(uuid) from public;
grant execute on function public.check_in_to_venue(uuid) to authenticated;

create or replace function public.get_profiles_for_venue(requested_venue_id uuid)
returns setof public.profiles
language sql
stable
security invoker
set search_path = public
as $$
  select profiles.*
  from public.profiles
  join public.venue_checkins
    on venue_checkins.user_id = profiles.id
  where venue_checkins.venue_id = requested_venue_id
    and venue_checkins.event_date = current_date
    and venue_checkins.status = 'checked_in'
    and profiles.id <> auth.uid()
    and not exists (
      select 1
      from public.swipes
      where swipes.from_user_id = auth.uid()
        and swipes.to_user_id = profiles.id
        and swipes.venue_id = requested_venue_id
    );
$$;

revoke all on function public.get_profiles_for_venue(uuid) from public;
grant execute on function public.get_profiles_for_venue(uuid) to authenticated;