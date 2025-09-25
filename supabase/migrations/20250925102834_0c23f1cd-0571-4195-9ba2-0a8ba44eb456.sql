-- First clean up orphaned memberships
DELETE FROM public.memberships 
WHERE user_id NOT IN (SELECT user_id FROM public.profiles);

-- Then add the foreign key relationship
ALTER TABLE public.memberships 
ADD CONSTRAINT fk_memberships_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Create some test memberships for existing users
INSERT INTO public.memberships (user_id, team_id, role) VALUES
('a1dfebbc-f205-4026-b2ea-16fc227d47b5', '30ee478c-1d4c-4828-9b26-31a9876c6c97', 'EMPLOYEE'),
('3cd26821-f3f1-40a1-aef3-cedcbc5eb064', '605f6ac6-dc67-4b1a-b929-af2b5115da4f', 'MANAGER'),
('9c29ba2b-31ca-4447-b5f4-a50e1327b84e', '30ee478c-1d4c-4828-9b26-31a9876c6c97', 'MANAGER');