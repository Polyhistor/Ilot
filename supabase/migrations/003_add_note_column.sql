-- Add note column to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS note text;
