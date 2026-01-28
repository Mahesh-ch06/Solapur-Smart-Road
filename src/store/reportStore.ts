import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { sendStatusChangeNotification, sendReportConfirmation } from '../services/notificationService';

export type ReportStatus = 'open' | 'in-progress' | 'resolved' | 'rejected';
export type Severity = 'low' | 'medium' | 'high';

export interface Report {
  id: string;
  ticketId: string;
  latitude: number;
  longitude: number;
  description: string;
  severity: Severity;
  photo?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  address?: string;
  userEmail?: string;
  userPhone?: string;
  voiceNoteDuration?: number;
  voiceNoteConfirmed?: boolean;
}

interface ReportStore {
  reports: Report[];
  loading: boolean;
  initialized: boolean;
  addReport: (report: Omit<Report, 'id' | 'ticketId' | 'status' | 'createdAt'>) => Promise<string>;
  updateStatus: (id: string, status: ReportStatus) => Promise<void>;
  getReportById: (id: string) => Report | undefined;
  getReportByTicketId: (ticketId: string) => Report | undefined;
  getStats: () => { total: number; fixedToday: number; open: number; inProgress: number };
  loadReports: () => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
}

// Generate unique ticket ID
const generateTicketId = () => {
  const num = Math.floor(Math.random() * 900) + 100;
  return `SRP-${num}`;
};

// Helper function to convert Supabase data to Report format
const formatReport = (data: any): Report => ({
  id: data.id,
  ticketId: data.ticket_id,
  latitude: data.latitude,
  longitude: data.longitude,
  description: data.description,
  severity: data.severity as Severity,
  photo: data.photo || undefined,
  status: data.status as ReportStatus,
  createdAt: data.created_at,
  resolvedAt: data.resolved_at || undefined,
  address: data.address || undefined,
  userEmail: data.user_email || undefined,
  userPhone: data.user_phone || undefined,
  voiceNoteDuration: data.voice_note_duration || undefined,
  voiceNoteConfirmed: data.voice_note_confirmed || undefined,
});

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  loading: false,
  initialized: false,

  // Load all reports from Supabase
  loadReports: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports = data ? data.map(formatReport) : [];
      set({ reports: formattedReports, initialized: true, loading: false });
    } catch (error) {
      set({ loading: false, initialized: true });
    }
  },

  // Add new report to Supabase
  addReport: async (reportData) => {
    const ticketId = generateTicketId();

    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          ticket_id: ticketId,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          description: reportData.description,
          severity: reportData.severity,
          photo: reportData.photo || null,
          status: 'open',
          created_at: new Date().toISOString(),
          address: reportData.address || null,
          user_email: reportData.userEmail || null,
          user_phone: reportData.userPhone || null,
          voice_note_duration: reportData.voiceNoteDuration || null,
          voice_note_confirmed: reportData.voiceNoteConfirmed || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newReport = formatReport(data);
      set((state) => ({ reports: [newReport, ...state.reports] }));

      // Send confirmation notification to the user
      if (reportData.userEmail || reportData.userPhone) {
        await sendReportConfirmation(
          data.id,
          ticketId,
          reportData.userEmail,
          reportData.userPhone
        );
      }

      return ticketId;
    } catch (error) {
      throw error;
    }
  },

  // Update report status in Supabase
  updateStatus: async (id, status) => {
    const report = get().reports.find((r) => r.id === id);
    if (!report) {
      const error = new Error(`Report not found: ${id}`);
      throw error;
    }

    const oldStatus = report.status;

    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        reports: state.reports.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                resolvedAt: status === 'resolved' ? new Date().toISOString() : r.resolvedAt,
              }
            : r
        ),
      }));

      // Send notification if status changed
      if (oldStatus !== status) {
        await sendStatusChangeNotification(
          report.ticketId,
          oldStatus,
          status,
          report.userEmail,
          report.userPhone
        );
      }
    } catch (error) {
      throw error; // Re-throw so calling code can handle it
    }
  },

  // Delete report from Supabase
  deleteReport: async (id) => {
    try {
      const { error } = await supabase.from('reports').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        reports: state.reports.filter((r) => r.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  getReportById: (id) => get().reports.find((r) => r.id === id),

  getReportByTicketId: (ticketId) => get().reports.find((r) => r.ticketId === ticketId),

  getStats: () => {
    const reports = get().reports;
    const today = new Date().toDateString();
    const fixedToday = reports.filter(
      (r) => r.resolvedAt && new Date(r.resolvedAt).toDateString() === today
    ).length;

    return {
      total: reports.length,
      fixedToday,
      open: reports.filter((r) => r.status === 'open').length,
      inProgress: reports.filter((r) => r.status === 'in-progress').length,
    };
  },
}));
