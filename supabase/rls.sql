-- Row Level Security for FIRE Tracker (defense-in-depth).
--
-- The app connects with the privileged Postgres role (which bypasses RLS) and
-- already filters every query by the authenticated profile id. These policies
-- are a second line of defense: if anything ever reaches these tables via the
-- anon/authenticated roles (e.g. the Data API), a user can only ever touch
-- their own rows. Safe to run multiple times.

-- profiles: a row is owned by the user whose id matches it.
alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- accounts / transactions / milestones / streaks: owned via profile_id.
alter table public.accounts enable row level security;
drop policy if exists "own accounts" on public.accounts;
create policy "own accounts" on public.accounts
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

alter table public.transactions enable row level security;
drop policy if exists "own transactions" on public.transactions;
create policy "own transactions" on public.transactions
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

alter table public.milestones enable row level security;
drop policy if exists "own milestones" on public.milestones;
create policy "own milestones" on public.milestones
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

alter table public.streaks enable row level security;
drop policy if exists "own streaks" on public.streaks;
create policy "own streaks" on public.streaks
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- snapshots: owned indirectly through their account.
alter table public.snapshots enable row level security;
drop policy if exists "own snapshots" on public.snapshots;
create policy "own snapshots" on public.snapshots
  for all using (
    exists (
      select 1 from public.accounts a
      where a.id = snapshots.account_id and a.profile_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.accounts a
      where a.id = snapshots.account_id and a.profile_id = auth.uid()
    )
  );

-- categories: shared reference data (seeded defaults). Readable by any signed-in
-- user; no row-level ownership.
alter table public.categories enable row level security;
drop policy if exists "read categories" on public.categories;
create policy "read categories" on public.categories
  for select using (auth.role() = 'authenticated');
