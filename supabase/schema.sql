-- Famma-Me V2 database
create extension if not exists pgcrypto;

create table if not exists public.places (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 category text not null check (category in ('shop','market','bakery','pharmacy','fuel','water','other')),
 gov text not null,
 address text,
 water boolean not null default false,
 lat double precision not null check (lat between 30 and 38),
 lng double precision not null check (lng between 7 and 12),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 user_id uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.places enable row level security;

create policy "approved places are public"
on public.places for select using (status='approved');

create policy "authenticated users can submit"
on public.places for insert to authenticated
with check (user_id=auth.uid() and status='pending');

create index if not exists places_gov_idx on public.places(gov);
create index if not exists places_category_idx on public.places(category);
create index if not exists places_status_idx on public.places(status);

-- Enable realtime for community updates
alter publication supabase_realtime add table public.places;
