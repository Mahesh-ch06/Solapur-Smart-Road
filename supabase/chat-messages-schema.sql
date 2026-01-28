-- Live Chat Messages Schema for Support Tickets

-- Create chat_messages table for real-time conversations
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.support_tickets(id) on delete cascade not null,
  ticket_number text not null,
  sender_type text check (sender_type in ('user', 'admin')) not null,
  sender_name text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_chat_messages_ticket_id on public.chat_messages(ticket_id);
create index if not exists idx_chat_messages_ticket_number on public.chat_messages(ticket_number);
create index if not exists idx_chat_messages_created_at on public.chat_messages(created_at);

-- Enable Row Level Security (RLS)
alter table public.chat_messages enable row level security;

-- Create policies for chat_messages table
create policy "Allow public read access to chat_messages"
  on public.chat_messages for select
  using (true);

create policy "Allow public insert access to chat_messages"
  on public.chat_messages for insert
  with check (true);

-- Enable real-time for chat_messages
alter publication supabase_realtime add table chat_messages;
