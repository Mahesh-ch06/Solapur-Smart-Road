// Supabase Edge Function to send email/SMS notifications
// Deploy this using: npx supabase functions deploy send-notification
// @ts-ignore - Deno imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore - Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore - Deno.env
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
// @ts-ignore - Deno.env
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// @ts-ignore - Deno.env
const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
// @ts-ignore - Deno.env
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
// @ts-ignore - Deno.env
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
// @ts-ignore - Deno.env
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

interface Notification {
  id: string
  report_id: string
  recipient_email: string | null
  recipient_phone: string | null
  notification_type: 'email' | 'sms' | 'both'
  message: string
}

serve(async (req: Request) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get notification details from request
    const { notificationId } = await req.json()
    
    // Fetch notification from database
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single()
    
    if (fetchError) throw fetchError
    
    const result = {
      emailSent: false,
      smsSent: false,
      errors: [] as string[]
    }
    
    // Send email if needed
    if (
      notification.recipient_email && 
      (notification.notification_type === 'email' || notification.notification_type === 'both')
    ) {
      try {
        await sendEmail(notification)
        result.emailSent = true
      } catch (error) {
        const err = error as Error
        result.errors.push(`Email error: ${err.message}`)
      }
    }
    
    // Send SMS if needed
    if (
      notification.recipient_phone && 
      (notification.notification_type === 'sms' || notification.notification_type === 'both')
    ) {
      try {
        await sendSMS(notification)
        result.smsSent = true
      } catch (error) {
        const err = error as Error
        result.errors.push(`SMS error: ${err.message}`)
      }
    }
    
    // Update notification status
    const status = (result.emailSent || result.smsSent) ? 'sent' : 'failed'
    await supabase
      .from('notifications')
      .update({ 
        status, 
        sent_at: status === 'sent' ? new Date().toISOString() : null 
      })
      .eq('id', notificationId)
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const err = error as Error
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function sendEmail(notification: Notification) {
  if (!sendgridApiKey) {
    throw new Error('SendGrid API key not configured')
  }
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendgridApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: notification.recipient_email }],
        subject: 'Solapur Road Rescuer - Report Status Update'
      }],
      from: { 
        email: 'noreply@solapurroadrescuer.com',
        name: 'Solapur Road Rescuer'
      },
      content: [{
        type: 'text/html',
        value: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #2563eb; margin-bottom: 20px;">Report Status Update</h1>
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  ${notification.message}
                </p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                  <p style="font-size: 14px; color: #666;">
                    Thank you for helping keep Solapur's roads safe!
                  </p>
                  <p style="font-size: 12px; color: #999; margin-top: 10px;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      }]
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid error: ${error}`)
  }
}

async function sendSMS(notification: Notification) {
  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    throw new Error('Twilio credentials not configured')
  }
  
  const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: notification.recipient_phone!,
        From: twilioPhoneNumber,
        Body: notification.message
      })
    }
  )
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twilio error: ${error}`)
  }
}
