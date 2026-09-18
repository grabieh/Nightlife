create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, vibe)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'Nuevo usuario'),
    'En la barra'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

insert into public.profiles (id, full_name, vibe)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', users.raw_user_meta_data ->> 'name', 'Nuevo usuario'),
  'En la barra'
from auth.users as users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);