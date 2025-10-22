-- Create groups_duplicate table with same schema as groups
CREATE TABLE public.groups_duplicate (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add trigger for automatic updated_at timestamp
CREATE TRIGGER update_groups_duplicate_updated_at
  BEFORE UPDATE ON public.groups_duplicate
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS is NOT enabled (left disabled as requested)