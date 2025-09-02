-- Create groups table
CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create policies for groups
CREATE POLICY "Users can view all groups" 
ON public.groups 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update groups" 
ON public.groups 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete groups" 
ON public.groups 
FOR DELETE 
USING (true);

-- Add group_id column to Jobs table
ALTER TABLE public.Jobs 
ADD COLUMN group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL;

-- Create trigger for groups updated_at
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();