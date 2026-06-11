-- Migration: renomear avatar_utfpr_* → avatar_arcade_* (rebranding Chaveia)

-- 1. Remover o constraint antigo
alter table public.profiles
  drop constraint if exists profiles_avatar_key_allowed;

-- 2. Migrar dados existentes
update public.profiles
  set avatar_key = case avatar_key
    when 'avatar_utfpr_blue'  then 'avatar_arcade_blue'
    when 'avatar_utfpr_green' then 'avatar_arcade_green'
    when 'avatar_utfpr_gold'  then 'avatar_arcade_gold'
    else avatar_key
  end;

-- 3. Recriar o constraint com as novas chaves
alter table public.profiles
  add constraint profiles_avatar_key_allowed check (
    avatar_key in (
      'avatar_arcade_blue',
      'avatar_arcade_green',
      'avatar_arcade_gold',
      'avatar_competition',
      'avatar_academic'
    )
  );

-- 4. Alterar o DEFAULT da coluna
alter table public.profiles
  alter column avatar_key set default 'avatar_arcade_blue';

-- 5. Atualizar o display_name default (remover "UTFPR" do fallback do trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_avatar text;
begin
  requested_avatar := new.raw_user_meta_data ->> 'avatar_key';

  insert into public.profiles (
    id,
    email,
    display_name,
    ra,
    avatar_key,
    role
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Usuário'
    ),
    nullif(new.raw_user_meta_data ->> 'ra', ''),
    case
      when requested_avatar in (
        'avatar_arcade_blue',
        'avatar_arcade_green',
        'avatar_arcade_gold',
        'avatar_competition',
        'avatar_academic'
      )
      then requested_avatar
      else 'avatar_arcade_blue'
    end,
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

-- 6. Atualizar comentário da coluna
comment on column public.profiles.avatar_key is
  'Avatar pré-definido. Chaves: avatar_arcade_blue, avatar_arcade_green, avatar_arcade_gold, avatar_competition, avatar_academic.';
