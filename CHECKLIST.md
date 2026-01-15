# ✅ Supabase Integration Checklist

Use this checklist to verify your integration is complete and working.

## 📋 Setup Checklist

### Environment Setup
- [x] `.env` file created with Supabase credentials
- [x] `@supabase/supabase-js` package installed
- [x] Supabase client configured in `src/lib/supabase.ts`

### Database Setup (DO THIS FIRST!)
- [ ] Go to Supabase Dashboard SQL Editor
- [ ] Copy contents of `supabase/schema.sql`
- [ ] Run the SQL script
- [ ] Verify `reports` table exists
- [ ] Verify `notifications` table exists
- [ ] Verify database trigger created

### Application Testing
- [ ] Start app with `npm run dev`
- [ ] App loads without errors
- [ ] No TypeScript errors in console

### Feature Testing

#### 1. Report Submission
- [ ] Navigate to `/report` page
- [ ] Can set location on map
- [ ] Can enter description
- [ ] Can select severity
- [ ] Can upload photo
- [ ] **Can enter email address** (on review step)
- [ ] **Can enter phone number** (on review step)
- [ ] Submit button works
- [ ] Ticket ID displayed after submission
- [ ] Check Supabase Dashboard → reports table → report exists

#### 2. Admin Panel
- [ ] Navigate to `/admin/orders`
- [ ] Can see submitted reports
- [ ] Can filter reports
- [ ] Can search reports
- [ ] Can change report status
- [ ] Toast notification shows when status updated
- [ ] Toast mentions "Notification sent"

#### 3. Notifications
- [ ] Open browser console (F12) before testing
- [ ] Submit report with your email/phone
- [ ] Update status in admin panel
- [ ] Check console for "📧 Notification would be sent"
- [ ] Check Supabase Dashboard → notifications table
- [ ] Notification record exists with correct details
- [ ] Notification status is "sent"
- [ ] Message text is correct

### Data Verification

#### Supabase Reports Table
- [ ] id (UUID)
- [ ] ticket_id (e.g., SRP-123)
- [ ] latitude
- [ ] longitude
- [ ] description
- [ ] severity (low/medium/high)
- [ ] status (open/in-progress/resolved)
- [ ] user_email (your email if provided)
- [ ] user_phone (your phone if provided)
- [ ] created_at
- [ ] resolved_at (null unless resolved)

#### Supabase Notifications Table
- [ ] id (UUID)
- [ ] report_id (matches report)
- [ ] recipient_email (your email)
- [ ] recipient_phone (your phone)
- [ ] notification_type (email/sms/both)
- [ ] status (sent)
- [ ] message (contains ticket ID and status)
- [ ] sent_at (timestamp)
- [ ] created_at (timestamp)

## 🔍 Troubleshooting

### If Database Tables Don't Exist
```
Problem: Tables not showing in Supabase
Solution: 
1. Go to Supabase Dashboard → SQL Editor
2. Copy ALL contents of supabase/schema.sql
3. Click "New Query"
4. Paste and run
5. Refresh Table Editor
```

### If Notifications Aren't Created
```
Problem: Notification table is empty after status update
Check:
1. Report has user_email or user_phone
2. Status was actually changed (not same status)
3. Database trigger exists: 
   - Go to Database → Functions
   - Look for notify_on_status_change
4. Run schema.sql again if trigger missing
```

### If App Shows Errors
```
Problem: Console shows Supabase errors
Check:
1. .env file exists in project root
2. Environment variables start with VITE_
3. Restart dev server after adding .env
4. Clear browser cache (Ctrl+Shift+R)
```

## 🎯 Success Criteria

You should be able to:
1. ✅ Submit a report with email/phone
2. ✅ See report in Supabase dashboard
3. ✅ Update status in admin panel
4. ✅ See notification in console logs
5. ✅ See notification record in Supabase
6. ✅ Verify notification status is "sent"

## 📊 Quick Database Check

Run this in Supabase SQL Editor to see your data:

```sql
-- View all reports
SELECT ticket_id, status, user_email, created_at 
FROM reports 
ORDER BY created_at DESC 
LIMIT 5;

-- View all notifications
SELECT 
  n.notification_type,
  n.status,
  n.message,
  r.ticket_id,
  n.created_at
FROM notifications n
JOIN reports r ON n.report_id = r.id
ORDER BY n.created_at DESC
LIMIT 5;

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_report_status_change';
```

## 🚀 Next Steps After Checklist

Once everything is checked:
1. Read [NOTIFICATIONS.md](NOTIFICATIONS.md) for production setup
2. Set up SendGrid for actual emails (optional)
3. Set up Twilio for actual SMS (optional)
4. Deploy Edge Function for real notifications
5. Test with real email/SMS services

## 💡 Quick Tips

- **Test frequently**: Submit reports and update status often
- **Use your own contacts**: Test with your email/phone first
- **Check both systems**: Browser console AND Supabase dashboard
- **Start simple**: Test one report at a time initially
- **Save ticket IDs**: Keep track of test reports for easy lookup

## 🎊 Completion

When all items are checked, you have:
- ✅ Full Supabase integration
- ✅ Working notification system
- ✅ Report tracking
- ✅ Admin functionality
- ✅ Ready for production deployment

**Congratulations! Your integration is complete! 🎉**

---

Last Updated: January 14, 2026
