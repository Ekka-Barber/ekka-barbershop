-- HR and access-code security hardening
-- - Moves HR access verification to hashed values
-- - Adds secure RPC helpers for role detection
-- - Enforces RLS on HR business tables
-- - Restricts direct reads of access-code tables
-- - Adds missing FK index and removes duplicate indexes

create extension if not exists pgcrypto;

create or replace function public.normalize_access_code(code text)
returns text
language sql
immutable
as $$
  select lower(trim(coalesce(code, '')));
$$;

alter table public.hr_access
  add column if not exists access_code_hash text;

update public.hr_access
set access_code_hash = extensions.crypt(
  public.normalize_access_code(access_code),
  extensions.gen_salt('bf', 10)
)
where access_code_hash is null
  and access_code is not null
  and public.normalize_access_code(access_code) <> '';

create or replace function public.sync_hr_access_hash()
returns trigger
language plpgsql
set search_path = 'public'
as $$
declare
  normalized text;
begin
  if new.access_code is not null then
    normalized := public.normalize_access_code(new.access_code);

    if normalized <> '' then
      new.access_code_hash := extensions.crypt(normalized, extensions.gen_salt('bf', 10));
      new.access_code := null;
    end if;
  end if;

  if new.access_code_hash is null or btrim(new.access_code_hash) = '' then
    raise exception 'HR access code hash cannot be empty';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_hr_access_hash on public.hr_access;

create trigger trg_sync_hr_access_hash
before insert or update of access_code, access_code_hash
on public.hr_access
for each row
execute function public.sync_hr_access_hash();

alter table public.hr_access
  alter column access_code drop not null;

update public.hr_access
set access_code = null
where access_code is not null;

alter table public.hr_access
  alter column access_code_hash set not null;

create or replace function public.verify_owner_access(code text)
returns boolean
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  normalized text := public.normalize_access_code(code);
begin
  if normalized = '' then
    return false;
  end if;

  return exists (
    select 1
    from public.owner_access
    where access_code = normalized
  );
end;
$$;

create or replace function public.verify_manager_access(code text)
returns boolean
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  normalized text := public.normalize_access_code(code);
begin
  if normalized = '' then
    return false;
  end if;

  return exists (
    select 1
    from public.branch_managers
    where access_code = normalized
  );
end;
$$;

create or replace function public.verify_hr_access(code text)
returns boolean
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  normalized text := public.normalize_access_code(code);
begin
  if normalized = '' then
    return false;
  end if;

  return exists (
    select 1
    from public.hr_access
    where access_code_hash is not null
      and extensions.crypt(normalized, access_code_hash) = access_code_hash
  );
end;
$$;

create or replace function public.detect_access_role(code text)
returns text
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  normalized text := public.normalize_access_code(code);
begin
  if normalized = '' then
    return null;
  end if;

  if public.verify_owner_access(normalized) then
    return 'owner';
  end if;

  if public.verify_hr_access(normalized) then
    return 'hr';
  end if;

  if public.verify_manager_access(normalized) then
    if normalized = 'ma225' then
      return 'super_manager';
    end if;

    return 'manager';
  end if;

  return null;
end;
$$;

create or replace function public.request_access_code()
returns text
language plpgsql
stable
security definer
set search_path = 'public'
as $$
declare
  headers_text text;
  headers_json jsonb;
  code text;
begin
  headers_text := current_setting('request.headers', true);

  if headers_text is null or headers_text = '' then
    return null;
  end if;

  begin
    headers_json := headers_text::jsonb;
  exception
    when others then
      return null;
  end;

  code := coalesce(
    headers_json ->> 'x-ekka-access-code',
    headers_json ->> 'X-Ekka-Access-Code'
  );

  code := public.normalize_access_code(code);

  if code = '' then
    return null;
  end if;

  return code;
end;
$$;

create or replace function public.request_access_role()
returns text
language plpgsql
stable
security definer
set search_path = 'public'
as $$
declare
  code text := public.request_access_code();
begin
  if code is null then
    return null;
  end if;

  return public.detect_access_role(code);
end;
$$;

create or replace function public.can_access_business_data()
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select coalesce(
    public.request_access_role() in ('owner', 'manager', 'super_manager', 'hr'),
    false
  );
$$;

create or replace function public.set_owner_access(code text)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  normalized text := public.normalize_access_code(code);
begin
  if not public.verify_owner_access(normalized) then
    raise exception 'Invalid owner access code';
  end if;

  perform set_config('app.owner_access', normalized, true);
end;
$$;

create or replace function public.set_branch_manager_code(access_code text)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  normalized text := public.normalize_access_code(access_code);
begin
  if not public.verify_manager_access(normalized) then
    raise exception 'Invalid branch manager access code';
  end if;

  perform set_config('app.branch_manager_code', normalized, true);
end;
$$;

create or replace function public.set_hr_access(code text)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  normalized text := public.normalize_access_code(code);
begin
  if not public.verify_hr_access(normalized) then
    raise exception 'Invalid HR access code';
  end if;

  update public.hr_access
  set updated_at = now()
  where access_code_hash is not null
    and extensions.crypt(normalized, access_code_hash) = access_code_hash;

  perform set_config('app.current_hr_access_code', normalized, true);
end;
$$;

create or replace function public.clear_access_codes()
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  perform set_config('app.current_hr_access_code', null, true);
  perform set_config('app.owner_access', null, true);
  perform set_config('app.branch_manager_code', null, true);
end;
$$;

grant execute on function public.verify_owner_access(text) to anon, authenticated;
grant execute on function public.verify_manager_access(text) to anon, authenticated;
grant execute on function public.verify_hr_access(text) to anon, authenticated;
grant execute on function public.detect_access_role(text) to anon, authenticated;
grant execute on function public.set_owner_access(text) to anon, authenticated;
grant execute on function public.set_branch_manager_code(text) to anon, authenticated;
grant execute on function public.set_hr_access(text) to anon, authenticated;
grant execute on function public.clear_access_codes() to anon, authenticated;

alter table public.employees enable row level security;
alter table public.employee_documents enable row level security;
alter table public.sponsors enable row level security;
alter table public.branch_managers enable row level security;
alter table public.owner_access enable row level security;
alter table public.hr_access enable row level security;

drop policy if exists employees_access_policy on public.employees;
drop policy if exists employee_documents_access_policy on public.employee_documents;
drop policy if exists sponsors_access_policy on public.sponsors;
drop policy if exists branch_managers_self_read_policy on public.branch_managers;

create policy employees_access_policy
on public.employees
for all
to anon, authenticated
using (public.can_access_business_data())
with check (public.can_access_business_data());

create policy employee_documents_access_policy
on public.employee_documents
for all
to anon, authenticated
using (public.can_access_business_data())
with check (public.can_access_business_data());

create policy sponsors_access_policy
on public.sponsors
for all
to anon, authenticated
using (public.can_access_business_data())
with check (public.can_access_business_data());

create policy branch_managers_self_read_policy
on public.branch_managers
for select
to anon, authenticated
using (
  public.request_access_code() is not null
  and public.normalize_access_code(access_code) = public.request_access_code()
);

revoke all on table public.employees from anon, authenticated;
grant select, insert, update, delete on table public.employees to anon, authenticated;

revoke all on table public.employee_documents from anon, authenticated;
grant select, insert, update, delete on table public.employee_documents to anon, authenticated;

revoke all on table public.sponsors from anon, authenticated;
grant select, insert, update, delete on table public.sponsors to anon, authenticated;

revoke all on table public.branch_managers from anon, authenticated;
grant select on table public.branch_managers to anon, authenticated;

revoke all on table public.owner_access from anon, authenticated;
revoke all on table public.hr_access from anon, authenticated;

create index if not exists idx_employees_sponsor_id
  on public.employees (sponsor_id);

create index if not exists idx_branch_managers_branch_id
  on public.branch_managers (branch_id);

drop index if exists public.idx_employee_bonuses_employee_date;
drop index if exists public.idx_employee_deductions_employee_date;
drop index if exists public.idx_employee_loans_employee_date;
drop index if exists public.idx_employee_sales_employee_id_month;
drop index if exists public.idx_employee_sales_employee_month;
drop index if exists public.idx_review_avatar_cache_accessed;

alter table public.qr_codes
  drop constraint if exists qr_codes_id_unique;
