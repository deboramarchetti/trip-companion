-- Our Vietnam Trip — shared expenses ("Contas").
-- Applied by hand (SQL editor / execute_sql) to the Supabase project used by the
-- app — NOT as a migration, so it does not touch that project's migration history.
-- The table has no direct access; the app only calls vt_pull / vt_push with a
-- trip key = a random 64-hex secret stored encrypted in private.enc.json ("__app".expensesKey).

create table if not exists public.vt_expenses (
  id uuid primary key,
  trip_key text not null check (length(trip_key) = 64),
  kind text not null check (kind in ('expense', 'settlement', 'settings')),
  data jsonb not null check (pg_column_size(data) < 8000),
  deleted boolean not null default false,
  client_updated_at timestamptz not null,
  updated_at timestamptz not null default clock_timestamp(),
  created_at timestamptz not null default now()
);
create index if not exists vt_expenses_trip_updated on public.vt_expenses (trip_key, updated_at);
alter table public.vt_expenses enable row level security;
revoke all on table public.vt_expenses from anon, authenticated;

create or replace function public.vt_pull(p_key text, p_since timestamptz default null)
returns table (id uuid, kind text, data jsonb, deleted boolean, client_updated_at timestamptz, updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select e.id, e.kind, e.data, e.deleted, e.client_updated_at, e.updated_at
  from public.vt_expenses e
  where length(p_key) = 64 and e.trip_key = p_key and (p_since is null or e.updated_at > p_since)
  order by e.updated_at
  limit 5000;
$$;

create or replace function public.vt_push(p_key text, p_rows jsonb)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare n integer;
begin
  if p_key is null or length(p_key) <> 64 then raise exception 'invalid key'; end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 500 then raise exception 'invalid rows'; end if;
  -- An edit "from the future" would win every later edit forever: reject it.
  if exists (select 1 from jsonb_array_elements(p_rows) r where (r->>'client_updated_at')::timestamptz > now() + interval '1 day') then
    raise exception 'client_updated_at in the future';
  end if;
  -- Abuse caps: per trip and for the whole table.
  if (select count(*) from public.vt_expenses where trip_key = p_key) + jsonb_array_length(p_rows) > 5000 then raise exception 'trip full'; end if;
  if (select count(*) from public.vt_expenses) > 200000 then raise exception 'storage full'; end if;
  insert into public.vt_expenses as e (id, trip_key, kind, data, deleted, client_updated_at)
  select (r->>'id')::uuid, p_key, r->>'kind', r->'data', coalesce((r->>'deleted')::boolean, false), (r->>'client_updated_at')::timestamptz
  from jsonb_array_elements(p_rows) r
  on conflict (id) do update
    set data = excluded.data, kind = excluded.kind, deleted = excluded.deleted,
        client_updated_at = excluded.client_updated_at, updated_at = clock_timestamp()
    where e.trip_key = p_key and e.client_updated_at < excluded.client_updated_at;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.vt_pull(text, timestamptz) from public;
revoke all on function public.vt_push(text, jsonb) from public;
grant execute on function public.vt_pull(text, timestamptz) to anon, authenticated;
grant execute on function public.vt_push(text, jsonb) to anon, authenticated;
