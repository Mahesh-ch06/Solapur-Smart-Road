import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string;
          ticket_id: string;
          latitude: number;
          longitude: number;
          description: string;
          severity: 'low' | 'medium' | 'high';
          photo: string | null;
          status: 'open' | 'in-progress' | 'resolved';
          created_at: string;
          resolved_at: string | null;
          address: string | null;
          user_email: string | null;
          user_phone: string | null;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          latitude: number;
          longitude: number;
          description: string;
          severity: 'low' | 'medium' | 'high';
          photo?: string | null;
          status?: 'open' | 'in-progress' | 'resolved';
          created_at?: string;
          resolved_at?: string | null;
          address?: string | null;
          user_email?: string | null;
          user_phone?: string | null;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          latitude?: number;
          longitude?: number;
          description?: string;
          severity?: 'low' | 'medium' | 'high';
          photo?: string | null;
          status?: 'open' | 'in-progress' | 'resolved';
          created_at?: string;
          resolved_at?: string | null;
          address?: string | null;
          user_email?: string | null;
          user_phone?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          report_id: string;
          recipient_email: string | null;
          recipient_phone: string | null;
          notification_type: 'email' | 'sms' | 'both';
          status: 'pending' | 'sent' | 'failed';
          message: string;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          notification_type: 'email' | 'sms' | 'both';
          status?: 'pending' | 'sent' | 'failed';
          message: string;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          notification_type?: 'email' | 'sms' | 'both';
          status?: 'pending' | 'sent' | 'failed';
          message?: string;
          sent_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
