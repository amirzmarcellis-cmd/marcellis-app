-- Add submitted_at column to Jobs_CVs table
ALTER TABLE public."Jobs_CVs" 
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;

-- Create function to set submitted_at when contacted becomes 'Submitted'
CREATE OR REPLACE FUNCTION public.set_submitted_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if contacted field is being updated to 'Submitted'
  IF NEW.contacted IS DISTINCT FROM OLD.contacted 
     AND NEW.contacted IS NOT NULL 
     AND LOWER(TRIM(NEW.contacted)) = 'submitted' THEN
    NEW.submitted_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on Jobs_CVs table
CREATE TRIGGER trigger_set_submitted_at
  BEFORE UPDATE ON public."Jobs_CVs"
  FOR EACH ROW
  EXECUTE FUNCTION public.set_submitted_at();