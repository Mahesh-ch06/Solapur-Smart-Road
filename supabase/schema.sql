-- Solapur Road Rescuer Database Schema

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create reports table
create table if not exists public.reports (
  id uuid default uuid_generate_v4() primary key,
  ticket_id text unique not null,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  description text not null,
  severity text check (severity in ('low', 'medium', 'high')) not null,
  photo text,
  status text check (status in ('open', 'in-progress', 'resolved', 'rejected')) default 'open' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  address text,
  user_email text,
  user_phone text
);

-- Create notifications table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  report_id uuid references public.reports(id) on delete cascade not null,
  recipient_email text,
  recipient_phone text,
  notification_type text check (notification_type in ('email', 'sms', 'both')) not null,
  status text check (status in ('pending', 'sent', 'failed')) default 'pending' not null,
  message text not null,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_reports_ticket_id on public.reports(ticket_id);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_created_at on public.reports(created_at);
create index if not exists idx_notifications_report_id on public.notifications(report_id);
create index if not exists idx_notifications_status on public.notifications(status);

-- Enable Row Level Security (RLS)
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

-- Create policies for reports table (allow all operations for now - adjust as needed)
create policy "Allow public read access to reports"
  on public.reports for select
  using (true);

create policy "Allow public insert access to reports"
  on public.reports for insert
  with check (true);

create policy "Allow public update access to reports"
  on public.reports for update
  using (true);

-- Create policies for notifications table
create policy "Allow public read access to notifications"
  on public.notifications for select
  using (true);

create policy "Allow public insert access to notifications"
  on public.notifications for insert
  with check (true);

create policy "Allow public update access to notifications"
  on public.notifications for update
  using (true);

-- Create function to send notifications on status change
create or replace function notify_on_status_change()
returns trigger as $$
begin
  -- Only send notification if status has changed
  if (TG_OP = 'UPDATE' and OLD.status is distinct from NEW.status) then
    -- Insert notification record
    insert into public.notifications (
      report_id,
      recipient_email,
      recipient_phone,
      notification_type,
      message,
      status
    ) values (
      NEW.id,
      NEW.user_email,
      NEW.user_phone,
      case 
        when NEW.user_email is not null and NEW.user_phone is not null then 'both'
        when NEW.user_email is not null then 'email'
        when NEW.user_phone is not null then 'sms'
        else 'email'
      end,
      format(
        'Your report %s has been updated. Status changed from "%s" to "%s".',
        NEW.ticket_id,
        OLD.status,
        NEW.status
      ),
      'pending'
    );
  end if;
  
  return NEW;
end;
$$ language plpgsql;

-- Create trigger for status change notifications
drop trigger if exists on_report_status_change on public.reports;
create trigger on_report_status_change
  after update on public.reports
  for each row
  execute function notify_on_status_change();

-- Create function to process pending notifications (to be called by edge function or scheduled job)
create or replace function process_pending_notifications()
returns void as $$
declare
  notification_record record;
begin
  -- This is a placeholder - actual email/SMS sending would be done via Edge Functions
  -- This function marks notifications as ready for processing
  for notification_record in 
    select * from public.notifications 
    where status = 'pending'
    order by created_at
    limit 100
  loop
    -- In a real implementation, this would call an edge function or external service
    -- For now, we'll just mark them as sent
    update public.notifications
    set status = 'sent',
        sent_at = now()
    where id = notification_record.id;
  end loop;
end;
$$ language plpgsql;
