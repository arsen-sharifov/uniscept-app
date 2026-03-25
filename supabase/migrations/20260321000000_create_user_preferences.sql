create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  snap_to_grid boolean not null default false,
  show_grid boolean not null default true,
  show_minimap boolean not null default false,
  default_zoom integer not null default 100,
  email_mentions boolean not null default true,
  email_comments boolean not null default true,
  email_invites boolean not null default true,
  email_digest boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_user_preferences_updated
  before update on public.user_preferences
  for each row
  execute function public.handle_updated_at();
