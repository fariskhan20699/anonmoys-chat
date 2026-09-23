# Net Less | Product Requirements Document

## 1. Product Overview

**Net Less** is a lightweight local network chat application for people who are connected to the same WiFi network or mobile hotspot.

The core idea is simple:

> People on the same local network should be able to create or join a temporary chat room without depending on a traditional internet-based chat service.

A host creates a room, receives a unique room code and QR code, and shares either with other people. Guests join with the code or QR scan and can then exchange real time messages.

---

## 2. Problem Being Solved

People sometimes need quick communication with nearby users but may have limited or no internet access.

Examples:

- Students connected to the same campus WiFi.
- People sharing a mobile hotspot.
- A classroom or lab where devices are on the same local network.
- Small temporary groups that do not want to create accounts.
- Local events where a temporary chat room is useful.
- Testing/demo situations where internet access should not be required.

Net Less focuses on **local, temporary communication** instead of building a permanent social network.

---

## 3. Target Users

### Primary Users

- Students
- Friends in the same location
- Small teams
- Classroom/lab groups
- Event participants
- People sharing a hotspot

### Secondary Users

- Developers testing local real time communication
- Teachers demonstrating networking concepts
- Small temporary groups needing a quick chat

---

## 4. Core User Flow

### Host Flow

1. Open Net Less.
2. Enter a display name / Monkey Name.
3. Click **Continue**.
4. Select **Create a room**.
5. A room is created.
6. The system generates a unique room code.
7. The system generates a QR code representing the join information.
8. Optionally set a 4 digit room password.
9. Share the code, link, or QR code.
10. Other users join.
11. Host opens the chat.
12. Host sends and receives real time messages.
13. Host can close the room.

### Guest Flow

1. Open Net Less.
2. Enter a display name.
3. Click **Continue**.
4. Select **Join a room**.
5. Enter the 9 character room code OR scan the QR code.
6. If password protection is enabled, enter the password.
7. Join the room.
8. Enter the chat.
9. Send and receive real-time messages.
10. Leave the room when finished.

---

## 5. Main Screens

### Welcome Screen

Contains:

- Net Less branding
- Monkey Name input
- Continue button

### Room Dashboard

Contains:

- Create a room
- Join a room
- Help & Support
- Change name

### Host Room Screen

Contains:

- Room code
- Copy code
- Copy link
- QR code
- Optional 4 digit password
- People in the room
- Online status
- Open chat
- Close room

### Join Room Screen

Contains:

- 9-character room code input
- Join room button
- Scan QR code button
- Back link

### Chat Screen

Contains:

- Room code
- Participant indicators
- Leave button
- Connection status
- Incoming messages
- Own messages
- Message input
- Emoji/attachment control
- Send button

### Help & Support

Contains:

- How to join a room
- How to host a room
- Connection problems
- Report a problem
- Back link

### Report a Problem

Contains:

- Name
- Email
- Problem subject
- Description
- Send Report
- Back to Help

---

## 6. Core Features

### Required MVP Features

- Display-name based identity
- Create room
- Unique room code
- Join room by code
- QR-based joining
- Optional 4 digit room password
- Real time messaging
- Online participant list/status
- Copy room code
- Copy join link
- Leave room
- Close room
- Connection status
- Basic validation
- Help/support pages
- Problem report form
- Responsive UI

### Future Features

These should not be implemented in the first MVP unless explicitly added to the task plan:

- File sharing
- Image sharing
- Voice messages
- Message reactions
- Message history database
- Persistent accounts
- End-to-end encryption
- Moderation roles
- Public rooms
- Push notifications

---

## 7. Important Product Constraints

- The primary use case is same WiFi / same hotspot communication.
- The MVP should not require a cloud database.
- Users should not need a permanent account.
- Room identity should be temporary.
- Room codes must be sufficiently difficult to guess.
- The application should clearly show connection state.
- Invalid room codes must produce understandable errors.
- Closed rooms must reject new joins.
- Password protected rooms must reject incorrect passwords.
- The UI should remain simple for beginner users.

---

## 8. Success Criteria

The MVP is successful when:

1. A host can create a room.
2. A second device on the same network can join it.
3. Both users can see each other.
4. Messages sent by one user appear for the other user in real time.
5. QR joining works.
6. Optional password protection works.
7. Leaving/closing rooms works correctly.
8. Invalid inputs produce useful errors.
9. The interface remains usable on desktop and mobile.