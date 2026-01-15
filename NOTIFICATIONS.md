# Email/SMS Notification System

This application includes an integrated notification system that sends updates to users when their report status changes.

## Features

✅ **Automatic Notifications**: When an admin changes a report status, notifications are automatically sent  
✅ **Email Support**: Send email notifications via SendGrid or Resend  
✅ **SMS Support**: Send SMS notifications via Twilio  
✅ **Database Tracking**: All notifications are logged in Supabase  
✅ **Optional Contact Info**: Users can choose to provide email/phone for updates  

## How It Works

### For Users (Reporting)

1. **Submit a Report**: Users navigate to the Report page and fill out the pothole information
2. **Provide Contact Info** (Optional): On the review step, users can enter:
   - Email address for email notifications
   - Phone number for SMS notifications  
   - Both for dual notifications
3. **Receive Updates**: When the report status changes (e.g., open → in-progress → resolved), users receive automatic notifications

### For Admins (Managing Reports)

1. **Access Admin Dashboard**: Navigate to `/admin/orders`
2. **Update Status**: Click on any report and change its status
3. **Automatic Notification**: When status is updated:
   - A notification record is created in Supabase
   - The notification service processes it
   - Users receive updates via their preferred method

## Notification Messages

The system sends user-friendly messages based on status changes:

- **Open**: "Your report SRP-XXX has been reported and is awaiting review"
- **In Progress**: "Your report SRP-XXX is now being worked on by our road maintenance team"
- **Resolved**: "Your report SRP-XXX has been successfully fixed! Thank you for your patience"

## Current Implementation (Development Mode)

The current setup logs notifications to:
- **Browser Console**: View notification attempts in developer tools
- **Supabase Database**: Check the `notifications` table for all records

To see notifications in action:
1. Open browser developer console (F12)
2. Submit a report with your email/phone
3. Update the report status in admin panel
4. Check console for notification logs
5. Verify in Supabase Dashboard → Table Editor → notifications

## Production Setup

To send actual emails and SMS, you need to:

### 1. Set Up Email Service (SendGrid or Resend)

**Option A: SendGrid**
1. Create account at https://sendgrid.com
2. Generate an API key
3. Add to Supabase Edge Function environment:
   ```
   SENDGRID_API_KEY=your_key_here
   ```

**Option B: Resend**
1. Create account at https://resend.com
2. Generate an API key
3. Update edge function to use Resend API

### 2. Set Up SMS Service (Twilio)

1. Create account at https://twilio.com
2. Get a phone number
3. Get Account SID and Auth Token
4. Add to Supabase Edge Function environment:
   ```
   TWILIO_ACCOUNT_SID=your_sid_here
   TWILIO_AUTH_TOKEN=your_token_here
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

### 3. Deploy Edge Function

The edge function code is in `supabase/functions/send-notification/index.ts`

Deploy it using Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref ugxzmisewrugyefjpfcs

# Deploy the function
npx supabase functions deploy send-notification

# Set environment variables
npx supabase secrets set SENDGRID_API_KEY=your_key_here
npx supabase secrets set TWILIO_ACCOUNT_SID=your_sid_here
npx supabase secrets set TWILIO_AUTH_TOKEN=your_token_here
npx supabase secrets set TWILIO_PHONE_NUMBER=your_number_here
```

### 4. Update Notification Service

Modify `src/services/notificationService.ts` to call the edge function:

```typescript
// Replace simulateSendNotification with:
async function sendNotificationViaEdgeFunction(notification: any) {
  const { data, error } = await supabase.functions.invoke('send-notification', {
    body: { notificationId: notification.id }
  });
  
  if (error) throw error;
  return data;
}
```

## Testing

### Test Email Notifications
1. Submit a report with a valid email address
2. Update status in admin panel
3. Check your email inbox

### Test SMS Notifications
1. Submit a report with a valid phone number (format: +919876543210)
2. Update status in admin panel
3. Check your phone for SMS

### Test Database Logging
1. Go to Supabase Dashboard
2. Navigate to Table Editor → notifications
3. See all notification records with status

## Database Schema

### Notifications Table
```sql
- id: UUID (primary key)
- report_id: UUID (foreign key to reports)
- recipient_email: TEXT (nullable)
- recipient_phone: TEXT (nullable)  
- notification_type: ENUM (email, sms, both)
- status: ENUM (pending, sent, failed)
- message: TEXT
- sent_at: TIMESTAMP (nullable)
- created_at: TIMESTAMP
```

## Troubleshooting

### Notifications not being created
- Check that report has user email or phone
- Verify database trigger is active
- Check Supabase logs for errors

### Emails not sending
- Verify SendGrid/Resend API key
- Check sender email is verified
- Review edge function logs
- Check spam folder

### SMS not sending
- Verify Twilio credentials
- Ensure phone number format is correct (+country code)
- Check Twilio account balance
- Review edge function logs

### Database trigger not firing
- Run this query to check trigger:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_report_status_change';
  ```
- Re-run schema.sql if needed

## Cost Considerations

**SendGrid**: 100 emails/day free tier  
**Resend**: 3,000 emails/month free tier  
**Twilio**: Pay-as-you-go, ~$0.0075 per SMS  

Monitor usage and set up alerts to avoid unexpected charges.

## Security & Privacy

- Contact information is optional
- Data stored in Supabase with RLS enabled
- Notifications sent only on status changes
- Users can opt-out by not providing contact info
- Consider adding unsubscribe functionality for production

## Future Enhancements

- [ ] Email templates with better styling
- [ ] User notification preferences
- [ ] Digest notifications (daily summary)
- [ ] Unsubscribe link in emails
- [ ] WhatsApp notifications
- [ ] Push notifications for mobile app
- [ ] Notification history in user dashboard

## Support

For issues or questions:
- Check Supabase logs in dashboard
- Review edge function logs
- Contact support with notification ID from database
