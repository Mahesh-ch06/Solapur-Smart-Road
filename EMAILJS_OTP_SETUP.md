# EmailJS OTP Template Setup Guide

## Step 1: Login to EmailJS

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Login with your account

## Step 2: Create a New Email Template

1. Click on **Email Templates** in the left sidebar
2. Click **Create New Template** button
3. Set **Template Name**: `OTP Verification`
4. Set **Template ID**: `template_otp_verify` (This MUST match the ID in the code)

## Step 3: Configure Template Settings

### **CRITICAL: Set Recipient Email** 

In the template settings, you MUST configure the "To email" field:

1. Look for the **Settings** section in your template
2. Find the **"To email"** field
3. Enter: `{{to_email}}` (with double curly braces)
4. This tells EmailJS to send the email to the address passed from your app

**Without this step, you'll get "recipients address is empty" error!**

### Email Subject:
```
Verify Your Email - {{app_name}}
```

### Email Body (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 40px 30px;
        }
        .otp-box {
            background-color: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            margin: 10px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Support Ticket Created</h1>
            <p>{{app_name}}</p>
        </div>
        
        <div class="content">
            <h2>Hello {{to_name}},</h2>
            
            <p>Thank you for contacting Solapur Road Rescuer! We have successfully received your support query and our team is reviewing it.</p>
            
            <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your Ticket Number</p>
                <div class="otp-code">{{otp_code}}</div>
                <p style="margin: 0; color: #666; font-size: 12px;">Reference this number for follow-ups</p>
            </div>
            
            <p><strong>What happens next?</strong><br>
            Our support team will review your query and get back to you as soon as possible. Most queries are answered within 24-48 hours.</p>
            
            <div class="warning">
                <strong>📋 Important Information:</strong><br>
                • Keep your ticket number for reference<br>
                • You will receive updates via email<br>
                • Response time: 24-48 hours (business days)<br>
                • For urgent issues, please mention "URGENT" in your message
            </div>
            
            <p>We appreciate your patience and are committed to helping make Solapur's roads safer for everyone.</p>
            
            <p style="margin-top: 30px;">
                Drive safe,<br>
                <strong>The Solapur Road Rescuer Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2026 Solapur Road Rescuer. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

### Template Variables

Make sure these variables are correctly mapped in EmailJS:

- `{{to_email}}` - **Recipient's email address (MUST be set in "To email" field in template settings)**
- `{{to_name}}` - Recipient's name (derived from email)
- `{{otp_code}}` - 6-digit verification code
- `{{app_name}}` - Application name (Solapur Road Rescuer)

## Step 4: Configure Template Fields (IMPORTANT!)

### In the EmailJS Template Editor:

1. **To email field**: Enter `{{to_email}}` 
   - This is the most important field!
   - Without this, you'll get "recipients address is empty" error

2. **From name** (optional): `Solapur Road Rescuer`

3. **Reply to** (optional): `noreply@solapur-road-rescuer.com` or leave as default

4. **Subject**: `Verify Your Email - {{app_name}}`

## Step 5: Test the Template

1. Click on **Test it** button in EmailJS template editor
2. Fill in test values:
   - `to_email`: your-test-email@example.com
   - `to_name`: Test User
   - `otp_code`: 123456
   - `app_name`: Solapur Road Rescuer
3. Click **Send Test Email**
4. Check your inbox to verify the email looks correct

## Step 6: Save and Activate

1. Click **Save** button
2. Make sure the template is **Active** (toggle switch should be ON)

## Step 7: Verify Environment Variables

Make sure your `.env` file has these values:

```env
VITE_EMAILJS_SERVICE_ID=service_r6i1e2r
VITE_EMAILJS_PUBLIC_KEY=oB-mfKG_R1QOJUEIT
```

## Troubleshooting

### ❌ Error: "The recipients address is empty"

**This is the most common error!** It means the "To email" field in your template is not configured.

**Fix:**
1. Go to EmailJS Dashboard → Email Templates
2. Click on your `template_otp_verify` template
3. Look for the **Settings** or **Template Settings** section
4. Find the **"To email"** field
5. Enter exactly: `{{to_email}}`
6. Click **Save**
7. Try sending OTP again

### OTP Not Received?

1. **Check Spam/Junk folder** - EmailJS emails might be filtered
2. **Verify template ID** - Must be exactly `template_otp_verify`
3. **Check EmailJS quota** - Free tier has 200 emails/month
4. **Console errors** - Check browser console for error messages
5. **EmailJS dashboard** - Check "Email History" for delivery status

### Template Not Working?

1. Go to EmailJS Dashboard → Email Templates
2. Click on your OTP template
3. Verify all template variables are using double curly braces: `{{variable_name}}`
4. Test the template using EmailJS test feature

### Email Formatting Issues?

- Make sure HTML is properly formatted
- Test in different email clients (Gmail, Outlook, etc.)
- Check that CSS styles are inline or in `<style>` tags

## Production Checklist

- [ ] Template ID is `template_otp_verify`
- [ ] All template variables are correctly set
- [ ] Test email received successfully
- [ ] Email renders correctly in Gmail/Outlook
- [ ] Environment variables are configured
- [ ] EmailJS service is active
- [ ] Monthly email quota is sufficient

## Alternative: Simple Text Template

If you prefer a simple text-based email instead of HTML:

### Subject:
```
Your OTP Code: {{otp_code}}
```

### Body:
```
Hello {{to_name}},

Your verification code for Solapur Road Rescuer is:

{{otp_code}}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Solapur Road Rescuer Team
```

## Next Steps

After setting up the template:

1. Test the OTP flow in your application
2. Verify emails are being sent correctly
3. Check that OTP verification works
4. Monitor EmailJS quota usage
5. Consider upgrading EmailJS plan if needed (for higher volume)

## Support

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: https://www.emailjs.com/support/
- Project Issues: Contact your development team
