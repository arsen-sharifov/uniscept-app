create table public.user_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  offer_answered boolean not null default false,
  completed_guides text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_onboarding enable row level security;

create policy "Users can read own onboarding"
  on public.user_onboarding for select
  using (auth.uid() = user_id);

create policy "Users can insert own onboarding"
  on public.user_onboarding for insert
  with check (auth.uid() = user_id);

create policy "Users can update own onboarding"
  on public.user_onboarding for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger on_user_onboarding_updated
  before update on public.user_onboarding
  for each row
  execute function public.handle_updated_at();

grant select, insert, update, delete on public.user_onboarding to anon, authenticated, service_role;
