# Quick Start Guide - Supabase Integration

## 🎉 Integration Complete!

Your Solapur Road Rescuer app now has full Supabase integration with email/SMS notifications!

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Database (5 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com/project/ugxzmisewrugyefjpfcs)
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste and click **RUN**
6. You should see: "Success. No rows returned"

### Step 2: Start the App

```bash
npm run dev
```

The app will start at http://localhost:5173

### Step 3: Test It!

1. **Submit a test report**:
   - Go to http://localhost:5173/report
   - Set a location on the map
   - Fill in description
   - Upload a photo (optional)
   - **Important**: On the review step, add your email/phone
   - Submit

2. **Update the status**:
   - Go to http://localhost:5173/admin/orders
   - Find your report
   - Change status from "Open" to "In Progress"
   
3. **Check notifications**:
   - Open browser console (F12)
   - Look for "📧 Notification would be sent"
   - Go to [Supabase Dashboard](https://app.supabase.com/project/ugxzmisewrugyefjpfcs) → Table Editor → notifications
   - See your notification record!

## ✅ What's Working Now

- ✅ Reports sync to Supabase database
- ✅ Contact info (email/phone) captured
- ✅ Status updates trigger notifications
- ✅ Notifications logged to database
- ✅ Full notification history tracked

## 🔄 Current Mode: Development

The app is in **development mode** which means:
- Notifications are **logged** to console and database
- Emails/SMS are **simulated** (not actually sent)
- Perfect for testing without external services

## 📊 View Your Data

Check your Supabase dashboard to see:
- **Reports table**: All submitted reports
- **Notifications table**: Notification history
- **Table Editor**: Browse and edit data
- **Database logs**: SQL queries and triggers

Dashboard: https://app.supabase.com/project/ugxzmisewrugyefjpfcs

## 🎯 What Happens When Status Changes

```
User submits report with email
         ↓
Admin updates status
         ↓
Database trigger creates notification
         ↓
Notification service processes it
         ↓
[DEV] Logs to console & marks as sent
[PROD] Sends actual email/SMS
```

## 📝 Notification Messages

Based on status changes:

- **→ In Progress**: "Your report SRP-XXX is now being worked on by our road maintenance team"
- **→ Resolved**: "Your report SRP-XXX has been successfully fixed!"

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check .env file exists
cat .env

# Should show:
# VITE_SUPABASE_URL=https://ugxzmisewrugyefjpfcs.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Notifications Not Appearing
1. Check browser console for errors
2. Verify you entered email/phone when submitting report
3. Check Supabase → Table Editor → notifications
4. Verify database trigger is active (run schema.sql again)

### App Won't Start
```bash
# Reinstall dependencies
npm install

# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

## 📚 Documentation

- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**: Detailed setup instructions
- **[NOTIFICATIONS.md](NOTIFICATIONS.md)**: Complete notification system guide
- **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)**: Technical overview

## 🚀 Going to Production

Want to send **actual** emails and SMS? See:
- [NOTIFICATIONS.md](NOTIFICATIONS.md#production-setup) for full instructions
- Set up SendGrid for emails (100 free/day)
- Set up Twilio for SMS (pay as you go)
- Deploy Edge Function using Supabase CLI

## 💡 Pro Tips

1. **Test with your own email/phone first** to see how it works
2. **Use multiple browsers** to test user and admin views simultaneously
3. **Check the notifications table** to debug delivery issues
4. **Start with email only** - easier to set up than SMS

## 🎊 You're All Set!

Everything is configured and ready to go. Just:
1. Run the database schema
2. Start the app
3. Submit a report with your contact info
4. Update the status and see it work!

**Happy coding! 🚀**

---

Questions? Check the documentation files or Supabase Dashboard for more details.
