-- Rename columns with spaces to lower_snake_case and fix typos
-- Wrap in a transaction
begin;

-- CVs table
alter table public."CVs" rename column "Phone Number" to phone_number;
alter table public."CVs" rename column "First Name" to first_name;
alter table public."CVs" rename column "Other Notes" to other_notes;
alter table public."CVs" rename column "CV Summary" to cv_summary;
alter table public."CVs" rename column "Applied for" to applied_for;
alter table public."CVs" rename column "Current Company" to current_company;
-- Fix typo Cadndidate_ID -> candidate_id
alter table public."CVs" rename column "Cadndidate_ID" to candidate_id;
alter table public."CVs" rename column "Last Name" to last_name;
alter table public."CVs" rename column "Done Questions" to done_questions;
-- Keep existing columns without spaces as-is (e.g., CandidateStatus, CV_Link, etc.)

-- Jobs table
alter table public."Jobs" rename column "Job ID" to job_id;
alter table public."Jobs" rename column "Job Title" to job_title;
alter table public."Jobs" rename column "Job Description" to job_description;
alter table public."Jobs" rename column "Job Location" to job_location;
alter table public."Jobs" rename column "Client Description" to client_description;
alter table public."Jobs" rename column "Contract Length" to contract_length;
alter table public."Jobs" rename column "Notice Period" to notice_period;
alter table public."Jobs" rename column "Nationality to include" to nationality_to_include;
alter table public."Jobs" rename column "Nationality to Exclude" to nationality_to_exclude;
alter table public."Jobs" rename column "Things to look for" to things_to_look_for;
-- Optional: simplify very long column name
alter table public."Jobs" rename column "Job Salary Range (ex: 15000 AED)" to job_salary_range;

-- Jobs_CVs table
alter table public."Jobs_CVs" rename column "Candidate Email" to candidate_email;
alter table public."Jobs_CVs" rename column "Job ID" to job_id;
-- Keep "Candidate_ID" as-is to avoid unintended scope, unless desired to standardize; keeping for now
alter table public."Jobs_CVs" rename column "Relatable CV?" to relatable_cv;
alter table public."Jobs_CVs" rename column "2 Questions of Interview" to two_questions_of_interview;
alter table public."Jobs_CVs" rename column "Contacted" to contacted;
alter table public."Jobs_CVs" rename column "Transcript" to transcript;
alter table public."Jobs_CVs" rename column "Summary" to summary;
alter table public."Jobs_CVs" rename column "Success Score" to success_score;
alter table public."Jobs_CVs" rename column "Score and Reason" to score_and_reason;
alter table public."Jobs_CVs" rename column "Candidate Name" to candidate_name;
alter table public."Jobs_CVs" rename column "Candidate Phone Number" to candidate_phone_number;
alter table public."Jobs_CVs" rename column "CV_Link" to cv_link;
alter table public."Jobs_CVs" rename column "Notice Period" to notice_period;
alter table public."Jobs_CVs" rename column "Salary Expectations" to salary_expectations;
alter table public."Jobs_CVs" rename column "Agency Experience" to agency_experience;
alter table public."Jobs_CVs" rename column "Notes" to notes;

-- Update dependent functions to use new column names
create or replace function public.jobs_cvs_log_notes_change()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $$
begin
  if tg_op = 'UPDATE' and (coalesce(old.notes,'') is distinct from coalesce(new.notes,'')) then
    insert into public.status_history (
      entity_type, change_type, job_id, candidate_id, description, user_id, metadata
    ) values (
      'job_candidate',
      'note_saved',
      new.job_id,
      new."Candidate_ID",
      'Notes updated',
      auth.uid(),
      jsonb_build_object(
        'source','trigger',
        'table','Jobs_CVs',
        'note_length', length(coalesce(new.notes,'')),
        'note', left(coalesce(new.notes,''), 500)
      )
    );
  end if;
  return null;
end; $$;

create or replace function public.jobs_cvs_set_longlisted_at()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $$
begin
  if new.longlisted_at is null then
    new.longlisted_at := now();
  end if;
  return new;
end; $$;

create or replace function public.jobs_cvs_log_longlisted()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $$
begin
  insert into public.status_history (
    entity_type, change_type, job_id, candidate_id, description, user_id, metadata
  ) values (
    'job_candidate',
    'longlisted',
    new.job_id,
    new."Candidate_ID",
    'Candidate longlisted for this job',
    auth.uid(),
    jsonb_build_object('source', 'trigger', 'table', 'Jobs_CVs', 'callid', new.callid)
  );
  return null;
end; $$;

create or replace function public.jobs_cvs_log_contacted_change()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $$
begin
  if tg_op = 'UPDATE' and (old.contacted is distinct from new.contacted) then
    insert into public.status_history (
      entity_type, change_type, job_id, candidate_id, from_status, to_status, description, user_id, metadata
    ) values (
      'job_candidate',
      'contacted_status_change',
      new.job_id,
      new."Candidate_ID",
      old.contacted,
      new.contacted,
      'Contacted status changed',
      auth.uid(),
      jsonb_build_object('source', 'trigger', 'table', 'Jobs_CVs', 'callid', new.callid)
    );
  end if;
  return null;
end; $$;

create or replace function public.cvs_log_candidate_status_change()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $$
begin
  if tg_op = 'UPDATE' and (old."CandidateStatus" is distinct from new."CandidateStatus") then
    -- Log the change
    insert into public.status_history (
      entity_type, change_type, candidate_id, from_status, to_status, description, user_id, metadata
    ) values (
      'candidate',
      'candidate_status_change',
      new.candidate_id,
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
      where "Candidate_ID" = new.candidate_id
        and shortlisted_at is null;

      insert into public.status_history (
        entity_type, change_type, job_id, candidate_id, description, user_id, metadata
      )
      select
        'job_candidate',
        'shortlisted',
        j.job_id,
        j."Candidate_ID",
        'Candidate shortlisted for this job',
        auth.uid(),
        jsonb_build_object('source','trigger','table','Jobs_CVs')
      from public."Jobs_CVs" j
      where j."Candidate_ID" = new.candidate_id
        and j.shortlisted_at is not null; -- protect against duplicates
    end if;
  end if;

  return null;
end; $$;

commit;