# Reverse Geocoding Implementation

## Overview
The app now displays human-readable addresses instead of raw coordinates using OpenStreetMap's Nominatim reverse geocoding API.

## Features

### 1. **Automatic Address Lookup**
- When a user pins a location on the map, the app automatically fetches the address
- Uses OpenStreetMap Nominatim API (free, no API key required)
- Shows loading state while fetching address

### 2. **Address Display Locations**
- **Report Form**: Shows address with coordinates as secondary info
- **Admin Work Orders**: Displays address in location column with tooltip
- **Map Popups**: Shows address in marker popups on admin map view

### 3. **Fallback Handling**
- If geocoding fails (network issues, rate limits), falls back to coordinates
- Graceful error handling with no user interruption

## Implementation Details

### Geocoding Function
Located in `src/utils/geolocation.ts`:
```typescript
reverseGeocode(lat: number, lng: number): Promise<string>
```

**Address Format:**
- Road/Street name
- Neighborhood/Suburb
- City/Town/Village
- State
- Postal code (if available)

Example: "MG Road, Sadar Bazar, Solapur, Maharashtra, 413001"

### Database Schema
The `reports` table includes an `address` column:
```sql
address text
```

### API Details
- **Provider**: OpenStreetMap Nominatim
- **Endpoint**: `https://nominatim.openstreetmap.org/reverse`
- **Rate Limit**: 1 request per second (enforced by user interaction, not programmatically)
- **No API Key Required**
- **User-Agent Header**: "SolapurRoadRescuer/1.0" (required by Nominatim)

## Migration for Existing Databases

If you already have a `reports` table without the `address` column:

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration script: `supabase/add-address-column.sql`

```sql
alter table public.reports 
add column if not exists address text;
```

## User Experience

### Before (Coordinates Only)
```
📍 17.6599, 75.9064
```

### After (Human-Readable Address)
```
📍 MG Road, Sadar Bazar, Solapur, Maharashtra
   17.6599°N, 75.9064°E
```

## Components Updated

1. **ReportForm** (`src/components/report/ReportForm.tsx`)
   - Fetches address when location changes
   - Shows loading spinner while geocoding
   - Displays address prominently with coordinates as secondary info

2. **AdminWorkOrders** (`src/components/admin/AdminWorkOrders.tsx`)
   - Location column shows address instead of coordinates
   - Truncates long addresses with tooltip on hover

3. **MapContainer** (`src/components/map/MapContainer.tsx`)
   - Map marker popups show address in a styled box

## Rate Limiting & Best Practices

**Nominatim Usage Policy:**
- Maximum 1 request per second
- Must include User-Agent header
- Respect the service (it's free and community-run)

**Current Implementation:**
- Only makes requests when user changes location (not on every map move)
- Includes proper User-Agent header
- Caches address in component state (no redundant requests)

## Troubleshooting

### Address Not Showing
1. Check browser console for errors
2. Verify internet connection
3. Check if Nominatim API is accessible
4. Falls back to coordinates if geocoding fails

### Database Migration
If addresses aren't saving:
```sql
-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'address';

-- Add column if missing
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS address text;
```

### Rate Limit Issues
If you're testing heavily and hit rate limits:
- Wait 1-2 seconds between location changes
- Consider using a geocoding cache for production
- For high-volume apps, consider paid geocoding services (Google Maps, Mapbox)

## Future Enhancements

### Possible Improvements
1. **Local Cache**: Store geocoded addresses in localStorage to reduce API calls
2. **Batch Geocoding**: Geocode multiple reports at once (with rate limiting)
3. **Alternative Providers**: Support multiple geocoding services as fallbacks
4. **Address Search**: Allow users to search by address and drop pin
5. **Address Verification**: Let users edit/confirm auto-generated addresses

### Production Considerations
For high-traffic production apps:
- Consider using Google Maps Geocoding API (paid, higher limits)
- Implement geocoding queue with rate limiting
- Cache geocoded results server-side
- Use Mapbox Geocoding API as alternative

## Testing

### Manual Testing Steps
1. Open report form
2. Drag map pin to new location
3. Verify address appears (with loading state)
4. Submit report
5. Check admin panel - location should show address
6. Hover over long addresses to see full text in tooltip
7. View map popups - addresses should appear in styled boxes

### Expected Behavior
- Address loads within 1-2 seconds
- Shows "Finding address..." during loading
- Falls back to coordinates if geocoding fails
- Addresses are saved to database
- Existing reports without addresses show coordinates

## API Reference

### reverseGeocode Function
```typescript
/**
 * Convert coordinates to human-readable address
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise<string> - Formatted address or coordinates as fallback
 */
async function reverseGeocode(lat: number, lng: number): Promise<string>
```

**Returns Format:**
- Success: "Street, Neighborhood, City, State, Postcode"
- Fallback: "17.6599°N, 75.9064°E"

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Supabase database has `address` column
3. Test with different locations to rule out API issues
4. Check network tab for failed API requests
