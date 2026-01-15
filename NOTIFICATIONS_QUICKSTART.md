# 🚀 Email Notifications - Quick Start

## ✅ What's Been Fixed

**Problem**: Citizens don't get email updates when status changes

**Solution**: Implemented EmailJS for instant email notifications

## 📧 Email Triggers

### 1. Report Submission ✅
- User submits a report with email
- **Instant confirmation email** sent
- Message: "Thank you! Your report {TICKET_ID} has been received..."

### 2. Status Changes ✅
- Admin changes status to "In Progress" or "Resolved"
- **Update email** sent to reporter
- Message: "Your report {TICKET_ID} is now being worked on..."

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Package (DONE ✅)
```bash
npm install @emailjs/browser
```

### Step 2: Create EmailJS Account

1. **Visit**: https://www.emailjs.com/
2. **Sign up** for free (200 emails/month)
3. **Add email service** (Gmail recommended)
4. **Create template** with these variables:
   - `to_email`
   - `to_name`
   - `message`
   - `subject`

5. **Get your credentials**:
   - Service ID (e.g., `service_abc123`)
   - Template ID (e.g., `template_xyz789`)
   - Public Key (e.g., `AbC123XyZ`)

### Step 3: Update .env File

Open `.env` and replace:
```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

With your actual EmailJS credentials.

### Step 4: Restart Server
```bash
# Press Ctrl+C to stop
npm run dev
```

## 🎯 Test It

1. **Submit a report** with your email → Check inbox for confirmation
2. **Change status** in admin panel → Reporter gets update email

## 📖 Full Documentation

- [EMAIL_SETUP.md](EMAIL_SETUP.md) - Complete setup guide
- [NOTIFICATIONS.md](NOTIFICATIONS.md) - Technical details

## 🔧 Works Without EmailJS Too!

If you don't configure EmailJS:
- Notifications still logged to console
- No errors or crashes
- Easy to add EmailJS later

## ⚠️ Important

After updating `.env`, **restart the dev server** for changes to take effect!

---

**Need help?** See [EMAIL_SETUP.md](EMAIL_SETUP.md) for troubleshooting.
