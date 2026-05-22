-- Step 5: posts table + RLS policies
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  category text not null check (category in ('literature', 'tech', 'science', 'art')),
  cover_image text,
  created_at timestamptz not null default now()
);

create index if not exists posts_category_created_at_idx
  on public.posts (category, created_at desc);

alter table public.posts enable row level security;

drop policy if exists "Public can read posts" on public.posts;
create policy "Public can read posts"
  on public.posts
  for select
  to public
  using (true);

drop policy if exists "Authenticated users can insert posts" on public.posts;
create policy "Authenticated users can insert posts"
  on public.posts
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update posts" on public.posts;
create policy "Authenticated users can update posts"
  on public.posts
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete posts" on public.posts;
create policy "Authenticated users can delete posts"
  on public.posts
  for delete
  to authenticated
  using (true);

