create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  name text not null,
  rating int not null check (rating between 1 and 5),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Allow anyone to read reviews"
on public.reviews
for select
to anon
using (true);

create policy "Allow anyone to insert reviews"
on public.reviews
for insert
to anon
with check (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table public.reviews;
  end if;
end $$;
