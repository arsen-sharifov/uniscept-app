begin;

update public.user_preferences set theme = 'daybreak' where theme = 'light';
update public.user_preferences set theme = 'eclipse' where theme = 'dark';
update public.user_preferences set theme = 'auto' where theme = 'system';
update public.user_preferences set theme = 'auto'
  where theme not in ('daybreak', 'eclipse', 'graphite', 'solstice', 'aurora', 'auto');

alter table public.user_preferences
  drop constraint if exists user_preferences_theme_check;

alter table public.user_preferences
  alter column theme set default 'auto',
  add constraint user_preferences_theme_check
    check (theme in ('daybreak', 'eclipse', 'graphite', 'solstice', 'aurora', 'auto'));

alter table public.user_preferences
  drop column if exists snap_to_grid,
  drop column if exists show_grid,
  drop column if exists show_minimap,
  drop column if exists default_zoom,
  drop column if exists email_mentions,
  drop column if exists email_comments,
  drop column if exists email_invites,
  drop column if exists email_digest;

alter table public.user_preferences
  add column if not exists language text not null default 'en'
    check (language in ('en', 'uk', 'ro', 'fr', 'es', 'pt')),
  add column if not exists canvas_pattern text not null default 'dots'
    check (canvas_pattern in ('dots', 'lines', 'cross', 'none'));

commit;
