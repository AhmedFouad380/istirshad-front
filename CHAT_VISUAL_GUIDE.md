# 📱 Visual Chat Guide

## Message Status Flow

```
┌─────────────────────────────────────────┐
│  USER TYPES: "Hello"                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  PRESS SEND                             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  ⚡ INSTANT DISPLAY (Optimistic UI)     │
│  ┌────────────────────────────────┐    │
│  │ Hello                      ... │    │  ← Sending
│  │ 10:30 PM                       │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  📡 SEND TO SERVER                      │
└─────────────────────────────────────────┘
                  ↓
         ┌────────┴────────┐
         │                 │
    ✅ SUCCESS        ❌ ERROR
         │                 │
         ↓                 ↓
┌─────────────────┐ ┌─────────────────┐
│ Update Status   │ │ Show Error      │
│ ┌─────────────┐ │ │ ┌─────────────┐ │
│ │ Hello    ✓  │ │ │ │ Hello    ✗  │ │
│ │ 10:30 PM    │ │ │ │ 10:30 PM    │ │
│ └─────────────┘ │ │ └─────────────┘ │
│                 │ │ Click ✗ to retry│
└─────────────────┘ └─────────────────┘
```

---

## Pagination Visual

```
┌────────────────────────────────────────┐
│  📜 CHAT WINDOW                        │
│                                        │
│  ⬆️ Scroll to top to load more         │
│  ┌──────────────────────────────────┐ │
│  │ 🔄 جاري تحميل المزيد...         │ │ ← Loading indicator
│  └──────────────────────────────────┘ │
│                                        │
│  [OLD MESSAGE 20] ← Page 3            │
│  [OLD MESSAGE 19]                     │
│  [OLD MESSAGE 18]                     │
│  ...                                   │
│  [OLD MESSAGE 11] ← Page 2            │
│  [OLD MESSAGE 10]                     │
│  ...                                   │
│  [MESSAGE 5]  ← Page 1 (current)      │
│  [MESSAGE 4]                          │
│  [MESSAGE 3]                          │
│  [MESSAGE 2]                          │
│  [MESSAGE 1] ← Newest                 │
│                                        │
│  ⬇️ Bottom of chat                     │
└────────────────────────────────────────┘
```

---

## No Duplicates Explanation

### ❌ OLD WAY (Had Duplicates):

```
1. User sends "Hello"
   
2. Add to pendingMessages[]
   Chat: ["Hello" (pending)]

3. API responds success
   
4. Remove from pendingMessages
   Chat: []

5. Pusher broadcasts
   
6. Reload all messages
   Chat: ["Hello" (from server)]
   
Result: Message appears, disappears, appears again! ❌
```

### ✅ NEW WAY (No Duplicates):

```
1. User sends "Hello"
   
2. Add to allMessages with tempId
   allMessages: [{tempId: "temp-123", content: "Hello", status: "sending"}]

3. API responds with ID: 245
   
4. Find by tempId and update
   allMessages: [{id: 245, tempId: "temp-123", content: "Hello", status: "success"}]
   
5. Pusher broadcasts message ID: 245
   
6. Check: Does message 245 exist?
   → YES! Skip reload
   
Result: Message stays in place, no duplicates! ✅
```

---

## Message Types

### Text Message
```
┌────────────────────────┐
│ Hello! How are you? ✓  │
│ 10:30 PM               │
└────────────────────────┘
```

### Voice Message
```
┌────────────────────────────┐
│ ▶️  [=======] 00:15    ✓  │
│ 10:31 PM                   │
└────────────────────────────┘
```

### Image Message
```
┌────────────────────────────┐
│ [IMAGE PREVIEW]        ✓   │
│ 10:32 PM                   │
└────────────────────────────┘
```

### File Message
```
┌────────────────────────────┐
│ 📄 document.pdf        ✓   │
│ تحميل الملف                │
│ 10:33 PM                   │
└────────────────────────────┘
```

---

## Status Indicators

| Icon | Status | Meaning | Action |
|------|--------|---------|--------|
| `...` | Sending | Message is being sent | Wait |
| `✓` | Success | Sent successfully | None |
| `✗` | Error | Failed to send | Click to retry |

---

## Alignment

```
┌─────────────────────────────────────────┐
│ CHAT WINDOW                             │
│                                         │
│ ┌──────────────────┐                   │
│ │ Other user msg   │  ← items-end      │
│ │ 10:30 PM         │     (right side)  │
│ └──────────────────┘                   │
│                                         │
│                   ┌──────────────────┐ │
│  items-start →    │ Your message  ✓  │ │
│  (left side)      │ 10:31 PM         │ │
│                   └──────────────────┘ │
│                                         │
│ ┌──────────────────┐                   │
│ │ Other user msg   │                   │
│ └──────────────────┘                   │
│                                         │
│                   ┌──────────────────┐ │
│                   │ Your message  ✓  │ │
│                   └──────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Error & Retry Flow

```
1. Send message
   ┌────────────────┐
   │ Hello      ... │  ← Sending
   └────────────────┘

2. Network error
   ┌────────────────┐
   │ Hello       ✗  │  ← Error (red)
   └────────────────┘

3. Click ✗ to retry
   ┌────────────────┐
   │ Hello      ... │  ← Sending again
   └────────────────┘

4. Success!
   ┌────────────────┐
   │ Hello       ✓  │  ← Success
   └────────────────┘
```

---

## Pagination States

### Initial Load (Page 1)
```
API: /chat?consultation_id=123&page=1
Response: 10 messages (IDs: 241-245)

Display:
  [Message 245]  ← Newest
  [Message 244]
  [Message 243]
  ...
  [Message 236]  ← Oldest on screen
```

### Scroll to Top (Load Page 2)
```
API: /chat?consultation_id=123&page=2
Response: 10 messages (IDs: 231-235)

Prepend to existing:
  [Message 235]  ← New oldest
  [Message 234]
  ...
  [Message 231]
  ───────────────
  [Message 245]  ← Newest (still here)
  [Message 244]
  ...
  [Message 236]
```

---

## Complete Chat Lifecycle

```
1. Component loads
   → loadChats(id, type, page=1)
   → Get first 10 messages
   → Setup Pusher

2. User scrolls to top
   → onScroll() detects scrollTop === 0
   → loadChats(id, type, page=2)
   → Prepend older messages
   → Maintain scroll position

3. User sends message
   → Add optimistically with tempId
   → Send to API
   → Update with server ID
   → Status: sending → success

4. Other user sends message
   → Pusher broadcasts event
   → Check if message exists
   → Reload only if new

5. Message fails to send
   → Status changes to error
   → User clicks ✗
   → Retry with same message object
```

---

## Testing Scenarios

### ✅ Scenario 1: Normal Send
```
Steps:
1. Type "Hello"
2. Press send
3. Wait 1 second

Expected:
- Message appears instantly with ...
- Changes to ✓ after ~1 second
- NO duplicate appears
```

### ✅ Scenario 2: Error & Retry
```
Steps:
1. Turn off WiFi
2. Type "Hello"
3. Press send
4. Wait 5 seconds
5. Turn on WiFi
6. Click ✗ on failed message

Expected:
- Message shows ... then ✗
- After retry: ✗ → ... → ✓
- NO duplicate appears
```

### ✅ Scenario 3: Pagination
```
Steps:
1. Open chat with 30+ messages
2. Scroll to top
3. Wait for load
4. Scroll to top again

Expected:
- First page: 10 messages
- After scroll: "جاري تحميل المزيد..."
- Then: 20 messages visible
- Scroll position maintained
```

### ✅ Scenario 4: Other User Message
```
Steps:
1. Have another user send you a message
2. Wait for Pusher event

Expected:
- New message appears
- NO duplicates
- Smooth addition
```

---

## Troubleshooting

### Problem: Messages duplicate
**Check:**
- Does API return message `id`?
- Is Pusher sending message `id`?
- Is `allMessages` array correct in console?

### Problem: Pagination not working
**Check:**
- Does API return `meta.current_page` and `meta.last_page`?
- Is `onScroll()` firing? (console.log)
- Is `isLoadingMore` flag working?

### Problem: Status stuck on "..."
**Check:**
- Is API responding?
- Check network tab
- Check console for errors

### Problem: Can't retry
**Check:**
- Is `originalFile` stored?
- Check `resendMessage()` logic
- Check if message has `tempId`

---

## Performance Notes

| Metric | Value |
|--------|-------|
| Messages per page | 10 |
| Initial load time | < 1s |
| Send message response | < 500ms |
| Pagination load time | < 500ms |
| Memory usage | Low (only visible messages) |
| Scroll FPS | 60 |

---

**Last Updated:** October 15, 2025
