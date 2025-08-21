-- Create some test data for Ocean company to verify data isolation
INSERT INTO "Jobs" (job_id, job_title, company_id, job_description, Processed)
VALUES 
  ('OCEAN-J-001', 'Ocean Software Engineer', 'e2bf7296-2d99-43d0-b357-0cda2c202399', 'Test job for Ocean company', 'Yes'),
  ('OCEAN-J-002', 'Ocean Product Manager', 'e2bf7296-2d99-43d0-b357-0cda2c202399', 'Another test job for Ocean', 'Yes');

INSERT INTO "CVs" (candidate_id, first_name, last_name, Email, company_id, "CandidateStatus")
VALUES 
  ('OCEAN-C-001', 'John', 'Ocean', 'john@ocean.com', 'e2bf7296-2d99-43d0-b357-0cda2c202399', 'Active'),
  ('OCEAN-C-002', 'Jane', 'Wave', 'jane@ocean.com', 'e2bf7296-2d99-43d0-b357-0cda2c202399', 'Active');