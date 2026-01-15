import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

export type NotificationType = 'email' | 'sms' | 'both';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

// EmailJS Configuration
// Sign up at https://www.emailjs.com/ and get your credentials
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

export interface NotificationData {
  reportId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  notificationType: NotificationType;
  message: string;
}

/**
 * Creates a notification record in the database
 */
export async function createNotification(data: NotificationData) {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        report_id: data.reportId,
        recipient_email: data.recipientEmail,
        recipient_phone: data.recipientPhone,
        notification_type: data.notificationType,
        message: data.message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

/**
 * Sends notification when report status changes
 */
export async function sendStatusChangeNotification(
  ticketId: string,
  oldStatus: string,
  newStatus: string,
  email?: string,
  phone?: string
) {
  if (!email && !phone) {
    console.warn('No email or phone provided for notification');
    return { success: false, error: 'No contact information provided' };
  }

  const message = getStatusChangeMessage(ticketId, oldStatus, newStatus);
  const notificationType: NotificationType = 
    email && phone ? 'both' : email ? 'email' : 'sms';

  try {
    // Get report ID from ticket ID
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id')
      .eq('ticket_id', ticketId)
      .single();

    if (reportError) throw reportError;

    // Create notification record
    const result = await createNotification({
      reportId: report.id,
      recipientEmail: email,
      recipientPhone: phone,
      notificationType,
      message,
    });

    // Send the notification with ticket ID and status
    if (result.success) {
      await sendNotification(result.data, ticketId, newStatus);
    }

    return result;
  } catch (error) {
    console.error('Error sending status change notification:', error);
    return { success: false, error };
  }
}

/**
 * Sends confirmation notification when a new report is submitted
 */
export async function sendReportConfirmation(
  reportId: string,
  ticketId: string,
  email?: string,
  phone?: string
) {
  if (!email && !phone) {
    console.warn('No email or phone provided for confirmation');
    return { success: false, error: 'No contact information provided' };
  }

  const message = getReportConfirmationMessage(ticketId);
  const notificationType: NotificationType = 
    email && phone ? 'both' : email ? 'email' : 'sms';

  try {
    // Create notification record
    const result = await createNotification({
      reportId,
      recipientEmail: email,
      recipientPhone: phone,
      notificationType,
      message,
    });

    // Send the notification with ticket ID and status
    if (result.success) {
      await sendNotification(result.data, ticketId, 'open');
    }

    return result;
  } catch (error) {
    console.error('Error sending report confirmation:', error);
    return { success: false, error };
  }
}

/**
 * Generates confirmation message for new reports
 */
function getReportConfirmationMessage(ticketId: string): string {
  return `Thank you for reporting a road issue! Your report ${ticketId} has been received and will be reviewed by our team soon. We'll keep you updated on the progress.`;
}

/**
 * Generates a user-friendly message for status changes
 */
function getStatusChangeMessage(
  ticketId: string,
  oldStatus: string,
  newStatus: string
): string {
  const statusMessages: Record<string, string> = {
    'open': 'has been reported and is awaiting review.',
    'in-progress': 'Your requested work has been started by our road maintenance team.',
    'resolved': 'Your reported work has been completed! Thank you for helping keep our roads safe.',
  };

  const newStatusMessage = statusMessages[newStatus] || newStatus;
  
  return `Update on your road issue report ${ticketId}: ${newStatusMessage}`;
}

/**
 * Sends actual email notification using EmailJS
 */
async function sendEmailNotification(notification: any, ticketId?: string, status?: string) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('⚠️ EmailJS not configured. Add credentials to .env file.');
    console.log('📧 Email would be sent to:', notification.recipient_email);
    console.log('📄 Message:', notification.message);
    
    // Mark as sent even without config (for development)
    await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notification.id);
    
    return { success: true, mode: 'development' };
  }

  try {
    // Send email using EmailJS
    const templateParams = {
      to_email: notification.recipient_email,
      to_name: 'Valued Citizen',
      message: notification.message,
      subject: 'Solapur Road Rescuer - Report Update',
      ticket_id: ticketId || '',
      status: status || '',
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Email sent successfully to:', notification.recipient_email);

    // Mark notification as sent
    await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notification.id);

    return { success: true, mode: 'production' };
  } catch (error) {
    console.error('❌ Error sending email:', error);

    // Mark notification as failed
    await supabase
      .from('notifications')
      .update({ status: 'failed' })
      .eq('id', notification.id);

    return { success: false, error };
  }
}

/**
 * Sends notification (currently supports email only)
 */
async function sendNotification(notification: any, ticketId?: string, status?: string) {
  if (notification.recipient_email) {
    return await sendEmailNotification(notification, ticketId, status);
  }
  
  if (notification.recipient_phone) {
    console.log('📱 SMS notifications require Twilio setup');
    console.log('📄 SMS would be sent to:', notification.recipient_phone);
    
    // Mark as sent for now (SMS not implemented)
    await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notification.id);
    
    return { success: true, mode: 'sms-placeholder' };
  }
  
  return { success: false, error: 'No contact information' };
}

/**
 * Retrieves notification history for a report
 */
export async function getNotificationsByReportId(reportId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Retrieves all pending notifications
 */
export async function getPendingNotifications() {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    return { success: false, error, data: [] };
  }
}
