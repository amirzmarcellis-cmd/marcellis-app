-- Add comm_summary and comm_score columns to Jobs_CVs table
ALTER TABLE public."Jobs_CVs"
ADD COLUMN comm_summary text,
ADD COLUMN comm_score bigint;