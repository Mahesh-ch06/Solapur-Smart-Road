# Support Tickets System Setup Guide

## Overview
The support tickets system allows users to submit queries via the Contact Us page, and admins can view, manage, and reply to these tickets through the admin portal.

## Features

### For Users:
- Submit support queries through the Contact Us page
- Receive a unique ticket number (SUP-XXXXXX format)
- Get email confirmation with ticket number
- Track queries by ticket number

### For Admins:
- View all support tickets in one place
- Filter tickets by status (new, in-progress, resolved, closed)
- Search tickets by number, name, email, or content
- Reply to tickets via email
- Update ticket status
- See stats (new, in-progress, resolved, total)

## Setup Instructions

### 1. Database Setup

Run the SQL migration to create the support_tickets table:

```bash
# Navigate to your Supabase project
# Go to SQL Editor and run the file:
supabase/support-tickets-schema.sql
```

Or manually execute in Supabase SQL Editor:

1. Login to Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the content from `supabase/support-tickets-schema.sql`
4. Click "Run"

### 2. Verify Table Creation

Check that the following was created:
- ✅ Table: `support_tickets`
- ✅ Indexes for performance
- ✅ RLS policies
- ✅ Function: `generate_ticket_number()`
- ✅ Trigger: Auto-update `updated_at` timestamp

### 3. Email Setup (Already Configured)

The system uses the same EmailJS configuration as OTP emails:

**Environment Variables:**
```env
VITE_EMAILJS_SERVICE_ID=service_r6i1e2r
VITE_EMAILJS_PUBLIC_KEY=oB-mfKG_R1QOJUEIT
```

**Template:** Uses `template_otp_verify` which has been updated to show:
- Support ticket confirmation
- Ticket number (instead of OTP)
- Expected response time

### 4. Access Admin Support Portal

1. Login to admin panel: `/admin/login`
2. Navigate to "Support Tickets" from the sidebar
3. The route is: `/admin/support`

## Admin Portal Features

### Dashboard Stats
- **New Tickets**: Unread/unassigned tickets
- **In Progress**: Tickets being worked on
- **Resolved**: Tickets with admin replies
- **Total**: All tickets in the system

### Filters & Search
- Filter by status: All, New, In Progress, Resolved, Closed
- Search by: Ticket number, name, email, subject, message

### Ticket Management
Each ticket card shows:
- Ticket number (SUP-XXXXXX)
- Status badge (color-coded)
- Priority badge (low, medium, high, urgent)
- User details (name, email, phone)
- Submission date
- Message content
- Admin reply (if any)

### Actions Available:
1. **Reply**: Opens modal to type and send a reply
   - Reply is saved to database
   - Ticket status automatically changes to "resolved"
   - Email notification sent to user (future enhancement)

2. **Mark Resolved**: Quick action to mark ticket as resolved without replying

3. **Close**: Close the ticket (final state)

## User Flow

### Submitting a Ticket:
1. User visits `/contact`
2. Fills out the contact form:
   - Name (required)
   - Email (required)
   - Phone (optional)
   - Subject (required)
   - Message (required)
3. If message contains "urgent", priority is set to "urgent"
4. On submit:
   - Ticket is saved to database
   - Unique ticket number is generated
   - Confirmation email is sent
   - Success message with ticket number is shown

### Admin Response:
1. Admin logs in to `/admin/support`
2. Views all tickets
3. Clicks "Reply" on a ticket
4. Types the response
5. Clicks "Send Reply & Mark Resolved"
6. User receives email with admin's reply (future enhancement)

## Ticket Statuses

- **new**: Just submitted, not yet reviewed
- **in-progress**: Admin is working on it
- **resolved**: Admin has replied/fixed the issue
- **closed**: Ticket is closed (no further action needed)

## Priority Levels

- **urgent**: User mentioned "urgent" in message (red badge)
- **high**: Manually set by admin (orange badge)
- **medium**: Default priority (yellow badge)
- **low**: Low priority issues (green badge)

## Database Schema

```sql
support_tickets (
  id                UUID PRIMARY KEY,
  ticket_number     TEXT UNIQUE (SUP-XXXXXX),
  name              TEXT,
  email             TEXT,
  phone             TEXT (optional),
  subject           TEXT,
  message           TEXT,
  status            TEXT (new, in-progress, resolved, closed),
  priority          TEXT (low, medium, high, urgent),
  admin_reply       TEXT (optional),
  admin_id          TEXT (optional),
  replied_at        TIMESTAMP (optional),
  created_at        TIMESTAMP,
  updated_at        TIMESTAMP
)
```

## Future Enhancements

### Planned Features:
1. **Email Notifications**: Send actual email replies to users
2. **Ticket Assignment**: Assign tickets to specific admins
3. **Internal Notes**: Add private notes visible only to admins
4. **File Attachments**: Allow users to upload screenshots
5. **Canned Responses**: Pre-written replies for common questions
6. **Auto-responder**: Automatic acknowledgment emails
7. **Escalation**: Auto-escalate old unresolved tickets
8. **Analytics**: Response time, resolution rate, etc.

## Testing

### Test the User Flow:
1. Go to `/contact`
2. Fill out the form with test data
3. Submit and note the ticket number
4. Check that email is received (if EmailJS is configured)

### Test the Admin Flow:
1. Login to `/admin`
2. Go to "Support Tickets"
3. Verify the test ticket appears
4. Try filtering and searching
5. Click "Reply" and send a test response
6. Verify status changes to "resolved"

## Troubleshooting

### Tickets not showing in admin portal?
- Check Supabase connection
- Verify table was created correctly
- Check browser console for errors
- Verify RLS policies are set correctly

### Email not being sent?
- Check EmailJS credentials in `.env`
- Verify EmailJS template has `{{to_email}}` in "To email" field
- Check EmailJS quota (200 emails/month on free tier)
- Check browser console for EmailJS errors

### Ticket number not generating?
- Check if `generate_ticket_number()` function exists in Supabase
- Verify function is accessible (RLS policies)
- Check browser console for errors

### Can't reply to tickets?
- Verify admin is logged in
- Check Supabase RLS policies allow updates
- Check browser console for errors

## API Reference

### Create Support Ticket
```typescript
const { error } = await supabase
  .from('support_tickets')
  .insert([{
    ticket_number: ticketNum,
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Issue with report',
    message: 'Description...',
    status: 'new',
    priority: 'medium'
  }]);
```

### Fetch All Tickets
```typescript
const { data, error } = await supabase
  .from('support_tickets')
  .select('*')
  .order('created_at', { ascending: false });
```

### Update Ticket with Reply
```typescript
const { error } = await supabase
  .from('support_tickets')
  .update({
    admin_reply: 'Your reply here...',
    status: 'resolved',
    replied_at: new Date().toISOString()
  })
  .eq('id', ticketId);
```

## Support

For questions or issues with the support ticket system:
- Check this documentation
- Review the code comments
- Check Supabase logs
- Contact the development team

---

**Last Updated:** January 2026
**Version:** 1.0.0
