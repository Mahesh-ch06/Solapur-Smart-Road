-- Add 'rejected' status to reports table
-- This migration updates the status constraint to include 'rejected'

-- Drop the existing constraint
ALTER TABLE public.reports 
DROP CONSTRAINT IF EXISTS reports_status_check;

-- Add new constraint with 'rejected' included
ALTER TABLE public.reports 
ADD CONSTRAINT reports_status_check 
CHECK (status IN ('open', 'in-progress', 'resolved', 'rejected'));

-- Update any existing NULL statuses to 'open' (just in case)
UPDATE public.reports 
SET status = 'open' 
WHERE status IS NULL;

-- Verify the change
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.reports'::regclass 
AND conname = 'reports_status_check';
