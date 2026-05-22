-- UTFPR Torneios - schema inicial Supabase
-- Objetivo:
-- - Usar Supabase Auth como origem dos usuários.
-- - Não criar tabela de senhas.
-- - Criar perfis, papéis e pedidos de permissão para criação de torneios.
-- - Habilitar Row Level Security em todas as tabelas deste schema inicial.
-- - Validar permissões no banco, não apenas na interface.
--
-- Importante:
-- - Nunca use service_role no front-end.
-- - Use apenas VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no cliente.
-- - O primeiro admin deve ser promovido com cuidado pelo SQL Editor, conforme README/final da tarefa.

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'user_role'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.user_role as enum ('admin', 'user');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'request_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.request_status as enum (
      'pending',
      'approved',
      'rejected',
      'cancelled'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'creator_permission_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.creator_permission_status as enum (
      'active',
      'revoked'
    );
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default 'Usuário UTFPR',
  ra text,
  avatar_key text not null default 'avatar_utfpr_blue',
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_not_blank check (length(btrim(display_name)) > 0),
  constraint profiles_avatar_key_allowed check (
    avatar_key in (
      'avatar_utfpr_blue',
      'avatar_utfpr_green',
      'avatar_utfpr_gold',
      'avatar_competition',
      'avatar_academic'
    )
  )
);

comment on table public.profiles is
  'Perfil público/administrativo vinculado a auth.users. Não armazena senha.';
comment on column public.profiles.id is
  'Mesmo UUID do usuário em auth.users.';
comment on column public.profiles.email is
  'Cópia auxiliar do email do auth.users para exibição administrativa; proteger por RLS.';
comment on column public.profiles.ra is
  'Registro acadêmico. Dado pessoal, não deve ser exposto publicamente sem necessidade.';
comment on column public.profiles.avatar_key is
  'Avatar pré-definido do MVP. Upload de foto não faz parte do escopo inicial.';
comment on column public.profiles.role is
  'Papel global. Usuário comum nunca pode promover a si mesmo para admin.';

create table if not exists public.tournament_creator_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status public.request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournament_creator_requests_reason_not_blank check (length(btrim(reason)) > 0),
  constraint tournament_creator_requests_review_consistency check (
    (
      status in ('approved', 'rejected')
      and reviewed_by is not null
      and reviewed_at is not null
    )
    or (
      status in ('pending', 'cancelled')
      and reviewed_at is null
    )
  )
);

comment on table public.tournament_creator_requests is
  'Pedidos de usuários comuns para receber permissão de criar torneios.';
comment on column public.tournament_creator_requests.user_id is
  'Usuário que pediu autorização para criar torneios.';
comment on column public.tournament_creator_requests.status is
  'Fluxo do pedido: pending, approved, rejected ou cancelled.';
comment on column public.tournament_creator_requests.reviewed_by is
  'Admin que aprovou ou rejeitou o pedido.';
comment on column public.tournament_creator_requests.admin_notes is
  'Observações administrativas visíveis apenas para admins por RLS.';

create unique index if not exists tournament_creator_requests_one_pending_per_user
  on public.tournament_creator_requests (user_id)
  where status = 'pending';

create index if not exists profiles_role_idx
  on public.profiles (role);

create index if not exists tournament_creator_requests_user_status_idx
  on public.tournament_creator_requests (user_id, status);

create table if not exists public.tournament_creator_permissions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.creator_permission_status not null default 'active',
  granted_by uuid not null references public.profiles(id) on delete restrict,
  granted_at timestamptz not null default now(),
  revoked_by uuid references public.profiles(id) on delete set null,
  revoked_at timestamptz,
  grant_reason text,
  revoke_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournament_creator_permissions_status_consistency check (
    (
      status = 'active'::public.creator_permission_status
      and revoked_by is null
      and revoked_at is null
    )
    or (
      status = 'revoked'::public.creator_permission_status
      and revoked_by is not null
      and revoked_at is not null
    )
  )
);

comment on table public.tournament_creator_permissions is
  'Permissoes efetivas para criar torneios. Pedidos ficam como historico; esta tabela controla autorizacao ativa ou revogada.';
comment on column public.tournament_creator_permissions.user_id is
  'Usuario que recebeu permissao de criador de torneios.';
comment on column public.tournament_creator_permissions.status is
  'active permite criar torneios; revoked bloqueia novas criacoes sem apagar historico.';
comment on column public.tournament_creator_permissions.granted_by is
  'Admin que concedeu a permissao.';
comment on column public.tournament_creator_permissions.revoked_by is
  'Admin que revogou a permissao.';

create unique index if not exists tournament_creator_permissions_one_active_per_user
  on public.tournament_creator_permissions (user_id)
  where status = 'active';

create index if not exists tournament_creator_permissions_user_status_idx
  on public.tournament_creator_permissions (user_id, status);

-- Migra pedidos ja aprovados para permissoes ativas sem apagar historico.
-- Se o schema for executado mais de uma vez, a condicao evita duplicar permissao ativa.
select set_config('app.permission_backfill', 'on', true);

insert into public.tournament_creator_permissions (
  user_id,
  status,
  granted_by,
  granted_at,
  grant_reason,
  created_at,
  updated_at
)
select
  request.user_id,
  'active'::public.creator_permission_status,
  request.reviewed_by,
  coalesce(request.reviewed_at, request.updated_at, request.created_at, now()),
  coalesce(request.admin_notes, request.reason),
  now(),
  now()
from public.tournament_creator_requests request
where request.status = 'approved'::public.request_status
  and request.reviewed_by is not null
  and not exists (
    select 1
    from public.tournament_creator_permissions permission
    where permission.user_id = request.user_id
      and permission.status = 'active'::public.creator_permission_status
  );

select set_config('app.permission_backfill', 'off', true);

-- Função auxiliar para updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Verifica se o usuário autenticado atual é admin.
-- Esta função é SECURITY DEFINER para evitar recursão em RLS:
-- as policies chamam is_admin(), e is_admin() consulta profiles sem cair
-- novamente nas próprias policies de profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'::public.user_role
  );
$$;

comment on function public.is_admin() is
  'Retorna true quando auth.uid() pertence a um profile admin. SECURITY DEFINER evita recursão de RLS.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Verifica se o usuÃ¡rio pode criar torneios.
-- DecisÃ£o de modelagem: no MVP a permissÃ£o de organizador Ã© derivada de
-- permissao ativa em tournament_creator_permissions. Isso evita
-- confundir organizador aprovado com admin global e permite revogar acesso sem apagar
-- permissÃ£o foi concedida. Policies futuras de tournaments devem chamar esta
-- funÃ§Ã£o, nÃ£o confiar apenas no front-end.
create or replace function public.can_create_tournament(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or (
      target_user_id = auth.uid()
      and exists (
        select 1
        from public.tournament_creator_permissions
        where user_id = target_user_id
          and status = 'active'::public.creator_permission_status
      )
    );
$$;

comment on function public.can_create_tournament(uuid) is
  'Retorna true para admin global ou usuario com permissao active. Nao altera role.';

revoke all on function public.can_create_tournament(uuid) from public;
grant execute on function public.can_create_tournament(uuid) to authenticated;

-- Alias temporario para compatibilidade com codigo/policies antigos.
create or replace function public.can_create_tournaments(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_create_tournament(target_user_id);
$$;

comment on function public.can_create_tournaments(uuid) is
  'Alias de compatibilidade. Use public.can_create_tournament(uuid).';

revoke all on function public.can_create_tournaments(uuid) from public;
grant execute on function public.can_create_tournaments(uuid) to authenticated;

-- Protege campos sensíveis do profile.
-- Usuários comuns podem atualizar dados próprios de perfil, mas não role nem email.
-- Admins podem alterar profiles, inclusive role, desde que passem pelas policies.
create or replace function public.protect_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('app.bootstrap_first_admin', true) = 'on' then
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'O id do profile não pode ser alterado.';
  end if;

  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Usuário comum não pode alterar role.';
    end if;

    if new.email is distinct from old.email then
      raise exception 'Usuário comum não pode alterar email pelo profile.';
    end if;

    if new.created_at is distinct from old.created_at then
      raise exception 'created_at não pode ser alterado.';
    end if;
  end if;

  return new;
end;
$$;

-- Cria profile automaticamente quando Supabase Auth cria um usuário.
-- A origem do usuário continua sendo auth.users; esta tabela só guarda dados
-- de perfil e autorização da aplicação.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
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
      'Usuário UTFPR'
    ),
    nullif(new.raw_user_meta_data ->> 'ra', ''),
    case
      when requested_avatar in (
        'avatar_utfpr_blue',
        'avatar_utfpr_green',
        'avatar_utfpr_gold',
        'avatar_competition',
        'avatar_academic'
      )
      then requested_avatar
      else 'avatar_utfpr_blue'
    end,
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

-- Valida transições dos pedidos.
-- Usuário comum só pode cancelar seu próprio pedido pendente.
-- Admin pode aprovar/rejeitar pedido pendente e precisa ficar registrado.
create or replace function public.validate_tournament_creator_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    if old.status <> 'pending' and new.status is distinct from old.status then
      raise exception 'Somente pedidos pendentes podem mudar de status.';
    end if;

    if new.status in ('approved', 'rejected') then
      new.reviewed_by := coalesce(new.reviewed_by, auth.uid());
      new.reviewed_at := coalesce(new.reviewed_at, now());
    end if;

    if new.status = 'approved'::public.request_status
      and old.status <> 'approved'::public.request_status
    then
      insert into public.tournament_creator_permissions (
        user_id,
        status,
        granted_by,
        granted_at,
        grant_reason
      )
      select
        new.user_id,
        'active'::public.creator_permission_status,
        auth.uid(),
        now(),
        coalesce(nullif(new.admin_notes, ''), new.reason)
      where not exists (
        select 1
        from public.tournament_creator_permissions permission
        where permission.user_id = new.user_id
          and permission.status = 'active'::public.creator_permission_status
      );
    end if;

    return new;
  end if;

  if old.user_id <> auth.uid() then
    raise exception 'Usuário comum só pode alterar o próprio pedido.';
  end if;

  if old.status <> 'pending' or new.status <> 'cancelled' then
    raise exception 'Usuário comum só pode cancelar pedido pendente.';
  end if;

  if new.user_id is distinct from old.user_id
    or new.reason is distinct from old.reason
    or new.reviewed_by is distinct from old.reviewed_by
    or new.reviewed_at is distinct from old.reviewed_at
    or new.admin_notes is distinct from old.admin_notes
  then
    raise exception 'Usuário comum não pode alterar campos administrativos do pedido.';
  end if;

  return new;
end;
$$;

-- Valida escrita em permissoes efetivas.
-- Usuario comum nao consegue criar, revogar, reativar nem editar permissao.
-- Reativacao preservando historico deve criar nova permissao ativa, nao
-- sobrescrever uma linha revogada.
create or replace function public.validate_tournament_creator_permission_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('app.permission_backfill', true) = 'on' then
    return new;
  end if;

  if not public.is_admin() then
    raise exception 'Apenas admins podem alterar permissoes de criador de torneios.';
  end if;

  if TG_OP = 'UPDATE' then
    if new.id is distinct from old.id
      or new.user_id is distinct from old.user_id
      or new.granted_by is distinct from old.granted_by
      or new.granted_at is distinct from old.granted_at
      or new.grant_reason is distinct from old.grant_reason
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Campos historicos da permissao nao podem ser alterados.';
    end if;

    if old.status = 'revoked'::public.creator_permission_status
      and new.status = 'active'::public.creator_permission_status
    then
      raise exception 'Para reativar, crie uma nova permissao ativa e mantenha a permissao revogada como historico.';
    end if;
  end if;

  if new.status = 'active'::public.creator_permission_status then
    new.revoked_by := null;
    new.revoked_at := null;
    new.revoke_reason := null;
  end if;

  if new.status = 'revoked'::public.creator_permission_status then
    new.revoked_by := coalesce(new.revoked_by, auth.uid());
    new.revoked_at := coalesce(new.revoked_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists profiles_protect_update on public.profiles;
create trigger profiles_protect_update
  before update on public.profiles
  for each row
  execute function public.protect_profile_update();

drop trigger if exists tournament_creator_requests_set_updated_at
  on public.tournament_creator_requests;
create trigger tournament_creator_requests_set_updated_at
  before update on public.tournament_creator_requests
  for each row
  execute function public.set_updated_at();

drop trigger if exists tournament_creator_requests_validate_update
  on public.tournament_creator_requests;
create trigger tournament_creator_requests_validate_update
  before update on public.tournament_creator_requests
  for each row
  execute function public.validate_tournament_creator_request_update();

drop trigger if exists tournament_creator_permissions_set_updated_at
  on public.tournament_creator_permissions;
create trigger tournament_creator_permissions_set_updated_at
  before update on public.tournament_creator_permissions
  for each row
  execute function public.set_updated_at();

drop trigger if exists tournament_creator_permissions_validate_write
  on public.tournament_creator_permissions;
create trigger tournament_creator_permissions_validate_write
  before insert or update on public.tournament_creator_permissions
  for each row
  execute function public.validate_tournament_creator_permission_write();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- Função de bootstrap do primeiro admin.
-- Não recebe grant para anon/authenticated: deve ser executada manualmente no
-- SQL Editor por alguém com acesso administrativo ao projeto Supabase.
create or replace function public.bootstrap_first_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_user_id is null then
    raise exception 'target_user_id é obrigatório.';
  end if;

  if exists (
    select 1
    from public.profiles
    where role = 'admin'::public.user_role
  ) then
    raise exception 'Já existe ao menos um admin. Use uma conta admin para promover outros usuários.';
  end if;

  perform set_config('app.bootstrap_first_admin', 'on', true);

  update public.profiles
  set role = 'admin',
      updated_at = now()
  where id = target_user_id;

  if not found then
    raise exception 'Profile % não encontrado.', target_user_id;
  end if;

  perform set_config('app.bootstrap_first_admin', 'off', true);
end;
$$;

comment on function public.bootstrap_first_admin(uuid) is
  'Promove exatamente o primeiro admin. Executar manualmente no SQL Editor; não expor ao front-end.';

revoke all on function public.bootstrap_first_admin(uuid) from public;

alter table public.profiles enable row level security;
alter table public.tournament_creator_requests enable row level security;
alter table public.tournament_creator_permissions enable row level security;

-- Grants mínimos para uso via Supabase client.
-- RLS continua sendo a barreira real de segurança.
grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.tournament_creator_requests to authenticated;
grant select, insert, update on public.tournament_creator_permissions to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own_without_role" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

-- Usuários autenticados podem ler apenas o próprio profile.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

comment on policy "profiles_select_own" on public.profiles is
  'Permite ao usuário autenticado ler apenas o próprio profile.';

-- Admins podem ler todos os profiles.
-- Usa is_admin() SECURITY DEFINER para evitar recursão em RLS.
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

comment on policy "profiles_select_admin" on public.profiles is
  'Permite que admins leiam todos os profiles. is_admin() evita recursão em RLS.';

-- Usuários podem atualizar apenas o próprio profile.
-- O trigger protect_profile_update impede alteração de role/email por usuário comum.
create policy "profiles_update_own_without_role"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

comment on policy "profiles_update_own_without_role" on public.profiles is
  'Permite atualizar o próprio profile; trigger bloqueia role/email para usuário comum.';

-- Admins podem atualizar profiles.
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on policy "profiles_update_admin" on public.profiles is
  'Permite que admins atualizem profiles, inclusive role, sem permitir autopromoção de usuários comuns.';

drop policy if exists "requests_insert_own" on public.tournament_creator_requests;
drop policy if exists "requests_select_own" on public.tournament_creator_requests;
drop policy if exists "requests_select_admin" on public.tournament_creator_requests;
drop policy if exists "requests_cancel_own_pending" on public.tournament_creator_requests;
drop policy if exists "requests_review_admin" on public.tournament_creator_requests;

-- Usuários podem criar o próprio pedido de permissão.
create policy "requests_insert_own"
  on public.tournament_creator_requests
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'::public.request_status
    and reviewed_by is null
    and reviewed_at is null
    and admin_notes is null
  );

comment on policy "requests_insert_own" on public.tournament_creator_requests is
  'Permite que usuário autenticado crie apenas pedido próprio e pendente.';

-- Usuários podem ver os próprios pedidos.
create policy "requests_select_own"
  on public.tournament_creator_requests
  for select
  to authenticated
  using (user_id = auth.uid());

comment on policy "requests_select_own" on public.tournament_creator_requests is
  'Permite que usuário veja o histórico dos próprios pedidos.';

-- Admins podem ver todos os pedidos.
create policy "requests_select_admin"
  on public.tournament_creator_requests
  for select
  to authenticated
  using (public.is_admin());

comment on policy "requests_select_admin" on public.tournament_creator_requests is
  'Permite que admins acompanhem todos os pedidos de permissão.';

-- Usuários podem cancelar apenas os próprios pedidos pendentes.
-- O trigger validate_tournament_creator_request_update impede alteração de campos administrativos.
create policy "requests_cancel_own_pending"
  on public.tournament_creator_requests
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and status = 'pending'::public.request_status
  )
  with check (
    user_id = auth.uid()
    and status = 'cancelled'::public.request_status
  );

comment on policy "requests_cancel_own_pending" on public.tournament_creator_requests is
  'Permite ao usuário cancelar somente pedido próprio em pending.';

-- Admins podem aprovar ou rejeitar pedidos.
-- O trigger registra reviewed_by/reviewed_at quando necessário.
create policy "requests_review_admin"
  on public.tournament_creator_requests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on policy "requests_review_admin" on public.tournament_creator_requests is
  'Permite que admins aprovem/rejeitem pedidos. Usuários comuns não conseguem virar admin por esta tabela.';

drop policy if exists "creator_permissions_select_own" on public.tournament_creator_permissions;
drop policy if exists "creator_permissions_select_admin" on public.tournament_creator_permissions;
drop policy if exists "creator_permissions_insert_admin" on public.tournament_creator_permissions;
drop policy if exists "creator_permissions_update_admin" on public.tournament_creator_permissions;

-- Usuarios autenticados podem ver apenas a propria situacao de permissao.
create policy "creator_permissions_select_own"
  on public.tournament_creator_permissions
  for select
  to authenticated
  using (user_id = auth.uid());

comment on policy "creator_permissions_select_own" on public.tournament_creator_permissions is
  'Permite que usuario veja apenas permissoes proprias, inclusive revoked.';

-- Admins podem auditar todas as permissoes.
create policy "creator_permissions_select_admin"
  on public.tournament_creator_permissions
  for select
  to authenticated
  using (public.is_admin());

comment on policy "creator_permissions_select_admin" on public.tournament_creator_permissions is
  'Permite que admins vejam permissoes ativas e revogadas de todos os usuarios.';

-- Apenas admins podem conceder permissao ativa.
create policy "creator_permissions_insert_admin"
  on public.tournament_creator_permissions
  for insert
  to authenticated
  with check (
    public.is_admin()
    and status = 'active'::public.creator_permission_status
    and granted_by = auth.uid()
    and revoked_by is null
    and revoked_at is null
  );

comment on policy "creator_permissions_insert_admin" on public.tournament_creator_permissions is
  'Bloqueia criacao de permissao por usuario comum e exige admin como concedente.';

-- Apenas admins podem revogar. A trigger impede sobrescrever historico revogado.
create policy "creator_permissions_update_admin"
  on public.tournament_creator_permissions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on policy "creator_permissions_update_admin" on public.tournament_creator_permissions is
  'Permite revogacao por admin; usuarios comuns nao alteram status da permissao.';

-- ---------------------------------------------------------------------------
-- Módulo inicial de torneios e inscrições
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'tournament_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.tournament_status as enum (
      'draft',
      'registrations_open',
      'registrations_closed',
      'ongoing',
      'finished',
      'cancelled'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'tournament_registration_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.tournament_registration_status as enum (
      'registered',
      'cancelled'
    );
  end if;
end
$$;

create table if not exists public.tournaments (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null unique,
  modality text not null,
  description text,
  campus text,
  format text not null default 'single_elimination',
  status public.tournament_status not null default 'draft',
  max_participants integer not null default 16,
  starts_at date,
  ends_at date,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournaments_name_not_blank check (length(btrim(name)) > 0),
  constraint tournaments_slug_not_blank check (length(btrim(slug)) > 0),
  constraint tournaments_modality_not_blank check (length(btrim(modality)) > 0),
  constraint tournaments_max_participants_positive check (max_participants > 0),
  constraint tournaments_dates_order check (
    ends_at is null
    or starts_at is null
    or ends_at >= starts_at
  )
);

comment on table public.tournaments is
  'Torneios do sistema. Drafts são privados para admin/criador; demais status podem ser visualizados publicamente.';
comment on column public.tournaments.created_by is
  'Profile que criou o torneio. Usuário aprovado só pode editar torneios criados por ele.';
comment on column public.tournaments.status is
  'Status operacional do torneio: draft, registrations_open, registrations_closed, ongoing, finished ou cancelled.';

create table if not exists public.tournament_registrations (
  id uuid primary key default extensions.gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  status public.tournament_registration_status not null default 'registered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournament_registrations_display_name_not_blank check (length(btrim(display_name)) > 0)
);

comment on table public.tournament_registrations is
  'Inscrições de usuários em torneios. O MVP usa display_name e não expõe RA/e-mail na lista pública.';
comment on column public.tournament_registrations.status is
  'registered para inscrição ativa; cancelled para cancelamento preservando histórico.';

create unique index if not exists tournament_registrations_one_active_per_user
  on public.tournament_registrations (tournament_id, user_id)
  where status = 'registered';

create index if not exists tournaments_status_idx
  on public.tournaments (status);

create index if not exists tournaments_created_by_idx
  on public.tournaments (created_by);

create index if not exists tournament_registrations_tournament_idx
  on public.tournament_registrations (tournament_id, status);

-- Protege campos de autoria do torneio. Admins podem editar qualquer torneio,
-- mas mesmo admins não devem trocar id/created_at em update comum.
create or replace function public.protect_tournament_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'O id do torneio não pode ser alterado.';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'created_at do torneio não pode ser alterado.';
  end if;

  if new.created_by is distinct from old.created_by then
    raise exception 'created_by do torneio não pode ser alterado.';
  end if;

  return new;
end;
$$;

-- Garante que inscrições ativas só sejam criadas quando o torneio estiver
-- com inscrições abertas. A regra fica no banco, não apenas no React.
create or replace function public.validate_tournament_registration_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_tournament_status public.tournament_status;
  current_max_participants integer;
  current_registration_count integer;
begin
  if TG_OP = 'UPDATE' then
    if new.id is distinct from old.id then
      raise exception 'O id da inscrição não pode ser alterado.';
    end if;

    if new.tournament_id is distinct from old.tournament_id then
      raise exception 'O torneio da inscrição não pode ser alterado.';
    end if;

    if new.user_id is distinct from old.user_id then
      raise exception 'O usuário da inscrição não pode ser alterado.';
    end if;
  end if;

  if new.status = 'registered'::public.tournament_registration_status then
    select status, max_participants
    into current_tournament_status, current_max_participants
    from public.tournaments
    where id = new.tournament_id;

    if current_tournament_status <> 'registrations_open'::public.tournament_status then
      raise exception 'Inscrições só são permitidas quando o torneio está com inscrições abertas.';
    end if;

    select count(*)
    into current_registration_count
    from public.tournament_registrations
    where tournament_id = new.tournament_id
      and status = 'registered'::public.tournament_registration_status
      and (
        TG_OP = 'INSERT'
        or id <> new.id
      );

    if current_registration_count >= current_max_participants then
      raise exception 'O torneio atingiu o limite de participantes.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tournaments_set_updated_at on public.tournaments;
create trigger tournaments_set_updated_at
  before update on public.tournaments
  for each row
  execute function public.set_updated_at();

drop trigger if exists tournaments_protect_update on public.tournaments;
create trigger tournaments_protect_update
  before update on public.tournaments
  for each row
  execute function public.protect_tournament_update();

drop trigger if exists tournament_registrations_set_updated_at
  on public.tournament_registrations;
create trigger tournament_registrations_set_updated_at
  before update on public.tournament_registrations
  for each row
  execute function public.set_updated_at();

drop trigger if exists tournament_registrations_validate_insert
  on public.tournament_registrations;
create trigger tournament_registrations_validate_insert
  before insert on public.tournament_registrations
  for each row
  execute function public.validate_tournament_registration_write();

drop trigger if exists tournament_registrations_validate_update
  on public.tournament_registrations;
create trigger tournament_registrations_validate_update
  before update on public.tournament_registrations
  for each row
  execute function public.validate_tournament_registration_write();

alter table public.tournaments enable row level security;
alter table public.tournament_registrations enable row level security;

grant usage on schema public to anon;
grant select on public.tournaments to anon;
grant select on public.tournament_registrations to anon;
grant select, insert, update, delete on public.tournaments to authenticated;
grant select, insert, update, delete on public.tournament_registrations to authenticated;

drop policy if exists "tournaments_select_public" on public.tournaments;
drop policy if exists "tournaments_select_owner" on public.tournaments;
drop policy if exists "tournaments_select_admin" on public.tournaments;
drop policy if exists "tournaments_insert_creator" on public.tournaments;
drop policy if exists "tournaments_update_owner" on public.tournaments;
drop policy if exists "tournaments_update_admin" on public.tournaments;
drop policy if exists "tournaments_delete_admin" on public.tournaments;

-- Qualquer visitante pode ler torneios publicados, isto é, fora de draft.
create policy "tournaments_select_public"
  on public.tournaments
  for select
  to anon, authenticated
  using (status <> 'draft'::public.tournament_status);

comment on policy "tournaments_select_public" on public.tournaments is
  'Permite leitura pública de torneios que não estão em draft.';

-- Criador autenticado pode ler seus próprios torneios, inclusive draft.
create policy "tournaments_select_owner"
  on public.tournaments
  for select
  to authenticated
  using (created_by = auth.uid());

comment on policy "tournaments_select_owner" on public.tournaments is
  'Permite ao criador ver os próprios torneios.';

-- Admin vê todos os torneios.
create policy "tournaments_select_admin"
  on public.tournaments
  for select
  to authenticated
  using (public.is_admin());

comment on policy "tournaments_select_admin" on public.tournaments is
  'Permite que admin global visualize todos os torneios.';

-- Admin ou usuario com permissao ativa pode criar torneio.
create policy "tournaments_insert_creator"
  on public.tournaments
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.can_create_tournament()
  );

comment on policy "tournaments_insert_creator" on public.tournaments is
  'Permite criar torneio para admin ou usuario com permissao active; usuario autorizado nao vira admin.';

-- Usuario com permissao ativa so edita torneios criados por ele.
create policy "tournaments_update_owner"
  on public.tournaments
  for update
  to authenticated
  using (
    created_by = auth.uid()
    and public.can_create_tournament()
  )
  with check (
    created_by = auth.uid()
    and public.can_create_tournament()
  );

comment on policy "tournaments_update_owner" on public.tournaments is
  'Usuário aprovado pode editar apenas torneios próprios.';

-- Admin pode alterar qualquer torneio, inclusive em andamento.
create policy "tournaments_update_admin"
  on public.tournaments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on policy "tournaments_update_admin" on public.tournaments is
  'Admin global pode editar qualquer torneio em qualquer status.';

-- Excluir torneio fica restrito ao admin global no MVP.
create policy "tournaments_delete_admin"
  on public.tournaments
  for delete
  to authenticated
  using (public.is_admin());

comment on policy "tournaments_delete_admin" on public.tournaments is
  'Permite exclusão de torneio apenas para admin global.';

drop policy if exists "registrations_select_public" on public.tournament_registrations;
drop policy if exists "registrations_select_owner_tournament_admin" on public.tournament_registrations;
drop policy if exists "registrations_insert_open_tournament" on public.tournament_registrations;
drop policy if exists "registrations_cancel_own" on public.tournament_registrations;
drop policy if exists "registrations_update_admin" on public.tournament_registrations;
drop policy if exists "registrations_delete_admin" on public.tournament_registrations;

-- Lista pública de participantes só aparece para torneios públicos.
create policy "registrations_select_public"
  on public.tournament_registrations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.tournaments t
      where t.id = tournament_id
        and t.status <> 'draft'::public.tournament_status
    )
  );

comment on policy "registrations_select_public" on public.tournament_registrations is
  'Permite visualizar participantes de torneios públicos sem expor dados sensíveis.';

-- Criador do torneio e admin também podem ver inscrições de drafts próprios.
create policy "registrations_select_owner_tournament_admin"
  on public.tournament_registrations
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.tournaments t
      where t.id = tournament_id
        and t.created_by = auth.uid()
    )
  );

comment on policy "registrations_select_owner_tournament_admin" on public.tournament_registrations is
  'Permite ao admin e ao criador ver inscrições de torneios sob sua gestão.';

-- Usuário autenticado pode se inscrever apenas em torneio com inscrições abertas.
create policy "registrations_insert_open_tournament"
  on public.tournament_registrations
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'registered'::public.tournament_registration_status
    and exists (
      select 1
      from public.tournaments t
      where t.id = tournament_id
        and t.status = 'registrations_open'::public.tournament_status
    )
  );

comment on policy "registrations_insert_open_tournament" on public.tournament_registrations is
  'Bloqueia inscrição fora do status registrations_open.';

-- Usuário pode cancelar a própria inscrição; não pode mover para outro usuário.
create policy "registrations_cancel_own"
  on public.tournament_registrations
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and status = 'registered'::public.tournament_registration_status
  )
  with check (
    user_id = auth.uid()
    and status = 'cancelled'::public.tournament_registration_status
  );

comment on policy "registrations_cancel_own" on public.tournament_registrations is
  'Permite cancelar apenas a própria inscrição ativa.';

create policy "registrations_update_admin"
  on public.tournament_registrations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on policy "registrations_update_admin" on public.tournament_registrations is
  'Admin pode ajustar inscrições quando necessário, respeitando triggers de integridade.';

create policy "registrations_delete_admin"
  on public.tournament_registrations
  for delete
  to authenticated
  using (public.is_admin());

comment on policy "registrations_delete_admin" on public.tournament_registrations is
  'Permite exclusão física de inscrição apenas para admin global.';
