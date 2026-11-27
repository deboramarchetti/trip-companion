-- Our Vietnam Trip — travel documents (Reservas → Documentos).
-- Files are encrypted on the phone (AES-256-GCM, random key per party stored in
-- private.enc.json as "__docs@<party>".docsKey); this table only holds ciphertext.
-- access_key = SHA-256('ovt-docs:' + docsKey), so the server never sees the key.
-- Applied by hand (not as a migration) to the Supabase project used by the app.

create table if not exists public.vt_documents (
  id uuid primary key,
  access_key text not null check (length(access_key) = 64),
  owner text not null check (owner ~ '^[a-z0-9-]{1,32}$'), -- a traveller id from trip.travelers
  title text not null check (length(title) between 1 and 80),
  -- application/json = one encrypted blob per party with the booking codes typed in the app (src/docs/codes.ts)
  mime text not null check (mime in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/json')),
  size integer not null check (size between 1 and 8000000),
  iv text not null check (length(iv) between 8 and 64),
  data text not null check (length(data) <= 11000000),
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default clock_timestamp()
);
create index if not exists vt_documents_key on public.vt_documents (access_key, updated_at);
alter table public.vt_documents enable row level security;
revoke all on table public.vt_documents from anon, authenticated;

create or replace function public.vt_doc_list(p_key text)
returns table (id uuid, owner text, title text, mime text, size integer, deleted boolean, updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select d.id, d.owner, d.title, d.mime, d.size, d.deleted, d.updated_at
  from public.vt_documents d
  where length(p_key) = 64 and d.access_key = p_key
  order by d.created_at
  limit 200;
$$;

create or replace function public.vt_doc_get(p_key text, p_id uuid)
returns table (iv text, data text)
language sql stable security definer set search_path = ''
as $$
  select d.iv, d.data from public.vt_documents d
  where length(p_key) = 64 and d.access_key = p_key and d.id = p_id and not d.deleted;
$$;

create or replace function public.vt_doc_put(p_key text, p_id uuid, p_owner text, p_title text, p_mime text, p_size integer, p_iv text, p_data text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare n integer;
begin
  if p_key is null or length(p_key) <> 64 or p_id is null then raise exception 'invalid key'; end if;
  if (select count(*) from public.vt_documents where access_key = p_key and not deleted) >= 60 then raise exception 'too many documents'; end if;
  -- Abuse cap for the whole table (~300 MB of ciphertext).
  if (select coalesce(sum(length(data)), 0) from public.vt_documents) + coalesce(length(p_data), 0) > 300000000 then raise exception 'storage full'; end if;
  insert into public.vt_documents as d (id, access_key, owner, title, mime, size, iv, data)
  values (p_id, p_key, p_owner, p_title, p_mime, p_size, p_iv, p_data)
  on conflict (id) do update
    set owner = excluded.owner, title = excluded.title, mime = excluded.mime, size = excluded.size,
        iv = excluded.iv, data = excluded.data, deleted = false, updated_at = clock_timestamp()
    where d.access_key = p_key;
  get diagnostics n = row_count;
  return n = 1;
end;
$$;

create or replace function public.vt_doc_delete(p_key text, p_id uuid)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare n integer;
begin
  update public.vt_documents set deleted = true, data = '', iv = 'deletedxx', updated_at = clock_timestamp()
  where access_key = p_key and id = p_id and length(p_key) = 64;
  get diagnostics n = row_count;
  return n = 1;
end;
$$;

revoke all on function public.vt_doc_list(text), public.vt_doc_get(text, uuid), public.vt_doc_put(text, uuid, text, text, text, integer, text, text), public.vt_doc_delete(text, uuid) from public;
grant execute on function public.vt_doc_list(text), public.vt_doc_get(text, uuid), public.vt_doc_put(text, uuid, text, text, text, integer, text, text), public.vt_doc_delete(text, uuid) to anon, authenticated;
