
-- 1) Lookup tables for normalized statuses
create table if not exists public.status_contacted_lookup (
  value text primary key,
  label text not null,
  sort_order int not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.status_candidate_lookup (
  value text primary key,
  label text not null,
  sort_order int not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed canonical Contacted statuses
insert into public.status_contacted_lookup (value, label, sort_order)
values
  ('Not Contacted', 'Not Contacted', 1),
  ('Ready to Call', 'Ready to Call', 2),
  ('Contacted', 'Contacted', 3),
  ('Call Done', 'Call Done', 4),
  ('1st No Answer', '1st No Answer', 5),
  ('2nd No Answer', '2nd No Answer', 6),
  ('3rd No Answer', '3rd No Answer', 7),
  ('Low Scored', 'Low Scored', 8)
on conflict (value) do nothing;

-- Seed canonical CandidateStatus values
insert into public.status_candidate_lookup (value, label, sort_order)
values
  ('Applied', 'Applied', 1),
  ('Longlisted', 'Longlisted', 2),
  ('Shortlisted', 'Shortlisted', 3),
  ('Interview', 'Interview', 4),
  ('Offer', 'Offer', 5),
  ('Hired', 'Hired', 6),
  ('Rejected', 'Rejected', 7),
  ('On Hold', 'On Hold', 8)
on conflict (value) do nothing;

-- RLS for lookup tables (read for authenticated, write only for admins)
alter table public.status_contacted_lookup enable row level security;
alter table public.status_candidate_lookup enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'status_contacted_lookup' and policyname = 'Status Contacted Read'
  ) then
    create policy "Status Contacted Read"
      on public.status_contacted_lookup
      for select
      using (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'status_candidate_lookup' and policyname = 'Status Candidate Read'
  ) then
    create policy "Status Candidate Read"
      on public.status_candidate_lookup
      for select
      using (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'status_contacted_lookup' and policyname = 'Status Contacted Admin Write'
  ) then
    create policy "Status Contacted Admin Write"
      on public.status_contacted_lookup
      for all
      using (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'status_candidate_lookup' and policyname = 'Status Candidate Admin Write'
  ) then
    create policy "Status Candidate Admin Write"
      on public.status_candidate_lookup
      for all
      using (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;
end$$;

-- 2) Add real timestamps to Jobs_CVs
alter table public."Jobs_CVs"
  add column if not exists longlisted_at timestamptz,
  add column if not exists shortlisted_at timestamptz;

-- 3) Validation triggers to enforce normalized statuses

-- Validate Jobs_CVs."Contacted" matches lookup
create or replace function public.validate_contacted_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new."Contacted" is null then
    return new;
  end if;

  if not exists (
    select 1 from public.status_contacted_lookup s where s.value = new."Contacted" and s.active = true
  ) then
    raise exception 'Invalid Contacted status: %', new."Contacted";
  end if;

  return new;
end; $$;

drop trigger if exists trg_jobs_cvs_validate_contacted on public."Jobs_CVs";
create trigger trg_jobs_cvs_validate_contacted
before insert or update of "Contacted" on public."Jobs_CVs"
for each row
execute function public.validate_contacted_status();

-- Validate CVs."CandidateStatus" matches lookup
create or replace function public.validate_candidate_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new."CandidateStatus" is null then
    return new;
  end if;

  if not exists (
    select 1 from public.status_candidate_lookup s where s.value = new."CandidateStatus" and s.active = true
  ) then
    raise exception 'Invalid CandidateStatus: %', new."CandidateStatus";
  end if;

  return new;
end; $$;

drop trigger if exists trg_cvs_validate_candidate_status on public."CVs";
create trigger trg_cvs_validate_candidate_status
before insert or update of "CandidateStatus" on public."CVs"
for each row
execute function public.validate_candidate_status();

-- 4) BEFORE INSERT to set longlisted_at
create or replace function public.jobs_cvs_set_longlisted_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.longlisted_at is null then
    new.longlisted_at := now();
  end if;
  return new;
end; $$;

drop trigger if exists trg_jobs_cvs_set_longlisted_at on public."Jobs_CVs";
create trigger trg_jobs_cvs_set_longlisted_at
before insert on public."Jobs_CVs"
for each row
execute function public.jobs_cvs_set_longlisted_at();

-- 5) status_history table with RLS
create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('candidate','job','job_candidate','call','comment','note','system')),
  change_type text not null,
  job_id text,
  candidate_id text,
  call_log_id uuid,
  comment_id uuid,
  from_status text,
  to_status text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  user_id uuid,
  created_at timestamptz not null default now()
);

alter table public.status_history enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'status_history' and policyname = 'Status history read'
  ) then
    create policy "Status history read"
      on public.status_history
      for select
      using (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'status_history' and policyname = 'Status history insert'
  ) then
    create policy "Status history insert"
      on public.status_history
      for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

create index if not exists idx_status_history_candidate_job_created_at
  on public.status_history (candidate_id, job_id, created_at);

-- 6) Audit triggers

-- Log "longlisted" after insert into Jobs_CVs
create or replace function public.jobs_cvs_log_longlisted()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.status_history (
    entity_type, change_type, job_id, candidate_id, description, user_id, metadata
  ) values (
    'job_candidate',
    'longlisted',
    new."Job ID",
    new."Candidate_ID",
    'Candidate longlisted for this job',
    auth.uid(),
    jsonb_build_object('source', 'trigger', 'table', 'Jobs_CVs', 'callid', new.callid)
  );
  return null;
end; $$;

drop trigger if exists trg_jobs_cvs_log_longlisted on public."Jobs_CVs";
create trigger trg_jobs_cvs_log_longlisted
after insert on public."Jobs_CVs"
for each row
execute function public.jobs_cvs_log_longlisted();

-- Log Contacted status changes on Jobs_CVs
create or replace function public.jobs_cvs_log_contacted_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (old."Contacted" is distinct from new."Contacted") then
    insert into public.status_history (
      entity_type, change_type, job_id, candidate_id, from_status, to_status, description, user_id, metadata
    ) values (
      'job_candidate',
      'contacted_status_change',
      new."Job ID",
      new."Candidate_ID",
      old."Contacted",
      new."Contacted",
      'Contacted status changed',
      auth.uid(),
      jsonb_build_object('source', 'trigger', 'table', 'Jobs_CVs', 'callid', new.callid)
    );
  end if;
  return null;
end; $$;

drop trigger if exists trg_jobs_cvs_log_contacted_change on public."Jobs_CVs";
create trigger trg_jobs_cvs_log_contacted_change
after update of "Contacted" on public."Jobs_CVs"
for each row
execute function public.jobs_cvs_log_contacted_change();

-- Log notes changes on Jobs_CVs
create or replace function public.jobs_cvs_log_notes_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (coalesce(old."Notes",'') is distinct from coalesce(new."Notes",'')) then
    insert into public.status_history (
      entity_type, change_type, job_id, candidate_id, description, user_id, metadata
    ) values (
      'job_candidate',
      'note_saved',
      new."Job ID",
      new."Candidate_ID",
      'Notes updated',
      auth.uid(),
      jsonb_build_object('source','trigger','table','Jobs_CVs','note_length', length(coalesce(new."Notes",'')))
    );
  end if;
  return null;
end; $$;

drop trigger if exists trg_jobs_cvs_log_notes_change on public."Jobs_CVs";
create trigger trg_jobs_cvs_log_notes_change
after update of "Notes" on public."Jobs_CVs"
for each row
execute function public.jobs_cvs_log_notes_change();

-- Log candidate status changes on CVs and propagate shortlisted_at
create or replace function public.cvs_log_candidate_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (old."CandidateStatus" is distinct from new."CandidateStatus") then
    -- Log the change
    insert into public.status_history (
      entity_type, change_type, candidate_id, from_status, to_status, description, user_id, metadata
    ) values (
      'candidate',
      'candidate_status_change',
      new."Cadndidate_ID",
      old."CandidateStatus",
      new."CandidateStatus",
      'Candidate status changed',
      auth.uid(),
      jsonb_build_object('source','trigger','table','CVs')
    );

    -- If moved to Shortlisted, set shortlisted_at for all related Jobs_CVs and log events
    if new."CandidateStatus" = 'Shortlisted' then
      update public."Jobs_CVs"
        set shortlisted_at = coalesce(shortlisted_at, now())
      where "Candidate_ID" = new."Cadndidate_ID"
        and shortlisted_at is null;

      insert into public.status_history (
        entity_type, change_type, job_id, candidate_id, description, user_id, metadata
      )
      select
        'job_candidate',
        'shortlisted',
        j."Job ID",
        j."Candidate_ID",
        'Candidate shortlisted for this job',
        auth.uid(),
        jsonb_build_object('source','trigger','table','Jobs_CVs')
      from public."Jobs_CVs" j
      where j."Candidate_ID" = new."Cadndidate_ID"
        and j.shortlisted_at is not null; -- protect against duplicates
    end if;
  end if;

  return null;
end; $$;

drop trigger if exists trg_cvs_log_candidate_status_change on public."CVs";
create trigger trg_cvs_log_candidate_status_change
after update of "CandidateStatus" on public."CVs"
for each row
execute function public.cvs_log_candidate_status_change();

-- Log call events into status_history
create or replace function public.call_logs_log_event()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.status_history (
    entity_type, change_type, job_id, candidate_id, call_log_id, description, user_id, metadata
  ) values (
    'call',
    'call_logged',
    new.job_id,
    new.candidate_id,
    new.id,
    'Call logged',
    new.recruiter_id, -- user who made the call is the "owner" of the row
    jsonb_build_object(
      'call_status', new.call_status,
      'duration', new.duration,
      'call_timestamp', new.call_timestamp
    )
  );
  return null;
end; $$;

drop trigger if exists trg_call_logs_log_event on public.call_logs;
create trigger trg_call_logs_log_event
after insert on public.call_logs
for each row
execute function public.call_logs_log_event();

-- 7) Analytics: materialized views and views

-- Daily call aggregates by job and recruiter
drop materialized view if exists public.mv_calls_daily;
create materialized view public.mv_calls_daily as
select
  date_trunc('day', call_timestamp) as day,
  job_id,
  recruiter_id,
  count(*) as total_calls,
  count(*) filter (where call_status not in ('no_answer','missed')) as connected_calls,
  count(*) filter (where call_status = 'no_answer') as no_answer_calls,
  avg(duration)::int as avg_duration_seconds
from public.call_logs
group by 1,2,3
with no data;

create index if not exists idx_mv_calls_daily_day_job_recruiter
  on public.mv_calls_daily (day, job_id, recruiter_id);

-- Candidate status distribution
drop materialized view if exists public.mv_candidate_status_counts;
create materialized view public.mv_candidate_status_counts as
select
  coalesce("CandidateStatus",'Unknown') as status,
  count(*)::int as count
from public."CVs"
group by 1
with no data;

create index if not exists idx_mv_candidate_status_counts_status
  on public.mv_candidate_status_counts (status);

-- Contacted status distribution per job
drop materialized view if exists public.mv_contacted_status_counts_by_job;
create materialized view public.mv_contacted_status_counts_by_job as
select
  coalesce(j."Job ID",'Unknown') as job_id,
  coalesce(j."Contacted",'Unknown') as contacted_status,
  count(*)::int as count
from public."Jobs_CVs" j
group by 1,2
with no data;

create index if not exists idx_mv_contacted_status_counts_by_job
  on public.mv_contacted_status_counts_by_job (job_id, contacted_status);

-- Time to shortlist per job (hours)
drop view if exists public.v_time_to_shortlist;
create view public.v_time_to_shortlist as
select
  j."Job ID" as job_id,
  avg(extract(epoch from (j.shortlisted_at - j.longlisted_at))/3600.0) as avg_hours_to_shortlist
from public."Jobs_CVs" j
where j.longlisted_at is not null
  and j.shortlisted_at is not null
group by 1;

-- Helper function to refresh all reporting materialized views
create or replace function public.refresh_reporting_materialized_views()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  refresh materialized view public.mv_calls_daily;
  refresh materialized view public.mv_candidate_status_counts;
  refresh materialized view public.mv_contacted_status_counts_by_job;
end; $$;

-- Note: We use triggers (not CHECK constraints) for validations to avoid immutability issues and ensure restorability.

