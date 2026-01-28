# Voice Note Feature Documentation

## Overview
Users can now optionally record voice notes when submitting road damage reports. This allows them to describe issues in their preferred language while maintaining a searchable text description.

## User Flow

### Recording a Voice Note (Report Form - Step 3)
1. User fills out the required text description
2. Optionally, user can tap the microphone button to record a voice note
3. Visual feedback shows:
   - Recording in progress (animated visualizer bars)
   - Duration counter
   - Recording status ("Listening..." / "Click to speak")
4. After recording, user sees a preview panel with:
   - Duration of the recording
   - Confirmation button to include it with submission
   - Re-record option if they want to try again
5. User must explicitly confirm to include the voice note in their report

### Admin Dashboard View
Admins can see voice note information in two places:

#### 1. Work Orders Table
- Reports with voice notes show a small microphone icon next to the Ticket ID
- Quick visual indicator without opening the report

#### 2. Report Details Modal
- Dedicated "Voice Note" section showing:
  - **If submitted**: 
    - Green "Submitted" badge
    - Duration display (e.g., "Duration: 15s")
    - Placeholder for future audio playback
    - Visual indicator with microphone icon
  - **If not submitted**: 
    - "No voice note submitted" message
    - Greyed out microphone icon

## Database Schema

### New Columns in `reports` table:
```sql
voice_note_duration INTEGER        -- Duration in seconds
voice_note_confirmed BOOLEAN       -- User confirmed to submit
```

## Implementation Details

### Components Modified
1. **ReportForm.tsx**
   - Added AIVoiceInput component integration
   - State management for recording/confirmation
   - Validation and submission logic

2. **AdminWorkOrders.tsx**
   - Voice note indicator in table view
   - Detailed voice note section in modal
   - Icons and styling for voice note status

3. **reportStore.ts**
   - Updated Report interface
   - Database insert/select logic
   - Data formatting functions

### Files Created
1. **ai-voice-input.tsx** - Reusable voice input component
2. **ai-voice-input-demo.tsx** - Demo/example usage
3. **supabase_voice_note_migration.sql** - Database migration

## Future Enhancements (TODO)
- [ ] Actual audio recording and storage
- [ ] Audio playback in admin dashboard
- [ ] Speech-to-text transcription
- [ ] Multi-language support for transcription
- [ ] Audio file compression and optimization
- [ ] Download audio file option for admins

## Technical Notes

### Current Implementation
- Voice note is **UI/UX only** - tracks duration and user confirmation
- No actual audio data is stored yet
- Provides foundation for future audio recording integration

### To Add Real Audio Recording
1. Implement Web Audio API or MediaRecorder API
2. Store audio as base64 or upload to cloud storage (Supabase Storage)
3. Add audio_url or audio_data column to database
4. Implement audio playback controls in admin dashboard
5. Add audio file size limits and format validation

### Security Considerations
- Validate audio file types and sizes
- Implement rate limiting on recordings
- Sanitize metadata before storage
- Consider encryption for sensitive voice data
- Set appropriate storage policies in Supabase

## Migration Instructions

### 1. Run Database Migration
Execute the SQL in `supabase_voice_note_migration.sql` in your Supabase SQL Editor:
```sql
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS voice_note_duration INTEGER;

ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS voice_note_confirmed BOOLEAN DEFAULT FALSE;
```

### 2. Update Environment
No new environment variables needed for current implementation.

### 3. Test the Feature
1. Navigate to Report form (Step 3: Describe the Issue)
2. Look for "Voice note (optional)" section
3. Click microphone to test recording animation
4. Confirm the voice note
5. Submit report
6. Check Admin Dashboard → Work Orders
7. View report details to see voice note status

## User Documentation

### For Citizens
**Optional Voice Note:**
- After typing your description, you can record a voice note in any language
- Tap the microphone to start, tap again to stop
- Review your recording duration and confirm to include it
- You can re-record if needed
- Voice notes help our teams understand context better

### For Admins
**Viewing Voice Notes:**
- Reports with voice notes show a 🎤 icon next to the Ticket ID
- Click "View Details" to see full voice note information
- Check duration and submission status
- Audio playback coming soon

## Support
For questions or issues with the voice note feature, contact the development team.
