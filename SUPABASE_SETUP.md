# Supabase Integration Setup Guide

This guide explains how to set up the Supabase database and notification system for the Solapur Road Rescuer application.

## Prerequisites

1. Supabase account (already configured with the provided credentials)
2. Access to Supabase SQL Editor
3. (Optional) SendGrid API key for email notifications
4. (Optional) Twilio account for SMS notifications

## Step 1: Set Up Database Schema

1. Go to your Supabase Dashboard: https://app.supabase.com/project/ugxzmisewrugyefjpfcs
2. Navigate to the SQL Editor (left sidebar)
3. Copy the contents of `supabase/schema.sql`
4. Paste it into the SQL Editor and run it

This will create:
- `reports` table: Stores all pothole reports
- `notifications` table: Tracks notification history
- Database triggers: Automatically creates notifications when report status changes
- Row Level Security policies

## Step 2: Configure Environment Variables

The `.env` file has been created with your Supabase credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your public anonymous key

## Step 3: How Notifications Work

### Current Implementation (Logging Only)

The current setup logs notifications to the database and console. When a report status changes:

1. A database trigger automatically creates a notification record
2. The notification service logs the notification details
3. The notification is marked as "sent" in the database

### Production Setup (Actual Email/SMS)

To send actual emails and SMS in production, you need to:

#### Option A: Supabase Edge Functions (Recommended)

1. Create a Supabase Edge Function:

```bash
npx supabase functions new send-notification
```

2. Implement the edge function to:
   - Listen for new notifications in the database
   - Send emails via SendGrid/Resend
   - Send SMS via Twilio
   - Update notification status

3. Set up environment variables in Supabase Dashboard:
   - `SENDGRID_API_KEY` or `RESEND_API_KEY` for emails
   - `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` for SMS

#### Option B: Webhook Integration

1. Set up a webhook endpoint on your server
2. Configure Supabase database webhooks to call your endpoint
3. Implement email/SMS sending logic in your webhook handler

## Step 4: Testing the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Submit a test report with your email/phone number
3. Check the Supabase dashboard → Table Editor → notifications
4. Update the report status in the admin panel
5. Check console logs for notification attempts

## Database Schema Overview

### Reports Table
- `id`: UUID primary key
- `ticket_id`: Unique ticket identifier (e.g., SRP-123)
- `latitude`, `longitude`: Location coordinates
- `description`: Issue description
- `severity`: low/medium/high
- `status`: open/in-progress/resolved
- `user_email`, `user_phone`: Contact info for notifications
- Timestamps: `created_at`, `resolved_at`

### Notifications Table
- `id`: UUID primary key
- `report_id`: Foreign key to reports
- `recipient_email`, `recipient_phone`: Notification recipients
- `notification_type`: email/sms/both
- `status`: pending/sent/failed
- `message`: Notification content
- Timestamps: `created_at`, `sent_at`

## API Usage Examples

### Fetch All Reports
```typescript
const { data, error } = await supabase
  .from('reports')
  .select('*')
  .order('created_at', { ascending: false });
```

### Update Report Status
```typescript
const { error } = await supabase
  .from('reports')
  .update({ status: 'in-progress' })
  .eq('id', reportId);
```

### Get Notifications for a Report
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('report_id', reportId);
```

## Security Considerations

1. **Row Level Security (RLS)**: Currently enabled with permissive policies for development
2. **Production RLS**: Update policies to restrict access based on authentication
3. **API Keys**: Never commit API keys to version control
4. **Rate Limiting**: Implement rate limiting for notification sending

## Troubleshooting

### Connection Issues
- Verify Supabase credentials in `.env`
- Check Supabase project status
- Ensure network connectivity

### Notifications Not Sending
- Check browser console for errors
- Verify notification records in Supabase dashboard
- Check database trigger execution logs

### Database Sync Issues
- Call `syncWithSupabase()` to refresh local state
- Clear browser localStorage if needed
- Check for database migration errors

## Next Steps

1. Set up SendGrid/Resend for email notifications
2. Configure Twilio for SMS notifications
3. Implement Supabase Edge Functions
4. Add email templates for better formatting
5. Implement notification preferences
6. Add unsubscribe functionality

## Support

For issues or questions:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
