import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  reportId?: string;
  ticketId?: string;
  details: string;
  ipAddress?: string;
  emailMetadata?: {
    to: string;
    subject: string;
    message: string;
  };
}

interface AuditStore {
  logs: AuditLog[];
  loading: boolean;
  initialized: boolean;
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => Promise<void>;
  loadLogs: () => Promise<void>;
  getLogs: (limit?: number) => AuditLog[];
  getLogsByReport: (reportId: string) => AuditLog[];
  clearOldLogs: (daysToKeep: number) => void;
}

export const useAuditStore = create<AuditStore>()((set, get) => ({
  logs: [],
  loading: false,
  initialized: false,

  // Load logs from Supabase
  loadLogs: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const formattedLogs: AuditLog[] = data ? data.map((log: any) => ({
        id: log.id,
        timestamp: log.timestamp,
        adminEmail: log.admin_email,
        action: log.action,
        reportId: log.report_id || undefined,
        ticketId: log.ticket_id || undefined,
        details: log.details,
        ipAddress: log.ip_address || undefined,
        emailMetadata: log.email_metadata || undefined,
      })) : [];

      set({ logs: formattedLogs, initialized: true, loading: false });
    } catch (error) {
      set({ loading: false, initialized: true });
    }
  },

  addLog: async (log) => {
    const newLog: AuditLog = {
      ...log,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    // Add to local state immediately
    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 1000),
    }));

    // Sync to Supabase in background
    try {
      await supabase
        .from('audit_logs')
        .insert({
          admin_email: log.adminEmail,
          action: log.action,
          report_id: log.reportId || null,
          ticket_id: log.ticketId || null,
          details: log.details,
          ip_address: log.ipAddress || null,
          email_metadata: log.emailMetadata || null,
        });
    } catch (error) {
      // Silently fail - log is still in local state
    }
  },

  getLogs: (limit = 100) => {
    return get().logs.slice(0, limit);
  },

  getLogsByReport: (reportId) => {
    return get().logs.filter((log) => log.reportId === reportId);
  },

  clearOldLogs: (daysToKeep) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    set((state) => ({
      logs: state.logs.filter(
        (log) => new Date(log.timestamp) > cutoffDate
      ),
    }));
  },
}));

// Helper function to log actions
export const logAction = (
  action: string,
  details: string,
  reportId?: string,
  ticketId?: string,
  emailMetadata?: { to: string; subject: string; message: string }
) => {
  const { addLog } = useAuditStore.getState();
  
  addLog({
    adminEmail: 'maheshch1094@gmail.com', // Get from auth store in production
    action,
    details,
    reportId,
    ticketId,
    ipAddress: 'localhost', // In production, get real IP
    emailMetadata,
  });
};
