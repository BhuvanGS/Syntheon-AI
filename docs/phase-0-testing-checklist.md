# Phase 0 Testing Checklist

**Purpose:** Comprehensive testing guide for Phase 0 features. Test each item systematically before moving to Phase 1.

**Test Environment Setup:**

1. Fresh browser session (incognito/private)
2. Clear localStorage and cookies
3. Have 2+ test users in the same org
4. Have at least 1 project with tickets and meetings

---

## 0.1 — Notification Inbox & Delivery

### Setup

- [ ] Verify notifications table has all required columns
- [ ] Check `/api/notifications` endpoints exist (GET, POST, PATCH)
- [ ] Check `/api/notifications/read-all` endpoint exists
- [ ] Verify SSE provider is wired up

### In-App Notifications

**Test: Notification creation**

- [ ] Create a ticket and assign it to User B
- [ ] Verify User B sees notification in bell icon
- [ ] Unread count badge appears (red circle with number)
- [ ] Notification bell pulses or animates on new notification

**Test: Notification inbox**

- [ ] Click notification bell
- [ ] Inbox panel opens with correct positioning
- [ ] Unread notifications appear at top with blue dot
- [ ] Read notifications appear below with reduced opacity
- [ ] Time ago format is correct (just now, 5m ago, 2h ago, 1d ago)
- [ ] Notification icons match type (Ticket, Comment, Alert, Clock, Video)

**Test: Notification interactions**

- [ ] Click a notification with `ticket_id`
- [ ] Verify it navigates to the correct ticket
- [ ] Notification is marked as read automatically
- [ ] Blue dot disappears
- [ ] Unread count decreases

**Test: Mark all as read**

- [ ] Have 3+ unread notifications
- [ ] Click "Mark all read" button
- [ ] All notifications lose blue dot
- [ ] Unread count becomes 0
- [ ] Button disappears

**Test: Real-time updates**

- [ ] Open Syntheon in 2 browser tabs (User A, User B)
- [ ] User A assigns a ticket to User B
- [ ] Within 2 seconds, User B's bell icon updates
- [ ] New notification appears without refresh

**Test: Empty state**

- [ ] Mark all notifications as read
- [ ] Delete all notifications (if possible)
- [ ] Bell icon shows "No notifications yet" message

**Test: Outside click**

- [ ] Open notification inbox
- [ ] Click outside the panel
- [ ] Inbox closes

### Email Notifications (if implemented)

- [ ] User receives email when assigned a ticket
- [ ] Email contains ticket title and link
- [ ] Email has correct sender (noreply@syntheon or similar)
- [ ] Email can be toggled off in settings

### Performance

- [ ] Notification fetch completes in <300ms
- [ ] Opening inbox feels instant (no delay)
- [ ] No memory leaks (open/close inbox 20 times)
- [ ] No duplicate notifications created

### Edge Cases

- [ ] Notification for deleted ticket shows gracefully
- [ ] Very long ticket titles are truncated
- [ ] 99+ notifications show "99+"
- [ ] Notifications from different orgs don't mix
- [ ] User can't see notifications from projects they're not in

---

## 0.2 — Global Search Completion

### Setup

- [ ] Verify `/api/search` endpoint exists
- [ ] Dynamic Island component is rendered in layout
- [ ] Have diverse test data: 10+ tickets, 5+ meetings, 3+ projects

### Search UI

**Test: Opening search**

- [ ] Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
- [ ] Search modal opens centered
- [ ] Backdrop appears (blurred/darkened)
- [ ] Input is auto-focused
- [ ] Modal has smooth animation

**Test: Closing search**

- [ ] Press `Esc` key → modal closes
- [ ] Click backdrop → modal closes
- [ ] Click search pill again → modal closes
- [ ] Query is cleared on close

**Test: Search pill**

- [ ] Search pill visible in navbar/header
- [ ] Shows "Search…" placeholder text
- [ ] Shows correct keyboard shortcut (⌘K or Ctrl+K)
- [ ] Hover state works

### Search Functionality

**Test: Empty state**

- [ ] Open search with no query
- [ ] Shows help text: "Type to search across tickets, meetings & projects"

**Test: Loading state**

- [ ] Type a query
- [ ] Sparkles icon animates while loading
- [ ] "Searching…" text appears
- [ ] Loading finishes within 300ms

**Test: Ticket search**

- [ ] Search for ticket title keyword (e.g., "login")
- [ ] Matching tickets appear with Ticket icon (blue)
- [ ] Subtitle shows ticket status (backlog, in_progress, done)
- [ ] Max 5 ticket results shown

**Test: Meeting search**

- [ ] Search for meeting project name (e.g., "API")
- [ ] Matching meetings appear with Video icon (amber)
- [ ] Subtitle shows platform (e.g., "zoom", "meet")
- [ ] Max 3 meeting results shown

**Test: Project search**

- [ ] Search for project name (e.g., "Backend")
- [ ] Matching projects appear with Folder icon (green)
- [ ] Subtitle shows "Project"
- [ ] Max 3 project results shown

**Test: Mixed results**

- [ ] Search for keyword that matches all types
- [ ] Results grouped: tickets first, then meetings, then projects
- [ ] Total results limited to ~10

**Test: No results**

- [ ] Search for nonsense string (e.g., "xyzabc123")
- [ ] Shows "No results for [query]"
- [ ] Suggestion text or empty state

### Navigation

**Test: Keyboard navigation**

- [ ] Type query, wait for results
- [ ] Press `↓` arrow → first result highlighted
- [ ] Press `↓` again → next result highlighted
- [ ] Press `↑` → previous result highlighted
- [ ] Press `Enter` → selected result opens
- [ ] Selected result shows "↵" indicator

**Test: Click navigation**

- [ ] Click a ticket result → ticket detail opens
- [ ] Click a meeting result → meeting detail opens
- [ ] Click a project result → project page opens
- [ ] Search modal closes after selection

### Performance

- [ ] Search debounce is 200-300ms (not instant, not too slow)
- [ ] Results appear in <300ms
- [ ] Typing is never blocked or laggy
- [ ] No duplicate API calls for same query

### Edge Cases

- [ ] Very long queries (500+ chars) don't break UI
- [ ] Special characters in query (e.g., @, #, ") handled
- [ ] Search works with only 1 ticket/meeting/project
- [ ] Search works with 1000+ tickets (performance test)
- [ ] Deleted entities don't appear in results
- [ ] User only sees results from their org
- [ ] User only sees projects they're a member of

---

## 0.3 — Comments & Activity Polish

### Setup

- [ ] Verify `ticket_comments` table has `parent_id` column for threading
- [ ] Verify `ticket_activities` table exists
- [ ] Have at least 2 test users in same org
- [ ] Have a ticket with some existing comments

### Comments Panel

**Test: Viewing comments**

- [ ] Open ticket detail
- [ ] Comments panel is visible
- [ ] Comments ordered by creation date (oldest first)
- [ ] Each comment shows:
  - [ ] User avatar or initials
  - [ ] User name
  - [ ] Comment text
  - [ ] Time ago (e.g., "2m ago")

**Test: Adding a comment**

- [ ] Type comment in text field
- [ ] Press Send or Enter
- [ ] Comment appears immediately
- [ ] Comment persisted (refresh page, still there)
- [ ] Empty comment cannot be sent

**Test: @mention autocomplete**

- [ ] Type `@` in comment field
- [ ] Dropdown appears with org members
- [ ] Shows user name and avatar
- [ ] Arrow keys navigate list
- [ ] Enter selects user
- [ ] Selected user is highlighted in comment (e.g., `@alice`)

**Test: @mention notification**

- [ ] User A mentions User B in comment: "Hey @bob can you check this?"
- [ ] User B receives notification
- [ ] Notification type is "mentioned"
- [ ] Clicking notification opens ticket
- [ ] Comment is highlighted or scrolled into view

**Test: Threaded replies (if implemented)**

- [ ] Hover over existing comment
- [ ] "Reply" button appears
- [ ] Click Reply → reply field opens nested under comment
- [ ] Type reply and send
- [ ] Reply appears indented/nested under parent
- [ ] Parent comment shows reply count badge

**Test: File attachments on comments**

- [ ] Click attachment icon in comment composer
- [ ] File picker opens
- [ ] Select image file (<5MB)
- [ ] File preview appears
- [ ] Send comment with attachment
- [ ] Attachment appears as thumbnail or link in comment
- [ ] Click attachment → opens in new tab or modal

### Activity Log

**Test: Activity timeline**

- [ ] Open ticket detail
- [ ] Activity panel shows unified timeline
- [ ] Activities include:
  - [ ] Ticket created
  - [ ] Status changed (e.g., "moved to In Progress")
  - [ ] Assignee changed (e.g., "assigned to Alice")
  - [ ] Due date set/changed
  - [ ] Comment added
  - [ ] Attachment uploaded
  - [ ] Dependency added

**Test: Activity details**

- [ ] Each activity shows:
  - [ ] Icon (check, arrow, user, clock, etc.)
  - [ ] User who performed action
  - [ ] Action description
  - [ ] Old value → New value (for changes)
  - [ ] Time ago

**Test: Unified timeline**

- [ ] Comments and activities are interleaved by time
- [ ] Timeline is chronological (oldest first or newest first, consistent)
- [ ] No duplicate entries

### Performance

- [ ] Comments load in <500ms
- [ ] Adding comment feels instant (<200ms)
- [ ] @mention dropdown appears in <100ms
- [ ] Activity log loads in <500ms
- [ ] No lag when scrolling long comment threads

### Edge Cases

- [ ] Very long comments (5000+ chars) render correctly
- [ ] User can't @mention users not in org
- [ ] Deleted user's comments still show (show "[Deleted User]")
- [ ] Comment with 10+ mentions works
- [ ] Mention dropdown works when 50+ users in org
- [ ] Attachments >10MB are rejected with error message
- [ ] Invalid file types rejected (e.g., .exe)

---

## 0.4 — Onboarding & Empty States

### Setup

- [ ] Use completely fresh account/org
- [ ] Clear all localStorage, cookies
- [ ] No existing projects, tickets, or meetings

### First-Time Onboarding

**Test: Welcome screen**

- [ ] New user lands on onboarding page after sign-up
- [ ] Welcome message appears
- [ ] Brief product description (1-2 sentences)
- [ ] "Get Started" CTA button

**Test: Onboarding steps**

- [ ] Step 1: Create organization (if not from invite)
  - [ ] Org name field
  - [ ] Create button
  - [ ] Org created successfully
- [ ] Step 2: Create first project
  - [ ] Project name field
  - [ ] GitHub repo field (or skip)
  - [ ] Create button
  - [ ] Project created → redirects to project page
- [ ] Step 3: Connect Google Calendar (optional)
  - [ ] "Connect Calendar" button
  - [ ] OAuth flow launches
  - [ ] After auth, returns to onboarding
  - [ ] "Skip" option available
- [ ] Step 4: Record first meeting
  - [ ] Instructions on how to start a meeting
  - [ ] "Start Meeting" button
  - [ ] Or "I'll do this later" skip option

**Test: Onboarding progress**

- [ ] Progress indicator shows current step (e.g., "2 of 4")
- [ ] "Back" button works (if applicable)
- [ ] Can skip optional steps
- [ ] Can exit onboarding and return later

**Test: Onboarding completion**

- [ ] After completing all steps (or skipping)
- [ ] User sees dashboard
- [ ] Onboarding completion tracked (localStorage or user metadata)
- [ ] User doesn't see onboarding wizard again

**Test: Return to onboarding**

- [ ] If user skipped onboarding initially
- [ ] "Complete setup" prompt in dashboard
- [ ] Can reopen onboarding from settings
- [ ] Completed steps are skipped

### Empty States

**Test: Empty projects list**

- [ ] Go to Projects page with 0 projects
- [ ] Empty state shows:
  - [ ] Friendly illustration or icon
  - [ ] Message: "No projects yet"
  - [ ] CTA: "Create your first project"
  - [ ] Button opens project create dialog

**Test: Empty tickets board**

- [ ] Open project with 0 tickets
- [ ] Empty state shows:
  - [ ] Message: "No tickets yet"
  - [ ] Sub-message: "Record a meeting or create manually"
  - [ ] CTA buttons:
    - [ ] "Record Meeting"
    - [ ] "Create Ticket"

**Test: Empty meetings list**

- [ ] Go to Meetings page with 0 meetings
- [ ] Empty state shows:
  - [ ] Message: "No meetings recorded"
  - [ ] CTA: "Record your first meeting"
  - [ ] Button opens meeting dialog

**Test: Empty dependencies graph**

- [ ] Open Dependencies tab with 0 dependencies
- [ ] Empty state shows:
  - [ ] Message: "No dependencies yet"
  - [ ] Sub-message: "Add dependencies between tickets"

**Test: Empty notifications**

- [ ] Click notification bell with 0 notifications
- [ ] Shows: "No notifications yet"

**Test: Empty search results**

- [ ] Covered in 0.2

### Tooltips / Product Tours

**Test: Feature tooltips (optional)**

- [ ] Hover over key features (meeting record button, ticket create, etc.)
- [ ] Tooltip appears with brief explanation
- [ ] Tooltip dismisses on click or after 3 seconds
- [ ] Can disable tooltips in settings

**Test: Quick-start templates (optional)**

- [ ] In empty project, show template options:
  - [ ] "Sprint Planning"
  - [ ] "Bug Triage"
  - [ ] "Product Review"
- [ ] Selecting template creates sample tickets

### Edge Cases

- [ ] User invited to existing org skips org creation step
- [ ] User with existing projects doesn't see onboarding
- [ ] Onboarding works on mobile (responsive)
- [ ] Can complete onboarding without connecting calendar
- [ ] Can complete onboarding without recording meeting

---

## 0.5 — Bug Bash & Performance

### API Performance Audit

**Test: API response times**

- [ ] `/api/tickets` (GET) completes in <500ms
- [ ] `/api/tickets/[id]` (GET) completes in <300ms
- [ ] `/api/tickets` (POST) completes in <500ms
- [ ] `/api/tickets/[id]` (PATCH) completes in <300ms
- [ ] `/api/meetings` (GET) completes in <500ms
- [ ] `/api/meetings/[id]` (GET) completes in <300ms
- [ ] `/api/projects` (GET) completes in <300ms
- [ ] `/api/notifications` (GET) completes in <300ms
- [ ] `/api/search` (GET) completes in <300ms

**Test: N+1 query prevention**

- [ ] Check database logs for repeated queries
- [ ] `/api/tickets` should use joins, not loops
- [ ] `/api/meetings/[id]/tickets` should use single query with join
- [ ] `/api/projects/[id]` should eager-load members

**Test: Pagination**

- [ ] Create 100+ tickets in a project
- [ ] `/api/tickets` supports `limit` and `offset` params
- [ ] Board/list views load in <2s even with 100+ tickets
- [ ] Infinite scroll or "Load More" works

**Test: Caching headers**

- [ ] Static assets have long cache headers (1 year)
- [ ] API routes have appropriate cache headers
- [ ] User-specific data is not cached

### UI Performance

**Test: Page load times**

- [ ] Dashboard loads in <2s (cold)
- [ ] Dashboard loads in <500ms (warm)
- [ ] Project workspace loads in <2s (cold)
- [ ] Ticket detail loads in <1s

**Test: Loading skeletons**

- [ ] Dashboard shows skeleton while loading projects
- [ ] Tickets board shows skeleton cards
- [ ] Ticket detail shows skeleton for comments/activity
- [ ] Skeletons match final layout

**Test: Optimistic updates**

- [ ] Moving ticket status feels instant (no spinner)
- [ ] Adding comment appears immediately (no wait)
- [ ] If API fails, reverts with toast error

**Test: Re-render optimization**

- [ ] Open `projects-workspace.tsx` in DevTools
- [ ] Move one ticket
- [ ] Only that ticket re-renders, not whole board
- [ ] No unnecessary re-renders

**Test: Memory leaks**

- [ ] Open/close ticket detail 20 times
- [ ] Check Chrome DevTools Memory tab
- [ ] No increasing memory usage
- [ ] No detached DOM nodes

### Error Boundaries

**Test: Crash handling**

- [ ] Simulate error (throw in component)
- [ ] Error boundary catches crash
- [ ] Shows friendly error message: "Something went wrong"
- [ ] "Reload" or "Go Home" button appears
- [ ] Rest of app still works

**Test: API error handling**

- [ ] Disconnect internet
- [ ] Try to load tickets
- [ ] Shows error toast: "Failed to load tickets"
- [ ] Retry button appears
- [ ] On reconnect, retry works

**Test: 404 handling**

- [ ] Navigate to `/tickets/invalid-id`
- [ ] Shows 404 page or "Ticket not found" message
- [ ] Can navigate back home

### Webhook Reliability

**Test: Idempotency**

- [ ] Trigger same webhook event twice (duplicate delivery)
- [ ] Ticket is not created twice
- [ ] No duplicate notifications

**Test: Retry logic**

- [ ] Webhook fails first time (simulate 500 error)
- [ ] System retries after delay
- [ ] Eventually succeeds
- [ ] No data corruption

**Test: Google OAuth edge cases**

- [ ] Test expired token refresh
- [ ] Test revoked access (user disconnects from Google settings)
- [ ] Error message shown, not crash

**Test: Skribby webhook edge cases**

- [ ] Meeting webhook arrives before meeting is created in DB
- [ ] Webhook arrives with empty transcript
- [ ] Webhook arrives with malformed JSON
- [ ] All cases handled gracefully

### Browser Compatibility

- [ ] Chrome (latest) — all features work
- [ ] Firefox (latest) — all features work
- [ ] Safari (latest) — all features work
- [ ] Edge (latest) — all features work
- [ ] Mobile Chrome (iOS/Android) — basic features work
- [ ] Mobile Safari (iOS) — basic features work

### Accessibility

- [ ] Tab navigation works throughout app
- [ ] Focus states visible
- [ ] Screen reader can navigate main flows
- [ ] Color contrast meets WCAG AA
- [ ] No keyboard traps

---

## General Testing Notes

### Before Testing Each Feature

1. Clear browser cache and storage
2. Use fresh test data
3. Test in both light and dark mode (if supported)
4. Test with slow network throttling (Chrome DevTools)

### After Each Feature

1. Check browser console for errors
2. Check network tab for failed requests
3. Check for memory leaks
4. Verify data persists after refresh

### Bug Reporting Format

When you find a bug, report it as:

```
**Bug:** [Short description]
**Steps to reproduce:**
1. ...
2. ...
3. ...
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Severity:** Critical / High / Medium / Low
**Browser:** Chrome 120, macOS
```

---

## Phase 0 Completion Criteria

Phase 0 is complete when:

- [ ] All acceptance criteria in roadmap are met
- [ ] All tests in this checklist pass
- [ ] No critical or high severity bugs remain
- [ ] Performance targets are met (<2s page loads, <500ms API)
- [ ] No console errors in normal usage
- [ ] App feels polished and production-ready

**Sign-off:** [Your name] — [Date]

---

**Next:** After Phase 0 is complete and tested, proceed to Phase 1 (Meeting Intelligence Differentiation).
