# Testing Supabase Connection

## Quick Test

Open your browser at http://localhost:8082 and:

1. **Open Console** (F12)
2. **Check for this message**: `✅ Supabase client initialized: https://ugxzmisewrugyefjpfcs.supabase.co`
3. **Submit a new report** with email/phone
4. **Check console for**: `✅ Report saved to Supabase: SRP-XXX`

## If You See Errors

### Error: Missing Supabase environment variables
- Make sure `.env` file exists in project root
- Restart dev server: `npm run dev`

### Error: Insert violates check constraint
- Make sure you ran the database schema in Supabase SQL Editor
- Check `supabase/schema.sql` was executed

### Reports not appearing in Supabase Dashboard
- Go to: https://app.supabase.com/project/ugxzmisewrugyefjpfcs/editor
- Click "reports" table
- Click refresh icon
- Should see your new report

## Verify in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/project/ugxzmisewrugyefjpfcs)
2. Click **Table Editor** → **reports**
3. You should see your submitted report with:
   - id (UUID format)
   - ticket_id (SRP-XXX)
   - Your email/phone if provided
   - status: open

## Test Status Updates with Notifications

1. Go to Admin panel: http://localhost:8082/admin/orders
2. Find your report
3. Change status to "In Progress"
4. Check console for notification log
5. Go to Supabase → Table Editor → **notifications**
6. You should see a notification record

## Common Issues

**Issue**: Report appears in app but not in Supabase
**Fix**: Check browser console for error messages. The new code will show detailed errors.

**Issue**: UUID error
**Fix**: Now fixed! Supabase generates the UUID automatically.

**Issue**: Connection timeout
**Fix**: Check your internet connection and Supabase project status.
