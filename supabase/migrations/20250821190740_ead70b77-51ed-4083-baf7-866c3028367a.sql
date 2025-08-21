-- Add email column to profiles table to store user emails
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;