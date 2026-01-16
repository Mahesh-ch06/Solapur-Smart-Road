# Setup Instructions

## ✅ Features Added

### 1. AI Chatbot with Gemini AI
- **Location**: Bottom right corner on homepage
- **Features**:
  - Check report status by ticket ID (SRP-XXX)
  - Check reports by email address
  - AI-powered responses using Google Gemini
  - Submit queries via web3forms
  - Natural language understanding

### 2. Contact Us Page
- **Route**: `/contact`
- **Features**:
  - Web3forms integration
  - Contact information display
  - Query submission form
  - FAQ section
- **Access Key**: f01743b9-867e-4fb9-a16e-206b3bf69f10

### 3. Audit Logs in Database
- **Email view**: Click "View Email" button in Activity Log
- **Shows**: Sent emails with subject and message content

## 🔧 Database Setup Required

### Step 1: Create Audit Logs Table in Supabase

1. Go to your Supabase project: https://supabase.com
2. Click on **SQL Editor** in the left menu
3. Click **New Query**
4. Copy and paste the contents of `SUPABASE_AUDIT_LOGS_SCHEMA.sql`
5. Click **Run** to execute the SQL

This will create:
- `audit_logs` table with all necessary columns
- Indexes for better performance
- Row Level Security (RLS) policies
- Auto-cleanup function (optional)

### Step 2: Verify Table Creation

1. Go to **Table Editor** in Supabase
2. You should see `audit_logs` table
3. Columns should include:
   - id (UUID, primary key)
   - timestamp
   - admin_email
   - action
   - report_id
   - ticket_id
   - details
   - ip_address
   - email_metadata (JSONB)

## 🤖 API Keys Used

### Google Gemini AI
- **Key**: AIzaSyBVU4xnAE_q43CMqnlWxgd8zKZ7PQYOnYE
- **Usage**: Free tier (60 requests per minute)
- **Location**: `src/components/landing/AIChatbot.tsx`
- **Purpose**: Natural language processing for chatbot responses

### Web3Forms
- **Key**: f01743b9-867e-4fb9-a16e-206b3bf69f10
- **Usage**: Free tier (unlimited submissions)
- **Locations**: 
  - `src/components/landing/AIChatbot.tsx` (query submission)
  - `src/pages/ContactUs.tsx` (contact form)
- **Purpose**: Handle form submissions without backend

## 📝 How to Use

### Chatbot
1. Click the floating chat button on homepage
2. Try these commands:
   - "SRP-123" (check specific report)
   - "my reports for user@email.com" (check by email)
   - "How does this work?" (AI responds)
   - "I have a question" (opens contact form)

### Contact Page
1. Visit `/contact` or click "Contact Us" in footer
2. Fill out the form
3. Submissions go to your email via web3forms

### Activity Log Email View
1. Login to admin panel
2. Go to "Audit Logs"
3. Find logs with "SEND_CUSTOM_EMAIL" action
4. Click "View Email" button
5. See full email content sent to users

## 🚀 Deployed

**Production URL**: https://solapur-road-rescuer-main.vercel.app

All features are now live and functional!

## 📊 Next Steps

1. **Test the chatbot**: Ask questions and check report status
2. **Run SQL schema**: Execute the audit logs SQL in Supabase
3. **Verify email logging**: Send an email from admin panel, then check Activity Log
4. **Test contact form**: Submit a query and check your email

## 🔍 Testing Checklist

- [ ] Run SUPABASE_AUDIT_LOGS_SCHEMA.sql in Supabase
- [ ] Test chatbot with ticket ID
- [ ] Test chatbot with email address  
- [ ] Ask chatbot a general question (AI response)
- [ ] Submit query through chatbot form
- [ ] Visit /contact page and submit form
- [ ] Send email from admin panel
- [ ] View sent email in Activity Log
- [ ] Verify audit logs are saved in Supabase

Enjoy your enhanced Road Rescuer platform! 🎉
