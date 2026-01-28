-- Support Tickets Schema for Contact Us queries

-- Create support_tickets table
create table if not exists public.support_tickets (
  id uuid default uuid_generate_v4() primary key,
  ticket_number text unique not null,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text check (status in ('new', 'in-progress', 'resolved', 'closed')) default 'new' not null,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium' not null,
  admin_reply text,
  admin_id text,
  replied_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_support_tickets_ticket_number on public.support_tickets(ticket_number);
create index if not exists idx_support_tickets_status on public.support_tickets(status);
create index if not exists idx_support_tickets_email on public.support_tickets(email);
create index if not exists idx_support_tickets_created_at on public.support_tickets(created_at);

-- Enable Row Level Security (RLS)
alter table public.support_tickets enable row level security;

-- Create policies for support_tickets table
create policy "Allow public read access to support_tickets"
  on public.support_tickets for select
  using (true);

create policy "Allow public insert access to support_tickets"
  on public.support_tickets for insert
  with check (true);

create policy "Allow public update access to support_tickets"
  on public.support_tickets for update
  using (true);

-- Function to auto-update updated_at timestamp
create or replace function update_support_ticket_updated_at()
returns trigger as $$
begin
  NEW.updated_at = timezone('utc'::text, now());
  return NEW;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
drop trigger if exists on_support_ticket_update on public.support_tickets;
create trigger on_support_ticket_update
  before update on public.support_tickets
  for each row
  execute function update_support_ticket_updated_at();

-- Function to generate ticket number (SUP-XXXXXX format)
create or replace function generate_ticket_number()
returns text as $$
declare
  ticket_num text;
  exists_check boolean;
begin
  loop
    -- Generate a random 6-digit number
    ticket_num := 'SUP-' || lpad(floor(random() * 999999)::text, 6, '0');
    
    -- Check if it already exists
    select exists(select 1 from public.support_tickets where ticket_number = ticket_num) into exists_check;
    
    -- If it doesn't exist, return it
    if not exists_check then
      return ticket_num;
    end if;
  end loop;
end;
$$ language plpgsql;
