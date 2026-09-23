# Net Less --- Architecture

## 1. Architecture Goal

Net Less should be organized so that the UI, server/network logic,
shared data models, and utilities are separated.

The architecture should make it easy to:

-   Debug one feature without breaking another.
-   Add features later.
-   Understand how data moves through the application.
-   Keep frontend code clean.
-   Keep networking code separate from UI code.

------------------------------------------------------------------------

## 2. Recommended Technology Stack

### Frontend

-   HTML
-   CSS
-   JavaScript
-   Vite for development/build tooling

### Backend / Local Network Server

-   Node.js
-   Express
-   Socket.IO

### Supporting libraries

-   QR code generation library
-   QR code scanning library
-   UUID/random ID utility if needed
-   Validation utilities only where they genuinely reduce complexity

### Development tools

-   Git
-   GitHub
-   VS Code
-   npm

------------------------------------------------------------------------

## 3. Why This Stack

### Node.js

Provides the local server runtime.

### Express

Handles HTTP routes and serves the application.

### Socket.IO

Handles real-time room membership and chat messages.

### Vite

Provides a fast frontend development environment and production build.

### QR library

Creates the room QR code.

### Git

Tracks versions and makes rollback easier.

------------------------------------------------------------------------

## 4. Project Structure

Recommended structure:

``` text
netless/
│
├── client/
│   ├── index.html
│   └── src/
│       ├── assets/
│       ├── css/
│       │   ├── reset.css
│       │   ├── variables.css
│       │   ├── global.css
│       │   └── components.css
│       │
│       ├── js/
│       │   ├── app.js
│       │   ├── state.js
│       │   ├── router.js
│       │   ├── api.js
│       │   ├── socket.js
│       │   ├── validation.js
│       │   ├── qr.js
│       │   └── utils.js
│       │
│       └── views/
│           ├── welcome.js
│           ├── dashboard.js
│           ├── createRoom.js
│           ├── joinRoom.js
│           ├── hostRoom.js
│           ├── chat.js
│           ├── help.js
│           └── reportProblem.js
│
├── server/
│   ├── server.js
│   ├── config.js
│   ├── routes/
│   │   └── health.js
│   ├── socket/
│   │   ├── connection.js
│   │   ├── rooms.js
│   │   └── chat.js
│   ├── services/
│   │   ├── roomService.js
│   │   └── reportService.js
│   ├── validation/
│   │   ├── roomValidation.js
│   │   └── messageValidation.js
│   └── store/
│       └── roomStore.js
│
├── shared/
│   ├── constants.js
│   └── types.js
│
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── rules.md
│   ├── design.md
│   ├── task.md
│   └── memory.md
│
├── tests/
├── .gitignore
├── package.json
└── README.md
```
# System Flow
```
                  NET LESS
                     │
              ┌──────┴──────┐
              │             │
          Frontend       Backend
              │             │
        HTML/CSS/JS     Node.js
              │             │
           Vite        Express + Socket.IO
              │             │
              └──────┬──────┘
                     │
                Room Service
                     │
                Room Store
                     │
              Local Network
                     │
          ┌──────────┼──────────┐
          │          │          │
        Host       Guest 1    Guest 2
          │          │          │
          └──────────┴──────────┘
                 Real-time Chat
```

------------------------------------------------------------------------

## 5. High Level Flow

``` text
User
  ↓
Frontend UI
  ↓
HTTP / Socket.IO
  ↓
Node.js Server
  ↓
Room Service
  ↓
In-Memory Room Store
  ↓
Other connected clients
```

The server is the central coordinator for a local network session.

------------------------------------------------------------------------

## 6. Create Room Flow

``` text
User enters name
      ↓
Frontend validates name
      ↓
POST /api/rooms
      ↓
Server validates request
      ↓
Generate unique room code
      ↓
Create room in roomStore
      ↓
Return room information
      ↓
Frontend displays code + QR
```

------------------------------------------------------------------------

## 7. Join Room Flow

``` text
User enters room code
        ↓
Frontend validates format
        ↓
POST /api/rooms/join
        ↓
Server checks room
        ↓
Room exists?
   ┌────┴────┐
  No         Yes
  ↓           ↓
Error     Password needed?
              ↓
          Validate password
              ↓
          Join room
              ↓
       Establish Socket.IO connection
```

------------------------------------------------------------------------

## 8. Chat Flow

``` text
Sender
  ↓
Message input
  ↓
Client validation
  ↓
Socket.IO emit("message")
  ↓
Server validates message
  ↓
Server identifies room
  ↓
Server broadcasts to room
  ↓
All connected clients receive message
  ↓
UI renders message
```

------------------------------------------------------------------------

## 9. Room State

A room should contain information similar to:

``` text
roomId
roomCode
hostId
passwordHash (only if password is enabled)
createdAt
participants[]
status
```

A participant can contain:

``` text
socketId
displayName
joinedAt
online
```

Do not store raw passwords.

------------------------------------------------------------------------

## 10. Connection Model

For the MVP:

-   One device starts the Node.js server.
-   Other devices connect to that host through the local network.
-   The server manages rooms and messages.
-   Clients communicate with the server using HTTP and Socket.IO.

This means Net Less is **local-network based**, not automatically a
peer-to-peer system.

------------------------------------------------------------------------

## 11. Important Network Considerations

The host device must be reachable from other devices.

Potential problems include:

-   Windows/Linux firewall blocking the server port.
-   Devices being connected to different networks.
-   Router/client isolation.
-   Mobile hotspot restrictions.
-   Incorrect local IP address.
-   Server listening only on `localhost`.

The server should listen on an appropriate network interface when LAN
access is required.

------------------------------------------------------------------------

## 12. Data Persistence

MVP:

-   Keep rooms in memory.
-   No permanent database required.
-   Restarting the server clears active rooms.

Future:

-   SQLite for optional persistence.
-   PostgreSQL only if the product later becomes internet/cloud based.

------------------------------------------------------------------------

## 13. Error Flow

Every network operation should follow:

``` text
Request
  ↓
Validate
  ↓
Execute
  ↓
Success OR controlled error
  ↓
Return structured response
  ↓
Frontend displays user-friendly message
```

Never expose stack traces or internal server details to normal users.
