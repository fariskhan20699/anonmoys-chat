# Net Less | Project Memory

## 1. Purpose

This document stores important project decisions, conventions, assumptions, and implementation notes for Net Less.

The goal is to keep development consistent when the project grows or when work is continued later.

---

## 2. Project Identity

**Project Name:** Net Less

**Project Type:** Local network real time chat application

**Main Idea:**  
Allow users connected to the same Wi-Fi network or mobile hotspot to communicate through temporary chat rooms without requiring traditional user accounts.

---

## 3. Core Concept

Net Less uses a temporary identity called a **Monkey Name**.

Users do not need to create a permanent account for the MVP.

Basic flow:

```text
Enter Monkey Name
       ↓
    Dashboard
       ↓
Create Room / Join Room
       ↓
      Chat
```

---

## 4. User Identity

The user's temporary display name is called a **Monkey Name**.

Rules:

- Name is required.
- Leading/trailing spaces should be removed.
- Empty names are rejected.
- The name is used as a display identity inside the room.
- The MVP does not require permanent account registration.

Do not introduce traditional authentication unless it becomes a future requirement.

---

## 5. Room Rules

A room is temporary.

### Room Code

- Target length: 9 characters.
- It must be unique among active rooms.
- It should be easy to copy.
- It should be displayed clearly.
- The server is responsible for generating and validating room codes.

### Room Password

Password protection is optional.

If enabled:

- Password must contain exactly 4 digits.
- The server must validate the password.
- Do not trust a client-only password check.
- Do not store raw passwords unnecessarily.

### Room Lifecycle

```text
Create
  ↓
Active
  ↓
Users Join / Leave
  ↓
Host Closes Room
  ↓
Room Removed
```

The MVP uses temporary in memory room storage.

---

## 6. Host and Guest

### Host

The host creates the room.

The host can:

- Create the room
- Share the room code
- Share the room link
- Display the QR code
- View participants
- Open the chat
- Close the room

### Guest

A guest can:

- Enter a room code
- Scan a QR code
- Enter the room password if required
- Join the room
- Send messages
- Receive messages
- Leave the room

The server must enforce these permissions.

---

## 7. Technology Decisions

Current recommended stack:

### Frontend

- HTML
- CSS
- JavaScript
- Vite

### Backend

- Node.js
- Express
- Socket.IO

### Supporting Tools

- Git
- GitHub
- npm
- VS Code

### QR

Use a suitable QR generation/scanning library rather than implementing QR functionality from scratch.

---

## 8. Architecture Memory

The application is divided into:

```text
Frontend
   ↓
HTTP / Socket.IO
   ↓
Backend
   ↓
Room Store
```

The frontend handles:

- UI
- Navigation
- User input
- Client side validation
- Rendering messages
- Connection status

The backend handles:

- Room creation
- Room lookup
- Room membership
- Permissions
- Server side validation
- Socket connections
- Real time messages
- Room lifecycle

---

## 9. Server Authority

The server is the source of truth for important operations.

Never rely only on the frontend for:

- Room existence
- Room password
- Host permissions
- Room membership
- Message authorization
- Room closing
- Participant state

Client side validation improves UX.

Server side validation provides actual protection.

---

## 10. Data Persistence

The initial MVP should use in-memory storage.

Example conceptual structure:

```text
rooms
├── roomCode
│   ├── host
│   ├── password
│   ├── participants
│   └── createdAt
```

Data does not need to survive a server restart for the MVP.

A database can be introduced later if persistent rooms or chat history become requirements.

---

## 11. Chat Rules

Messages should:

- Be validated.
- Have a reasonable maximum length.
- Be sanitized before rendering.
- Be associated with a room.
- Be associated with a sender.
- Only be accepted from authorized room members.

The application should not trust raw HTML supplied by users.

---

## 12. Connection Behavior

The chat interface should show connection state.

Possible states:

```text
Connected
Connecting
Disconnected
Reconnecting
```

If the connection drops:

- Show a clear status.
- Attempt reconnection where appropriate.
- Avoid silently losing the user's context.
- Do not pretend the user is connected when the socket is not connected.

---

## 13. Network Assumption

The main MVP assumption is:

> Users are connected to the same local network.

Examples:

- Same Wi-Fi router
- Same mobile hotspot
- Local LAN

The project should not assume that every user has internet access.

Internet/cloud deployment can be added later.

---

## 14. Current UI Screens

The planned screens are:

```text
1. Welcome
2. Dashboard
3. Create Room
4. Join Room
5. Chat
6. Help & Support
7. Report Problem
```

Important UI actions include:

```text
Continue
Create Room
Join Room
Scan QR Code
Copy Code
Copy Link
Open Chat
Close Room
Leave
Send
Send Report
Back
Change Name
```

---

## 15. Design Memory

The design direction is:

- Modern
- Simple
- Friendly
- Responsive
- Minimal
- Easy for beginners

Use:

- Reusable components
- Consistent spacing
- Consistent buttons
- Clear input states
- Clear errors
- Clear connection status
- Responsive layouts

Avoid unnecessary visual complexity.

---

## 16. Validation Memory

### Monkey Name

```text
Required
Trim whitespace
Reject empty value
```

### Room Code

```text
Required
Expected 9 character format
Validate on server
```

### Password

```text
Optional
If supplied → exactly 4 digits
Validate on server
```

### Chat Message

```text
Required
Reasonable maximum length
Sanitize output
```

### Report

```text
Name → required
Email → required + valid format
Subject → required
Description → required
```

---

## 17. QR Memory

The QR code should contain enough information for the client to identify the room.

Possible approach:

```text
Net Less room link
        ↓
QR Code
        ↓
Scan
        ↓
Open Join Room
        ↓
Pre-fill room information
```

Manual room code entry must remain available as a fallback.

Camera permission failures should be handled clearly.

---

## 18. Error Handling Memory

Errors should explain:

```text
What happened
      +
Why it happened (when known)
      +
What the user can do next
```

Example:

```text
Could not join the room.

The room code may be incorrect or the room may have been closed.

Check the code and try again.
```

Avoid generic messages such as:

```text
Error 500
Something went wrong
```

when a more useful message is possible.

---

## 19. Git Memory

Use small, meaningful commits.

Examples:

```text
feat: add room creation
feat: add realtime chat
fix: validate room password
fix: handle socket reconnect
style: improve chat layout
docs: update architecture
test: add room validation tests
```

Do not commit:

- `.env` files containing secrets
- `node_modules`
- Temporary debug files
- Build artifacts unless intentionally required

---

## 20. Development Workflow

Preferred workflow:

```text
Read documentation
       ↓
Inspect existing code
       ↓
Plan small change
       ↓
Implement
       ↓
Run
       ↓
Test
       ↓
Fix
       ↓
Verify
       ↓
Update documentation
       ↓
Commit
```

Do not rewrite working parts of the project without a clear reason.

---

## 21. Testing Memory

Important testing scenario:

```text
Device A
  ↓
Create Room
  ↓
Share Code / QR
  ↓
Device B
  ↓
Join Room
  ↓
Chat
```

Test both devices on:

- Same Wi-Fi
- Mobile hotspot

Also test:

- Wrong room code
- Wrong password
- Closed room
- Leaving room
- Connection loss
- Reconnection
- Multiple participants

---

## 22. MVP Boundary

The MVP should focus on:

- Temporary names
- Temporary rooms
- Local network communication
- Room codes
- Optional 4 digit passwords
- QR sharing
- Real time text chat
- Participant information
- Basic help
- Problem reporting
- Responsive UI
- Basic validation and security

Do not expand the MVP unnecessarily.

---

## 23. Future Feature Ideas

Potential future features include:

- Persistent accounts
- Database storage
- Chat history
- File sharing
- Image sharing
- Voice messages
- Typing indicators
- Read receipts
- Push notifications
- PWA support
- Cloud deployment
- Advanced moderation
- End-to-end encryption research

These are future possibilities, not current MVP requirements.

---

## 24. Important Decisions Log

### Decision 1 | Temporary Identity

Use Monkey Name instead of permanent account registration.

**Reason:** Keep the first version fast and simple.

### Decision 2 | Temporary Rooms

Use temporary rooms stored in memory.

**Reason:** Persistent storage is not required for the initial local-network MVP.

### Decision 3 | Socket.IO

Use Socket.IO for real-time communication.

**Reason:** It simplifies room management, real-time events, and reconnection handling.

### Decision 4 | Server Authority

Keep important room and permission decisions on the server.

**Reason:** Client-side checks alone cannot be trusted.

### Decision 5 | Documentation-First Development

Maintain PRD, architecture, rules, design, task, and memory documentation.

**Reason:** Keep future development consistent and reduce accidental architectural changes.

---

## 25. Open Questions

These decisions can be finalized during implementation:

- Exact visual color palette
- Exact font family
- Exact QR library
- Exact room-code character set
- Maximum chat-message length
- Exact report-delivery mechanism
- Whether the frontend is served by the backend or separately during development
- Production deployment strategy

Do not make these decisions more complicated than necessary for the MVP.

---

## 26. Memory Update Rule

Whenever an important project decision changes, update this file.

Examples of changes worth recording:

- Technology changes
- Architecture changes
- Room rules
- Security rules
- UI navigation changes
- Data-storage decisions
- Important bug-related discoveries
- Major feature decisions

Do not record every small coding detail.

---

## 27. Current Project Principle

The project should remain:

```text
Simple
+
Fast
+
Local
+
Real-time
+
Understandable
+
Tested
```

When choosing between two implementation approaches, prefer the simpler approach that satisfies the documented requirements without weakening correctness or security.