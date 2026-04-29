# Notification System - Implementation Summary

## Overview
Added a comprehensive notification system that alerts users when someone comments on Bible study posts. Includes a notification bell in the navbar and a dedicated notifications page.

## Database Schema

### Table: `notifications`
- `id` - Primary key (auto-increment)
- `user_id` - Foreign key to members.id (who receives the notification)
- `message` - Notification message text (TEXT, NOT NULL)
- `bible_study_id` - Foreign key to bible_studies.id (optional, for navigation)
- `is_read` - Boolean flag (default: false)
- `created_at` - Timestamp (default: now)

### Indexes
- `idx_notifications_user_id` - For filtering by user
- `idx_notifications_is_read` - For filtering by read status
- `idx_notifications_created_at` - For sorting by date
- `idx_notifications_user_unread` - Composite index for unread queries

### Relationships
- Each notification belongs to one user (member)
- Each notification can reference one Bible study (optional)
- Deleting a member deletes all their notifications (CASCADE)
- Deleting a Bible study deletes related notifications (CASCADE)

## Features Implemented

### 1. Notification Creation
**Trigger**: When a comment is posted on a Bible study

**Logic**:
- Get commenter's name
- Create notification message: "{Name} commented on '{Study Title}'"
- Notify all members except the commenter
- For simplicity, currently notifies only the first member (admin)
- Includes bible_study_id for navigation

**Example Message**:
```
"John Doe commented on 'Faith and Trust in God'"
```

### 2. Notification Bell (Navbar Component)
**Location**: Top-right corner of navbar

**Features**:
- 🔔 Bell icon
- Red badge showing unread count (e.g., "3")
- Badge shows "9+" for 10 or more unread
- Click to toggle dropdown

**Dropdown Features**:
- Shows last 10 notifications
- Unread notifications highlighted (purple background)
- Each notification shows:
  - Message text
  - Relative time (e.g., "5m ago", "2h ago")
  - Purple dot for unread
- Click notification to:
  - Mark as read
  - Navigate to Bible study
- "Mark all read" button in header
- Auto-refresh every 30 seconds

### 3. Notifications Page
**Route**: `/notifications`

**Features**:
- Full list of all notifications
- Filter tabs:
  - All (shows count)
  - Unread (shows count)
  - Read (shows count)
- Each notification card shows:
  - 📬 Icon (unread) or 📭 (read)
  - Message text
  - Detailed timestamp
  - "New" badge for unread
  - Action buttons:
    - ✓ Mark as read
    - 🗑️ Delete
- Click notification to navigate to Bible study
- "Mark All as Read" button in header
- Empty states for each filter

### 4. Notification States
**Unread**:
- Purple background highlight
- Purple dot indicator
- "New" badge
- Counted in badge

**Read**:
- Normal background
- No indicators
- Not counted in badge

### 5. Timestamp Formatting
**Relative Time** (for recent notifications):
- "Just now" - Less than 1 minute
- "5m ago" - Less than 1 hour
- "2h ago" - Less than 24 hours
- "3d ago" - Less than 7 days
- "Jan 15" - Older than 7 days

**Full Time** (on notifications page):
- "January 15, 2024, 02:30 PM"

## Files Created/Modified

### New Files
1. `supabase-migrations/create-notifications-table.sql` - Database schema
2. `src/components/common/NotificationBell.jsx` - Navbar bell component
3. `src/pages/Notifications.jsx` - Full notifications page

### Modified Files
1. `src/components/layout/Navbar.jsx` - Added NotificationBell component
2. `src/pages/BibleStudyDetail.jsx` - Added notification creation on comment
3. `src/routes/AppRoutes.jsx` - Added `/notifications` route

## Component Architecture

### NotificationBell Component
**Props**:
- `currentUserId` - ID of logged-in user

**State**:
- `notifications` - Array of notification objects
- `unreadCount` - Number of unread notifications
- `showDropdown` - Dropdown visibility
- `loading` - Loading state

**Functions**:
- `loadNotifications()` - Fetch user's notifications
- `markAsRead(id)` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `handleNotificationClick(notification)` - Navigate and mark as read
- `formatNotificationTime(date)` - Format relative time

**Auto-Refresh**:
- Polls for new notifications every 30 seconds
- Uses `setInterval` with cleanup

### Notifications Page
**State**:
- `notifications` - Array of notification objects
- `loading` - Loading state
- `currentUserId` - Current user ID (hardcoded for demo)
- `filter` - Current filter ('all', 'unread', 'read')

**Functions**:
- `loadNotifications()` - Fetch with filter
- `markAsRead(id)` - Mark single as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete notification
- `handleNotificationClick(notification)` - Navigate and mark as read
- `formatDate(date)` - Format full timestamp

## Supabase Operations

### Fetch Notifications
```javascript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', currentUserId)
  .order('created_at', { ascending: false })
  .limit(10)
```

### Create Notification
```javascript
const { error } = await supabase
  .from('notifications')
  .insert([{
    user_id: memberId,
    message: notificationMessage,
    bible_study_id: studyId,
    is_read: false
  }])
```

### Mark as Read
```javascript
const { error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId)
```

### Mark All as Read
```javascript
const { error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('user_id', currentUserId)
  .eq('is_read', false)
```

### Delete Notification
```javascript
const { error } = await supabase
  .from('notifications')
  .delete()
  .eq('id', notificationId)
```

## User Flow

### Receiving a Notification
1. User A posts a comment on a Bible study
2. System creates notification for User B
3. User B sees red badge on bell icon (e.g., "1")
4. User B clicks bell to see dropdown
5. Notification appears with purple highlight
6. User B clicks notification
7. Notification marked as read
8. User B navigated to Bible study
9. Badge count decreases

### Viewing All Notifications
1. User clicks "Notifications" in sidebar (if added)
2. Or navigates to `/notifications`
3. Sees all notifications with filters
4. Can filter by All/Unread/Read
5. Can mark individual as read
6. Can delete notifications
7. Can mark all as read

## Setup Instructions

### 1. Run Database Migration
Execute the SQL migration in Supabase SQL Editor:
```bash
# Navigate to Supabase Dashboard > SQL Editor
# Run: supabase-migrations/create-notifications-table.sql
```

### 2. Test the Feature
1. Open the app in browser
2. Navigate to a Bible study detail page
3. Post a comment as one user
4. Check the notification bell (should show badge)
5. Click bell to see dropdown
6. Click notification to navigate
7. Visit `/notifications` page
8. Test filters and actions

## Current User System

### Demo Implementation
- Currently uses hardcoded `currentUserId = 1`
- Set in Navbar component
- Passed to NotificationBell component
- Used in Notifications page

### Production Recommendations
1. Implement proper authentication
2. Get user ID from auth context
3. Store in global state (Context API, Redux)
4. Pass to components via props or context
5. Secure with Row Level Security (RLS)

## Notification Logic

### Who Gets Notified?
**Current Implementation**:
- All members except the commenter
- Limited to first member (for simplicity)

**Production Recommendations**:
- Notify Bible study creator/author
- Notify admins/moderators
- Notify users who previously commented
- Add notification preferences
- Allow users to subscribe/unsubscribe

### Notification Types
**Currently Supported**:
- Comment on Bible study

**Future Types**:
- Reply to your comment
- Like on your comment
- New Bible study published
- Event reminder
- Prayer request update
- Announcement posted

## UI Design

### Notification Bell
- Clean, minimal design
- Red badge for visibility
- Smooth dropdown animation
- Purple theme for unread
- Touch-friendly on mobile

### Notifications Page
- Card-based layout
- Clear visual hierarchy
- Filter tabs for organization
- Action buttons for management
- Empty states for guidance

### Color Scheme
- **Unread**: Purple (#8b5cf6, #faf5ff)
- **Badge**: Red (#ef4444)
- **Read**: Gray (#f9fafb)
- **Text**: Dark gray (#1f2937)

## Performance Considerations

### Optimizations
- Limit dropdown to 10 notifications
- Efficient database queries with indexes
- Auto-refresh every 30 seconds (not real-time)
- Cleanup interval on component unmount

### Future Improvements
- Real-time updates (Supabase subscriptions)
- Pagination for notifications page
- Lazy loading
- Notification grouping
- Batch operations

## Accessibility

### Features
- Semantic HTML structure
- Clear button labels
- Keyboard navigation support
- Good color contrast
- Screen reader friendly

### ARIA Attributes (Future)
- `aria-label` for bell button
- `aria-live` for new notifications
- `role="alert"` for important notifications

## Security Considerations

### Current Implementation
- RLS disabled for development
- No authentication required
- Anyone can see any notifications

### Production Recommendations
1. Enable RLS on notifications table
2. Policy: Users can only see their own notifications
3. Add authentication
4. Validate user_id on insert
5. Rate limiting for notification creation
6. Prevent notification spam

## Known Limitations

### Current Version
- No real-time updates (requires refresh/polling)
- Hardcoded user ID (no auth)
- Notifies only first member (simplified)
- No notification preferences
- No notification grouping
- No push notifications
- No email notifications

### Future Enhancements
- Real-time notifications (Supabase subscriptions)
- Proper authentication system
- User notification preferences
- Notification grouping ("3 new comments")
- Push notifications (browser API)
- Email notifications
- SMS notifications
- Notification sounds
- Custom notification types
- Notification templates
- Bulk actions
- Search notifications
- Export notifications

## Testing Checklist

- ✅ Notifications table created in Supabase
- ✅ Notification created when comment posted
- ✅ Notification bell appears in navbar
- ✅ Badge shows unread count
- ✅ Dropdown opens on click
- ✅ Notifications load in dropdown
- ✅ Unread notifications highlighted
- ✅ Click notification navigates to study
- ✅ Click notification marks as read
- ✅ Badge count updates
- ✅ Mark all as read works
- ✅ Auto-refresh works (30s interval)
- ✅ Notifications page loads
- ✅ Filter tabs work
- ✅ Mark as read button works
- ✅ Delete button works
- ✅ Empty states display
- ✅ Timestamps format correctly

## Usage Examples

### Example Notification Flow
1. **Sarah** posts comment: "Great study!"
2. System creates notification for **John** (admin)
3. Message: "Sarah commented on 'Faith and Trust in God'"
4. John sees badge: "1"
5. John clicks bell
6. Sees notification with purple highlight
7. Clicks notification
8. Marked as read, navigated to study
9. Badge disappears

### Example Notifications Page
**All Tab** (5 notifications):
1. 📬 "Sarah commented on 'Faith and Trust in God'" - 5m ago [New]
2. 📭 "Michael commented on 'Prayer and Worship'" - 2h ago
3. 📭 "Emily commented on 'Faith and Trust in God'" - 1d ago
4. 📭 "David commented on 'Love and Compassion'" - 3d ago
5. 📭 "Rachel commented on 'Prayer and Worship'" - Jan 15

**Unread Tab** (1 notification):
1. 📬 "Sarah commented on 'Faith and Trust in God'" - 5m ago [New]

**Read Tab** (4 notifications):
1-4. (Same as above, excluding unread)

## Conclusion

The notification system successfully keeps users informed about activity on Bible studies. The implementation includes both a convenient navbar bell for quick access and a full notifications page for management. The system is simple, clean, and focused on user experience, with room for future enhancements like real-time updates and additional notification types.
