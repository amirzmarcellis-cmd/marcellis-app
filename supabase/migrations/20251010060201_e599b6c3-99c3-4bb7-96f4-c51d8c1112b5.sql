-- Add client_status column to Jobs_CVs table
ALTER TABLE "Jobs_CVs" 
ADD COLUMN client_status text DEFAULT 'Interview Requested';