# Live Chat System Setup Guide

## Overview
A real-time live chat system that allows users to chat with admins using their support ticket number. Messages are synced in real-time using Supabase Realtime.

## Features

### For Users:
- Click "Live Support" button on homepage (bottom-left corner)
- Enter support ticket number (e.g., SUP-123456)
- Chat in real-time with support team
- See message history
- Get instant responses

### For Admins:
- Click "Open Live Chat" on any support ticket
- See full conversation history including initial ticket message
- Send messages in real-time
- Mark ticket as resolved from chat
- Messages sync instantly with users

## Setup Instructions

### Step 1: Run the Database Migration

You need to create the `chat_messages` table in Supabase:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the content from `supabase/chat-messages-schema.sql`
3. Run the SQL script

Or copy this:

```sql
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
```

### Step 2: Enable Realtime in Supabase

1. Go to **Supabase Dashboard** → **Database** → **Replication**
2. Find the `chat_messages` table
3. Toggle **Enable Realtime** to ON
4. Click **Save**

This enables real-time subscriptions for instant message delivery.

### Step 3: Test the System

#### User Flow:
1. Go to homepage
2. Use the AI chatbot to create a support ticket
3. Note the ticket number (e.g., SUP-123456)
4. Click "Live Support" button (bottom-left)
5. Enter your ticket number
6. Click "Connect to Chat"
7. Send a message

#### Admin Flow:
1. Login to `/admin`
2. Go to "Support Tickets"
3. Find the ticket
4. Click "Open Live Chat"
5. You'll see the user's initial message
6. Type a reply and send
7. User will see it instantly!

## How It Works

### Real-time Architecture

```
User (LiveChatWidget)          Supabase Realtime          Admin (AdminSupportTickets)
        |                              |                              |
        |--- Send Message ------------->|                              |
        |                              |                              |
        |                              |---- Real-time Push --------->|
        |                              |                              |
        |<---- Real-time Push ---------|                              |
        |                              |<-- Send Message -------------|
```

### Technology Stack
- **Frontend**: React + TypeScript
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime (WebSocket)
- **UI**: shadcn/ui components

### Database Schema

**chat_messages table:**
```sql
- id: UUID (primary key)
- ticket_id: UUID (foreign key to support_tickets)
- ticket_number: TEXT (e.g., SUP-123456)
- sender_type: 'user' | 'admin'
- sender_name: TEXT
- message: TEXT
- created_at: TIMESTAMP
```

## User Interface

### User Chat Widget (Homepage)
- **Location**: Bottom-left corner
- **Button**: Green with "Live Support" text
- **Features**:
  - Ticket number input
  - Real-time messages
  - Timestamp display
  - Sender identification

### Admin Chat Interface
- **Location**: Modal popup in Support Tickets page
- **Features**:
  - Full conversation history
  - Initial ticket message shown first
  - Real-time message sync
  - Quick actions (Mark Resolved, Close)
  - Timestamp for all messages

## Message Flow

### When User Sends Message:
1. User types message in LiveChatWidget
2. Message is inserted into `chat_messages` table
3. Supabase Realtime triggers
4. Admin sees message instantly (if chat is open)
5. Ticket status auto-updates to "in-progress"

### When Admin Sends Message:
1. Admin types message in AdminSupportTickets
2. Message is inserted into `chat_messages` table
3. Supabase Realtime triggers
4. User sees message instantly
5. Confirmation toast shown to admin

## Troubleshooting

### Messages not appearing in real-time?

**Check Realtime is enabled:**
1. Supabase Dashboard → Database → Replication
2. Verify `chat_messages` has Realtime enabled
3. Check browser console for WebSocket errors

**Check RLS policies:**
```sql
-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'chat_messages';
```

### Can't connect to chat?

**User side:**
- Verify ticket number is correct (case-insensitive)
- Check ticket exists in database
- Ensure ticket hasn't been deleted

**Admin side:**
- Verify admin is logged in
- Check browser console for errors
- Refresh the page and try again

### Messages showing delayed?

- Check internet connection
- Verify Supabase project is not sleeping (free tier)
- Check browser console for reconnection attempts
- Try refreshing the page

## Features Explained

### Auto-scroll to Bottom
- New messages automatically scroll into view
- Smooth scrolling animation
- Works for both user and admin

### Message Styling
- **User messages**: Left-aligned, white background
- **Admin messages**: Right-aligned, primary color
- **Timestamps**: Small text, formatted as locale time

### Ticket Status Auto-update
- When admin sends first message → status becomes "in-progress"
- Admin can mark as "resolved" from chat interface
- Status changes reflect immediately in tickets list

## Production Checklist

- [ ] Supabase Realtime enabled for `chat_messages`
- [ ] RLS policies configured correctly
- [ ] Table `chat_messages` created with indexes
- [ ] Test user-to-admin messaging
- [ ] Test admin-to-user messaging
- [ ] Verify real-time sync works
- [ ] Check mobile responsiveness
- [ ] Test with multiple simultaneous chats

## Future Enhancements

### Planned Features:
1. **Typing indicators**: "Admin is typing..."
2. **Read receipts**: Show when messages are read
3. **File attachments**: Send images/documents
4. **Emoji support**: Add emoji picker
5. **Sound notifications**: Alert sound for new messages
6. **Chat history export**: Download conversation as PDF
7. **Multiple admin support**: Route to specific admin
8. **Auto-responses**: Set automated replies
9. **Chat hours**: Display availability status
10. **Satisfaction rating**: Post-chat feedback

## API Reference

### Load Chat Messages
```typescript
const { data, error } = await supabase
  .from('chat_messages')
  .select('*')
  .eq('ticket_number', ticketNumber)
  .order('created_at', { ascending: true });
```

### Send Message (User)
```typescript
await supabase.from('chat_messages').insert([{
  ticket_id: ticketId,
  ticket_number: ticketNumber,
  sender_type: 'user',
  sender_name: userName,
  message: messageText,
}]);
```

### Send Message (Admin)
```typescript
await supabase.from('chat_messages').insert([{
  ticket_id: ticketId,
  ticket_number: ticketNumber,
  sender_type: 'admin',
  sender_name: 'Support Team',
  message: messageText,
}]);
```

### Subscribe to Real-time
```typescript
const channel = supabase
  .channel(`chat:${ticketNumber}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `ticket_number=eq.${ticketNumber}`,
    },
    (payload) => {
      setMessages((current) => [...current, payload.new]);
    }
  )
  .subscribe();
```

## Support

For issues or questions:
1. Check this documentation
2. Verify database setup
3. Check browser console for errors
4. Review Supabase logs

---

**Created:** January 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
