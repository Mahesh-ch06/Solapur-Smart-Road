-- Optional: Seed initial demo data for Solapur Road Rescuer
-- Run this in Supabase SQL Editor if you want some sample reports

-- Note: This will create some demo reports for testing
-- You can skip this if you want to start with a clean database

INSERT INTO public.reports (
  ticket_id,
  latitude,
  longitude,
  description,
  severity,
  status,
  created_at,
  address,
  resolved_at
) VALUES
  (
    'SRP-101',
    17.6599,
    75.9064,
    'Large pothole near main junction causing traffic issues',
    'high',
    'open',
    NOW() - INTERVAL '2 days',
    'Main Road, Solapur',
    NULL
  ),
  (
    'SRP-102',
    17.6650,
    75.9120,
    'Multiple small potholes on residential street',
    'medium',
    'in-progress',
    NOW() - INTERVAL '5 days',
    'Gandhi Nagar, Solapur',
    NULL
  ),
  (
    'SRP-103',
    17.6520,
    75.9000,
    'Road damage after recent heavy rains',
    'high',
    'open',
    NOW() - INTERVAL '1 day',
    'Station Road, Solapur',
    NULL
  ),
  (
    'SRP-104',
    17.6700,
    75.8950,
    'Small crack developing near school zone',
    'low',
    'resolved',
    NOW() - INTERVAL '7 days',
    'School Lane, Solapur',
    NOW()
  ),
  (
    'SRP-105',
    17.6580,
    75.9200,
    'Deep pothole causing vehicle damage',
    'high',
    'open',
    NOW() - INTERVAL '3 days',
    'Market Area, Solapur',
    NULL
  ),
  (
    'SRP-106',
    17.6450,
    75.9100,
    'Surface erosion on bypass road',
    'medium',
    'resolved',
    NOW() - INTERVAL '10 days',
    'Bypass Road, Solapur',
    NOW()
  );

-- Verify the data was inserted
SELECT 
  ticket_id,
  severity,
  status,
  LEFT(description, 40) as description,
  created_at
FROM public.reports
ORDER BY created_at DESC;
