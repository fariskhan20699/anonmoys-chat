# Net Less | Development Task Plan

## 1. Purpose

This document breaks the Net Less project into small, practical development tasks.

The project should be built incrementally. Complete and test one stage before moving to the next.

---

## 2. Phase 1 | Project Setup

### Tasks

- [ ] Create the main `netless` project folder.
- [ ] Initialize Git.
- [ ] Create `client` and `server` folders.
- [ ] Initialize the Node.js project.
- [ ] Install required dependencies.
- [ ] Configure Vite for the frontend.
- [ ] Configure the Node.js/Express server.
- [ ] Add Socket.IO.
- [ ] Create `.gitignore`.
- [ ] Create basic `README.md`.
- [ ] Create `docs` folder.
- [ ] Add project documentation files.

### Completion Criteria

- Frontend can start successfully.
- Backend can start successfully.
- Git repository works.
- No unnecessary dependencies are installed.

---

## 3. Phase 2 | Frontend Foundation

### Tasks

- [ ] Create `index.html`.
- [ ] Create CSS reset.
- [ ] Create CSS variables.
- [ ] Create global styles.
- [ ] Create reusable button styles.
- [ ] Create reusable input styles.
- [ ] Create card styles.
- [ ] Create responsive layout rules.
- [ ] Create application entry point.
- [ ] Create basic state management.
- [ ] Create simple client-side navigation.

### Completion Criteria

- Layout works on desktop and mobile.
- Components use consistent styling.
- Navigation can switch between application views.

---

## 4. Phase 3 | Welcome Screen

### Tasks

- [ ] Build Welcome screen.
- [ ] Add Monkey Name input.
- [ ] Add Continue button.
- [ ] Validate empty name.
- [ ] Trim unnecessary spaces.
- [ ] Store the temporary name in client state.
- [ ] Display validation errors.
- [ ] Test keyboard interaction.

### Completion Criteria

A user can enter a valid Monkey Name and continue to the Dashboard.

---

## 5. Phase 4 | Dashboard

### Tasks

- [ ] Build Dashboard.
- [ ] Display current Monkey Name.
- [ ] Add Create Room action.
- [ ] Add Join Room action.
- [ ] Add Help & Support action.
- [ ] Add Change Name action.
- [ ] Make primary actions visually clear.
- [ ] Test navigation between sections.

### Completion Criteria

All Dashboard actions navigate to the correct screen.

---

## 6. Phase 5 | Room Backend

### Tasks

- [ ] Create room store.
- [ ] Create room generation service.
- [ ] Generate unique 9-character room codes.
- [ ] Add optional 4-digit room password.
- [ ] Store host information.
- [ ] Store participant information.
- [ ] Add room creation logic.
- [ ] Add room lookup logic.
- [ ] Add room deletion/close logic.
- [ ] Add server-side validation.

### Completion Criteria

The server can safely create, find, and close temporary rooms.

---

## 7. Phase 6 | Create Room UI

### Tasks

- [ ] Build Create Room screen.
- [ ] Display generated room code.
- [ ] Add Copy Code button.
- [ ] Add Copy Link button.
- [ ] Generate QR code.
- [ ] Add optional password field.
- [ ] Display participants.
- [ ] Add Open Chat button.
- [ ] Add Close Room button.
- [ ] Add close room confirmation.

### Completion Criteria

A host can create a room and share its code/link/QR code.

---

## 8. Phase 7 | Join Room UI

### Tasks

- [ ] Build Join Room screen.
- [ ] Add room code input.
- [ ] Validate 9 character code.
- [ ] Add Join Room button.
- [ ] Add Scan QR Code button.
- [ ] Handle password-protected rooms.
- [ ] Show useful join errors.
- [ ] Add Back button.

### Completion Criteria

A guest can enter a valid room code and join an active room.

---

## 9. Phase 8 | Socket.IO Connection

### Tasks

- [ ] Create Socket.IO client connection.
- [ ] Create Socket.IO server connection handler.
- [ ] Implement room join event.
- [ ] Implement room leave event.
- [ ] Implement disconnect handling.
- [ ] Implement reconnection behavior.
- [ ] Broadcast participant changes.
- [ ] Validate room membership on the server.

### Completion Criteria

Multiple devices connected to the same server can enter the same room and see participant changes.

---

## 10. Phase 9 | Chat

### Tasks

- [ ] Build Chat screen.
- [ ] Add room header.
- [ ] Add connection status.
- [ ] Add participant count.
- [ ] Add Leave button.
- [ ] Add message list.
- [ ] Add message input.
- [ ] Add Send button.
- [ ] Add emoji/menu area if required.
- [ ] Implement outgoing messages.
- [ ] Implement incoming messages.
- [ ] Display sender names.
- [ ] Sanitize message content.
- [ ] Validate message length.
- [ ] Prevent unauthorized room messages.

### Completion Criteria

Users in the same room can exchange messages in real time.

---

## 11. Phase 10 | Help & Support

### Tasks

- [ ] Build Help & Support screen.
- [ ] Add "How to join a room".
- [ ] Add "How to host a room".
- [ ] Add "Connection problems".
- [ ] Add "Report a problem".
- [ ] Add Back button.
- [ ] Keep help content short and actionable.

### Completion Criteria

A user can find basic instructions without leaving the application.

---

## 12. Phase 11 | Report Problem

### Tasks

- [ ] Build Report Problem screen.
- [ ] Add Name field.
- [ ] Add Email field.
- [ ] Add Subject field.
- [ ] Add Description field.
- [ ] Validate all required fields.
- [ ] Validate email format.
- [ ] Add Send Report button.
- [ ] Add success feedback.
- [ ] Add failure feedback.
- [ ] Add Back to Help button.
- [ ] Create server side report endpoint/service if required.

### Completion Criteria

A valid problem report can be submitted and the user receives clear feedback.

---

## 13. Phase 12 | QR Code

### Tasks

- [ ] Select a QR library.
- [ ] Generate QR code for room joining.
- [ ] Encode the required room information.
- [ ] Add QR scanner support if supported by the target browser.
- [ ] Validate scanned room information.
- [ ] Handle camera permission errors.
- [ ] Provide manual room code entry as a fallback.

### Completion Criteria

A user can share a room through QR and another user can use the QR to reach the room.

---

## 14. Phase 13 | Validation and Security

### Tasks

- [ ] Validate all client inputs.
- [ ] Repeat important validation on the server.
- [ ] Validate Monkey Name.
- [ ] Validate room code.
- [ ] Validate room password.
- [ ] Validate chat messages.
- [ ] Validate report fields.
- [ ] Prevent unauthorized room access.
- [ ] Do not trust client-provided host permissions.
- [ ] Sanitize user generated text.
- [ ] Avoid storing unnecessary personal information.
- [ ] Keep secrets out of Git.
- [ ] Add environment configuration where needed.

### Completion Criteria

Invalid or unauthorized requests are rejected safely by the server.

---

## 15. Phase 14 — Error Handling

### Tasks

- [ ] Create common error format.
- [ ] Handle invalid room codes.
- [ ] Handle closed rooms.
- [ ] Handle wrong passwords.
- [ ] Handle connection failures.
- [ ] Handle server errors.
- [ ] Handle duplicate room codes.
- [ ] Handle invalid messages.
- [ ] Display user friendly error messages.
- [ ] Add retry/reconnect behavior where appropriate.

### Completion Criteria

Users receive useful feedback instead of unexplained failures.

---

## 16. Phase 15 | Responsive UI

### Tasks

- [ ] Test Welcome screen on mobile.
- [ ] Test Dashboard on mobile.
- [ ] Test Create Room on mobile.
- [ ] Test Join Room on mobile.
- [ ] Test Chat on mobile.
- [ ] Test Help screen on mobile.
- [ ] Test Report screen on mobile.
- [ ] Fix horizontal overflow.
- [ ] Check button sizes.
- [ ] Check input sizes.
- [ ] Check chat composer on small screens.
- [ ] Test desktop layouts.

### Completion Criteria

The application remains usable across supported screen sizes.

---

## 17. Phase 16 | Testing

### Unit Testing

- [ ] Test room code generation.
- [ ] Test room validation.
- [ ] Test password validation.
- [ ] Test message validation.
- [ ] Test report validation.

### Integration Testing

- [ ] Test create room flow.
- [ ] Test join room flow.
- [ ] Test password protected room.
- [ ] Test leave room flow.
- [ ] Test close room flow.
- [ ] Test participant updates.
- [ ] Test real time messaging.

### Manual Testing

- [ ] Test on the host device.
- [ ] Test on a second device.
- [ ] Test using the same Wi-Fi network.
- [ ] Test using a mobile hotspot.
- [ ] Test wrong room code.
- [ ] Test wrong password.
- [ ] Test closed room.
- [ ] Test connection loss.
- [ ] Test reconnection.

---

## 18. Phase 17 | Local Network Testing

### Tasks

- [ ] Find the host computer's local IP.
- [ ] Start the backend on the local network interface.
- [ ] Allow required firewall access.
- [ ] Connect another device to the same WiFi/hotspot.
- [ ] Open the frontend from the second device.
- [ ] Create a room.
- [ ] Join from the second device.
- [ ] Exchange messages.
- [ ] Test leaving and reconnecting.

### Completion Criteria

Two or more devices on the same local network can use Net Less successfully.

---

## 19. Phase 18 | GitHub Preparation

### Tasks

- [ ] Review source code.
- [ ] Remove debug code.
- [ ] Remove unnecessary files.
- [ ] Confirm `.gitignore`.
- [ ] Add useful README instructions.
- [ ] Add setup instructions.
- [ ] Add project screenshots if desired.
- [ ] Add architecture documentation.
- [ ] Add design documentation.
- [ ] Add task documentation.
- [ ] Commit changes.
- [ ] Push to GitHub.

### Suggested Commit Style

```text
feat: add room creation
feat: add realtime chat
fix: validate room password
fix: handle socket reconnect
style: improve chat layout
docs: update architecture
test: add room validation tests
```

---

## 20. Phase 19 | Final Review

Before declaring the MVP complete:

- [ ] Welcome flow works.
- [ ] Dashboard works.
- [ ] Room creation works.
- [ ] Room joining works.
- [ ] Password protection works.
- [ ] QR sharing works.
- [ ] Participant list works.
- [ ] Real-time chat works.
- [ ] Leave room works.
- [ ] Close room works.
- [ ] Help works.
- [ ] Problem reporting works.
- [ ] Validation works.
- [ ] Error handling works.
- [ ] Reconnection works.
- [ ] Responsive UI works.
- [ ] Two-device testing passes.
- [ ] Documentation is updated.
- [ ] GitHub repository is clean.

---

## 21. Future Tasks

These are not required for the initial MVP.

Possible future improvements:

- [ ] Message timestamps.
- [ ] Typing indicator.
- [ ] Read/delivery indicators.
- [ ] File sharing.
- [ ] Image sharing.
- [ ] Voice messages.
- [ ] Multiple room administration features.
- [ ] Persistent chat history.
- [ ] User profiles.
- [ ] Authentication.
- [ ] Cloud deployment.
- [ ] Database persistence.
- [ ] Push notifications.
- [ ] PWA support.
- [ ] End to end encryption research.
- [ ] Advanced moderation tools.

Future features should only be added after the core MVP is stable.

---

## 22. Recommended Development Order

Follow this order to avoid unnecessary complexity:

```text
1. Project Setup
       ↓
2. Frontend Foundation
       ↓
3. Welcome
       ↓
4. Dashboard
       ↓
5. Room Backend
       ↓
6. Create Room
       ↓
7. Join Room
       ↓
8. Socket.IO
       ↓
9. Chat
       ↓
10. Help & Support
       ↓
11. Report Problem
       ↓
12. QR
       ↓
13. Security & Validation
       ↓
14. Error Handling
       ↓
15. Responsive UI
       ↓
16. Testing
       ↓
17. Local Network Testing
       ↓
18. GitHub Preparation
       ↓
19. Final Review
```

---

## 23. Definition of Done

A task is considered complete only when:

1. The feature is implemented.
2. The UI works correctly.
3. Client side validation is present where needed.
4. Server side validation is present where needed.
5. Errors are handled.
6. The feature has been tested.
7. Existing features still work.
8. Code is reasonably clean.
9. Documentation is updated when necessary.
10. The change is ready to commit.

---

## 24. Final Rule

Build Net Less in small working pieces.

Do not build the entire application at once.

The preferred cycle is:

```text
Plan
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
Commit
```

A simple working feature is more valuable than a large unfinished feature.