begin;
alter table public."Jobs" rename column "JD Summary" to jd_summary;
commit;