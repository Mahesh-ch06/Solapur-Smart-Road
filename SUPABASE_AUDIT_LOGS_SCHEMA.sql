-- Supabase SQL Schema for Activity Logs (Audit Logs)
-- Run this in your Supabase SQL Editor

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  report_id UUID,
  ticket_id TEXT,
  details TEXT NOT NULL,
  ip_address TEXT,
  email_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_admin_email ON audit_logs(admin_email);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_ticket_id ON audit_logs(ticket_id);
CREATE INDEX idx_audit_logs_report_id ON audit_logs(report_id);

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: Admins can view all logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (true);

-- Create policy: System can insert logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Prevent deletions (audit trail integrity)
CREATE POLICY "Prevent audit log deletion"
  ON audit_logs
  FOR DELETE
  USING (false);

-- Optional: Create a function to automatically clean old logs (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup monthly
-- (Requires pg_cron extension - enable in Supabase dashboard)
-- SELECT cron.schedule('cleanup-audit-logs', '0 0 1 * *', 'SELECT cleanup_old_audit_logs()');

COMMENT ON TABLE audit_logs IS 'Stores all admin activity and system audit logs';
COMMENT ON COLUMN audit_logs.email_metadata IS 'JSON object containing email details: {to, subject, message}';
