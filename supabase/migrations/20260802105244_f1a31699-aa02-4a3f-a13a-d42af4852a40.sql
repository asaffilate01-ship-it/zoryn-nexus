create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('zoryn-provider-command-worker') where exists (select 1 from cron.job where jobname = 'zoryn-provider-command-worker');
select cron.unschedule('zoryn-provider-event-processor') where exists (select 1 from cron.job where jobname = 'zoryn-provider-event-processor');
select cron.unschedule('zoryn-notification-worker') where exists (select 1 from cron.job where jobname = 'zoryn-notification-worker');

select cron.schedule(
  'zoryn-provider-command-worker',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://project--b574cab4-af47-4e08-8b19-3df7a6638b9f.lovable.app/api/public/provider-command-worker',
    headers := '{"Content-Type":"application/json","apikey":"sb_publishable__6QK3OUDRhhPQM5gOXtkYg_Q9d5F05l"}'::jsonb,
    body := '{"source":"pg_cron"}'::jsonb
  );
  $$
);

select cron.schedule(
  'zoryn-provider-event-processor',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://project--b574cab4-af47-4e08-8b19-3df7a6638b9f.lovable.app/api/public/provider-event-processor',
    headers := '{"Content-Type":"application/json","apikey":"sb_publishable__6QK3OUDRhhPQM5gOXtkYg_Q9d5F05l"}'::jsonb,
    body := '{"source":"pg_cron"}'::jsonb
  );
  $$
);

select cron.schedule(
  'zoryn-notification-worker',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://project--b574cab4-af47-4e08-8b19-3df7a6638b9f.lovable.app/api/public/notification-worker',
    headers := '{"Content-Type":"application/json","apikey":"sb_publishable__6QK3OUDRhhPQM5gOXtkYg_Q9d5F05l"}'::jsonb,
    body := '{"source":"pg_cron"}'::jsonb
  );
  $$
);