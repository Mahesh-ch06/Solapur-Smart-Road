# Live Chat File Upload Feature

## Overview
The live chat system now supports image uploads with a limit of **3 images per support ticket**. Both users and admins can attach and view images in their conversations.

## Features

### User Side (LiveChatWidget)
- **Upload Limit**: Maximum 3 images per ticket across all messages
- **File Types**: Only image files (jpg, png, gif, webp, etc.)
- **Preview**: Selected images are previewed before sending
- **Remove**: Users can remove selected images before sending
- **View**: Attached images are displayed inline in chat messages
- **Counter**: Shows current image count (e.g., "2/3 images")

### Admin Side (AdminSupportTickets)
- Same upload and viewing capabilities as users
- Can see all images uploaded by users
- Can attach images to replies
- Image counter shows total attachments for the ticket

## Usage

### For Users
1. Connect to support chat with your ticket number
2. Click the paperclip (📎) button to attach images
3. Select up to 3 images total for the entire conversation
4. Preview selected images and remove any if needed
5. Send message with or without text

### For Admins
1. Open a support ticket
2. View any images attached by the user
3. Click the paperclip (📎) button to attach images in your reply
4. Send images with or without text

## Technical Implementation

### Database Schema
- Added `attachments` column to `chat_messages` table (JSONB array)
- Created `chat-attachments` storage bucket in Supabase
- Implemented RLS policies for public upload/read/delete

### Storage Structure
```
chat-attachments/
  ├── SUP-123456/
  │   ├── SUP-123456_timestamp_randomid.jpg
  │   └── SUP-123456_timestamp_randomid.png
  └── SUP-789012/
      └── SUP-789012_timestamp_randomid.jpg
```

### File Validation
- Only image MIME types accepted
- Client-side validation before upload
- Maximum 3 images per ticket enforced
- File naming includes ticket number, timestamp, and random ID

## Database Migration

Run the following SQL to add attachment support:

```bash
# Apply the migration
supabase db push supabase/chat-attachments-migration.sql
```

Or manually execute the SQL file in your Supabase SQL editor.

## Security Considerations

1. **File Type Validation**: Only images are accepted
2. **Public Access**: Attachments are publicly accessible (suitable for support use case)
3. **Organized Storage**: Files are organized by ticket number
4. **No Size Limit**: Currently no file size restriction (consider adding if needed)

## Future Enhancements

Possible improvements:
- [ ] File size validation (e.g., max 5MB per image)
- [ ] Image compression before upload
- [ ] Support for PDF attachments
- [ ] Admin ability to delete inappropriate attachments
- [ ] Download all attachments as ZIP
- [ ] Image thumbnails for better performance

## Troubleshooting

### "Maximum 3 images per ticket" error
- The ticket already has 3 images attached across all messages
- Ask user to create a new ticket for additional images

### Images not displaying
- Check Supabase storage bucket exists: `chat-attachments`
- Verify RLS policies are enabled
- Check browser console for CORS errors

### Upload failing
- Ensure storage bucket is created and public
- Check file is actually an image type
- Verify Supabase connection is active

## Code Locations

### User Side
- Component: `/src/components/landing/LiveChatWidget.tsx`
- File upload handlers: `handleFileSelect()`, `uploadFiles()`
- UI: File preview section, attachment display in messages

### Admin Side
- Component: `/src/components/admin/AdminSupportTickets.tsx`
- Same handlers and UI as user side
- Additional image counter in admin interface

### Database
- Schema: `/supabase/chat-attachments-migration.sql`
- Table: `chat_messages` (attachments column)
- Storage: Supabase Storage bucket `chat-attachments`
