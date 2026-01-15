# 📧 Email Notification Setup Guide

## Overview
The app now sends **real email notifications** to citizens when they:
1. **Submit a report** - Confirmation email with ticket ID
2. **Report status changes** - Updates when status moves to "In Progress" or "Resolved"

## ✅ What's Fixed

### Before
- ❌ Notifications only logged to console
- ❌ Citizens never received emails
- ❌ No confirmation when submitting reports

### After
- ✅ **Confirmation emails** sent when report is submitted
- ✅ **Status update emails** sent when admin changes status
- ✅ Works immediately with EmailJS (free service)
- ✅ Fallback to console logging if EmailJS not configured

## 🚀 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account

1. Go to **https://www.emailjs.com/**
2. Click **"Sign Up Free"**
3. Create account with your email
4. Verify your email address

### Step 2: Add Email Service

1. In EmailJS Dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - Outlook
   - Yahoo
   - Custom SMTP
4. Follow the connection wizard
5. **Copy the Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template

1. Go to **"Email Templates"** in EmailJS Dashboard
2. Click **"Create New Template"**
3. **Template Name**: `road_rescuer_notification`
4. **Email Content**:

```html
Subject: {{subject}}

Hello {{to_name}},

{{message}}

Best regards,
Solapur Road Rescuer Team

---
This is an automated notification. Please do not reply to this email.
```

5. **Template Variables**:
   - `to_email` - Recipient email
   - `to_name` - Recipient name
   - `message` - Notification message
   - `subject` - Email subject

6. **Save** and **copy the Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key

1. Go to **"Account"** → **"General"**
2. Find **"Public Key"** section
3. **Copy your Public Key** (e.g., `abc123XYZ456`)

### Step 5: Update .env File

Open `.env` and update these lines:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=abc123XYZ456
```

Replace with your actual IDs from EmailJS.

### Step 6: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎯 Testing Email Notifications

### Test 1: Report Submission Confirmation

1. Go to **http://localhost:8082/report**
2. Fill out the form with **your email address**
3. Submit the report
4. **Check your email** - you should receive:
   ```
   Subject: Solapur Road Rescuer - Report Update
   
   Thank you for reporting a road issue! 
   Your report SLR-0001 has been received and will be reviewed...
   ```

### Test 2: Status Change Notification

1. Login to admin panel
2. Go to **Work Orders**
3. Change a report status to "In Progress"
4. **Check the reporter's email** - they should receive:
   ```
   Subject: Solapur Road Rescuer - Report Update
   
   Update on your road issue report SLR-0001: 
   Your report is now being worked on by our road maintenance team.
   ```

### Test 3: Resolution Notification

1. Change status to "Resolved"
2. Reporter receives:
   ```
   Update on your road issue report SLR-0001: 
   Your report has been successfully fixed! Thank you for your patience.
   ```

## 📊 Email Templates

### Confirmation Email (on report submission)
```
Thank you for reporting a road issue! 
Your report {TICKET_ID} has been received and will be reviewed by our team soon. 
We'll keep you updated on the progress.
```

### Status Update: In Progress
```
Update on your road issue report {TICKET_ID}: 
Your report is now being worked on by our road maintenance team.
```

### Status Update: Resolved
```
Update on your road issue report {TICKET_ID}: 
Your report has been successfully fixed! Thank you for your patience.
```

## 🔍 Troubleshooting

### Emails Not Sending?

1. **Check EmailJS Dashboard**
   - Go to https://dashboard.emailjs.com/
   - Check "History" tab for failed sends
   - Look for error messages

2. **Verify .env Configuration**
   ```bash
   # Make sure these are set:
   VITE_EMAILJS_SERVICE_ID=service_...
   VITE_EMAILJS_TEMPLATE_ID=template_...
   VITE_EMAILJS_PUBLIC_KEY=...
   ```

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for EmailJS errors
   - Should see: "✅ Email sent successfully to: user@email.com"

4. **Verify Email Service Connection**
   - Go to EmailJS Dashboard → Email Services
   - Make sure service shows "Connected" status
   - Re-authenticate if needed

### Emails Going to Spam?

1. **Gmail**: Check "Promotions" or "Updates" folder
2. **Add to Safe Senders**: Mark emails as "Not Spam"
3. **Use Custom Domain**: For production, use a professional email service

### Rate Limits

**EmailJS Free Tier:**
- 200 emails/month
- 2 email templates
- 1 email service

For higher volume:
- Upgrade to EmailJS paid plan ($15/month = 5,000 emails)
- Or use Supabase Edge Functions with SendGrid/Resend

## 🎨 Customizing Email Template

### Professional Template Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563EB; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .footer { padding: 10px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛣️ Solapur Road Rescuer</h1>
    </div>
    <div class="content">
      <p>Hello {{to_name}},</p>
      <p>{{message}}</p>
      <p>You can track your report status at: 
        <a href="http://localhost:8082/track">Track Report</a>
      </p>
    </div>
    <div class="footer">
      <p>Solapur Municipal Corporation - Road Maintenance Department</p>
      <p>This is an automated notification. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
```

## 📱 SMS Notifications (Future)

SMS notifications require Twilio setup. For now:
- SMS sends console log only
- Add Twilio credentials to implement SMS
- Or use Supabase Edge Functions for SMS

## 🚀 Production Deployment

### For High-Volume Production

Consider upgrading to:

1. **Resend** (https://resend.com/)
   - 3,000 free emails/month
   - Better deliverability
   - React email templates

2. **SendGrid** (https://sendgrid.com/)
   - 100 emails/day free
   - Enterprise-grade
   - Analytics dashboard

3. **Supabase Edge Functions**
   - Deploy the included Edge Function
   - Set up SendGrid/Resend API keys
   - Fully server-side (more secure)

## 📝 Notification Flow

```
User Submits Report
        ↓
Report Saved to DB
        ↓
Confirmation Email Sent ← "Report received"
        ↓
Admin Changes Status
        ↓
Status Update Email Sent ← "Status changed to..."
```

## ✅ Checklist

Before going live, make sure:

- [ ] EmailJS account created
- [ ] Email service connected (Gmail/Outlook)
- [ ] Email template created
- [ ] .env file updated with IDs
- [ ] Dev server restarted
- [ ] Test email sent successfully
- [ ] Status change email received
- [ ] Template customized (optional)
- [ ] Production email service chosen (for launch)

## 🎉 You're Done!

Your citizens will now receive:
- ✅ Instant confirmation when they report issues
- ✅ Updates when work begins
- ✅ Notification when issues are resolved

No more "black hole" reports - full transparency! 🚀
