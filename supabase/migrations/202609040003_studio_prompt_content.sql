-- Barnx Studio CMS prompt content
-- Allows full prompt text to be authored in Admin without adding a code file.

begin;

alter table public.prompt_resources
  add column if not exists prompt_text text not null default '';

commit;
