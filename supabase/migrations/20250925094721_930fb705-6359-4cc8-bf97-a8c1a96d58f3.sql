-- Remove all remaining policies from tables without RLS enabled
-- The Jobs and groups tables likely don't have RLS enabled

-- Remove all policies from Jobs table
DROP POLICY IF EXISTS "Users can view all jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Users can create jobs" ON public."Jobs"; 
DROP POLICY IF EXISTS "Users can update jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Users can delete jobs" ON public."Jobs";

-- Remove all policies from groups table  
DROP POLICY IF EXISTS "Users can view all groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can update groups" ON public.groups; 
DROP POLICY IF EXISTS "Users can delete groups" ON public.groups;

-- Fix the search_path for existing functions to address warnings
CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_time()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
   NEW.updated_time = NOW();
   RETURN NEW;
END;
$$;