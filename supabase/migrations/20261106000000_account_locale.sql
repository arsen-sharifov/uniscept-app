create or replace function public.sync_account_locale()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.language is not distinct from new.language then
    return new;
  end if;

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('locale', new.language)
  where id = new.user_id;

  return new;
end;
$$;

create trigger on_user_preferences_language_saved
  after insert or update of language on public.user_preferences
  for each row
  execute function public.sync_account_locale();

update auth.users u
set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('locale', p.language)
from public.user_preferences p
where p.user_id = u.id;
