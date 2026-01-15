# Database Migration: Add Rejected Status

## Problem
The reject button in admin dashboard fails with a 400 error because the database doesn't accept 'rejected' as a valid status value.

## Solution
Run the migration SQL to add 'rejected' to the allowed status values.

## How to Apply Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project: `ugxzmisewrugyefjpfcs`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/add-rejected-status.sql`
6. Click **Run** or press `Ctrl+Enter`
7. You should see: "Success. No rows returned"

### Option 2: Supabase CLI
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref ugxzmisewrugyefjpfcs

# Run the migration
supabase db push
```

### Option 3: Direct SQL (Manual)
Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE public.reports 
DROP CONSTRAINT IF EXISTS reports_status_check;

ALTER TABLE public.reports 
ADD CONSTRAINT reports_status_check 
CHECK (status IN ('open', 'in-progress', 'resolved', 'rejected'));
```

## Verification
After running the migration, test the reject button in admin dashboard. It should now work without errors.

## What Changed
- ✅ Updated `status` column constraint to include 'rejected'
- ✅ Updated schema.sql for future reference
- ✅ Admin can now reject reports and they will be saved to database
