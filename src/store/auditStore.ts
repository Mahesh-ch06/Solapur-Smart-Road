import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  reportId?: string;
  ticketId?: string;
  details: string;
  ipAddress?: string;
}

interface AuditStore {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getLogs: (limit?: number) => AuditLog[];
  getLogsByReport: (reportId: string) => AuditLog[];
  clearOldLogs: (daysToKeep: number) => void;
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (log) => {
        const newLog: AuditLog = {
          ...log,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 1000), // Keep only last 1000 logs
        }));
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
    }),
    {
      name: 'audit-logs',
    }
  )
);

// Helper function to log actions
export const logAction = (
  action: string,
  details: string,
  reportId?: string,
  ticketId?: string
) => {
  const { addLog } = useAuditStore.getState();
  
  addLog({
    adminEmail: 'maheshch1094@gmail.com', // Get from auth store in production
    action,
    details,
    reportId,
    ticketId,
    ipAddress: 'localhost', // In production, get real IP
  });
};
