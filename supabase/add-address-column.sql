-- Migration: Add address column to reports table
-- Run this if you already have the reports table without the address column

-- Add address column if it doesn't exist
alter table public.reports 
add column if not exists address text;

-- Add comment for documentation
comment on column public.reports.address is 'Human-readable address from reverse geocoding';
