-- Add attachments support to chat_messages table
-- This allows users to upload images with their messages (max 3 per ticket)

-- Add attachments column to store image URLs as JSON array
alter table public.chat_messages 
add column if not exists attachments jsonb default '[]'::jsonb;

-- Create storage bucket for chat attachments
insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', true)
on conflict (id) do nothing;

-- Allow public uploads to chat-attachments bucket
create policy "Allow public uploads to chat-attachments"
on storage.objects for insert
with check (bucket_id = 'chat-attachments');

-- Allow public reads from chat-attachments bucket
create policy "Allow public reads from chat-attachments"
on storage.objects for select
using (bucket_id = 'chat-attachments');

-- Allow public deletes from chat-attachments bucket (for cleanup)
create policy "Allow public deletes from chat-attachments"
on storage.objects for delete
using (bucket_id = 'chat-attachments');

-- Create function to count attachments per ticket
create or replace function count_ticket_attachments(p_ticket_id uuid)
returns integer
language plpgsql
as $$
declare
  attachment_count integer;
begin
  select coalesce(sum(jsonb_array_length(attachments)), 0)::integer
  into attachment_count
  from chat_messages
  where ticket_id = p_ticket_id;
  
  return attachment_count;
end;
$$;

-- Add comment
comment on column chat_messages.attachments is 'Array of attachment URLs. Max 3 images per ticket.';
