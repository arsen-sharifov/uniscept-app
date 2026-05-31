begin;

alter table public.user_preferences
  add column if not exists snap_to_grid boolean not null default false,
  add column if not exists smart_guides boolean not null default true,
  add column if not exists default_zoom integer not null default 100;

alter table public.user_preferences
  drop constraint if exists user_preferences_default_zoom_check;

alter table public.user_preferences
  add constraint user_preferences_default_zoom_check
    check (default_zoom in (50, 75, 100, 125, 150));

commit;
