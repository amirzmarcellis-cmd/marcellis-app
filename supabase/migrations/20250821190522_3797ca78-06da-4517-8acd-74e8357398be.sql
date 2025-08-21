-- Clean up duplicate companies that are causing subdomain conflicts
-- Remove the Ocean and Ocean Gate companies that are causing conflicts

DELETE FROM company_users WHERE company_id IN (
  SELECT id FROM companies WHERE subdomain IN ('ocean', 'oceangate')
);

DELETE FROM companies WHERE subdomain IN ('ocean', 'oceangate');