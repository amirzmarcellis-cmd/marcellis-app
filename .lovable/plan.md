

## WhatsApp Chat History Page

### Overview
Create a new page that displays WhatsApp conversation history between candidates and Sarah (the AI assistant). The page will show a contact list on the left and the full chat thread on the right when a contact is selected.

### Data Structure
The `message history WA` table contains:
- **phone**: Contact phone number (86 unique contacts)
- **message**: Text block with "USER - ..." and "AI - ..." messages combined
- **created_at**: Timestamp of the message
- **id**: Auto-incrementing ID

Each row contains one exchange (a USER message and an AI response as a single text block). Multiple rows per phone number represent the conversation thread over time.

### Changes

#### 1. New Page: `src/pages/WhatsAppHistory.tsx`
- **Left panel**: Scrollable contact list showing:
  - Phone number
  - Last message preview (truncated)
  - Timestamp of last message
  - Message count badge
  - Search bar to filter by phone number
- **Right panel**: Chat thread view (similar to the existing ChatPanel pattern):
  - Messages parsed from the "USER - ..." / "AI - ..." format into separate chat bubbles
  - USER messages on the right, AI messages on the left
  - Timestamps below each message group
  - Sarah avatar for AI messages
- Data fetched from Supabase `message history WA` table using the existing client
- Responsive: on mobile, show contact list first, then chat view when a contact is tapped (with back button)

#### 2. Route in `src/App.tsx`
- Add route `/whatsapp-history` wrapped in `DashboardLayout`
- Lazy-loaded like other pages

#### 3. Sidebar Navigation in `src/components/dashboard/Sidebar.tsx`
- Add "WhatsApp" nav item with the `MessageSquare` icon from lucide-react
- Position it after "Call Log" in the navigation list
- Visible to all authenticated users (not restricted)

### Message Parsing Logic
Each `message` field will be split by the "USER - " and "AI - " prefixes to create individual chat bubbles:
```
"USER - Hi Sarah\nCan you share the JD?\n\nAI - Sure! The role is..."
```
Becomes two bubbles:
1. User bubble: "Hi Sarah\nCan you share the JD?"
2. AI bubble: "Sure! The role is..."

### Technical Details
- No database changes needed -- the table and RLS policies already exist (though RLS is not enabled on this table, which is fine for now since authenticated users already have access)
- Uses `supabase` client from `@/integrations/supabase/client`
- Groups messages by phone number client-side after fetching
- Contact list sorted by most recent message first
- Uses existing UI components: Card, ScrollArea, Avatar, Badge, Input, Button
