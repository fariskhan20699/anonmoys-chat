# Net Less --- AI Development Rules

## 1. Purpose

This file defines the rules that the AI development assistant must
follow while building Net Less.

The AI must follow the project's:

-   `prd.md` for product requirements
-   `architecture.md` for technical architecture
-   `design.md` for visual design
-   `task.md` for implementation order
-   `memory.md` for important decisions, bugs, and project history

------------------------------------------------------------------------

# 2. Core Rules

1.  Read the relevant documentation before starting a task.
2.  Inspect existing code before modifying it.
3.  Do not rewrite the entire project for a small feature.
4.  Do not modify unrelated files.
5.  Do not remove working functionality without permission.
6.  Follow the documented architecture.
7.  Follow the documented design system.
8.  Keep the implementation simple and understandable.
9.  Test every meaningful feature.
10. Record important decisions and bugs in `memory.md`.

------------------------------------------------------------------------

# 3. Development Workflow

For every task, follow this order:

``` text
Understand
    ↓
Inspect Existing Code
    ↓
Plan
    ↓
Implement
    ↓
Test
    ↓
Fix
    ↓
Verify
    ↓
Update memory.md
```

Do not skip testing.

Do not declare a feature complete only because the code was written.

------------------------------------------------------------------------

# 4. Before Writing Code

Before implementing a feature, the AI must:

1.  Identify the relevant task in `task.md`.
2.  Read the related requirements in `prd.md`.
3.  Check `architecture.md`.
4.  Check relevant design rules in `design.md`.
5.  Inspect the existing implementation.
6.  Identify which files actually need modification.
7.  Explain the implementation plan briefly.

Do not immediately start changing files without understanding the
existing project.

------------------------------------------------------------------------

# 5. Code Quality Rules

Write code that is:

-   Simple
-   Readable
-   Modular
-   Maintainable
-   Reusable

Prefer:

-   Meaningful variable names
-   Meaningful function names
-   Small focused functions
-   Reusable utilities
-   Clear module boundaries
-   `async/await` for asynchronous JavaScript

Avoid:

-   Unnecessary abstractions
-   Extremely long functions
-   Duplicate logic
-   Unnecessary dependencies
-   Complex code when a simpler solution exists
-   Copy-pasting the same logic into multiple files

------------------------------------------------------------------------

# 6. JavaScript Rules

Use modern JavaScript.

Prefer:

``` js
const
let
async
await
```

Avoid unnecessary global variables.

Keep application state in the appropriate state module.

Keep API communication separate from UI rendering.

Keep Socket.IO communication separate from normal UI logic.

------------------------------------------------------------------------

# 7. Frontend Rules

The frontend is responsible for:

-   UI
-   User interaction
-   Client-side validation
-   Displaying application state
-   Sending requests
-   Receiving server updates

The frontend must NOT be trusted for security decisions.

For example:

``` text
Frontend says:
"I am the host."

Server must verify:
"Are you actually the host?"
```

------------------------------------------------------------------------

# 8. Backend Rules

The backend is responsible for:

-   Room creation
-   Room validation
-   Room membership
-   Host permissions
-   Password verification
-   Message validation
-   Socket communication
-   Server-side security

The server is the final authority.

Never rely only on frontend validation.

------------------------------------------------------------------------

# 9. Validation Rules

Important user input must be validated on both:

### Client

Used for fast user feedback.

### Server

Used for security and correctness.

Examples:

-   Display name
-   Room code
-   Password
-   Message
-   Email
-   Report description

------------------------------------------------------------------------

# 10. Name Validation

A display name must:

-   Not be empty
-   Be trimmed
-   Have a reasonable maximum length
-   Not contain unsafe content

Example:

``` text
"   Faris   "
```

should become:

``` text
"Faris"
```

Do not allow an empty name after trimming.

------------------------------------------------------------------------

# 11. Room Code Rules

Room codes must:

-   Have the documented length
-   Follow the documented character format
-   Be randomly generated
-   Be checked for uniqueness
-   Be validated on the server

Do not use predictable sequential room codes such as:

``` text
ROOM001
ROOM002
ROOM003
```

------------------------------------------------------------------------

# 12. Password Rules

Room passwords must never be stored as plain text when a persistent
storage mechanism is introduced.

For the MVP:

-   Password must contain exactly 4 digits.
-   Validate the format on the client.
-   Validate the format again on the server.
-   Never send the password to unrelated clients.
-   Never place the password inside a QR code.

If password hashing is required, use a well-established cryptographic
library rather than creating a custom hashing algorithm.

------------------------------------------------------------------------

# 13. Chat Message Rules

Messages must:

-   Not be empty
-   Be trimmed where appropriate
-   Have a maximum length
-   Be validated on the server
-   Be safely rendered

Never directly insert untrusted message content into HTML.

Avoid unsafe patterns such as:

``` js
element.innerHTML = userMessage;
```

Prefer safe text rendering such as:

``` js
element.textContent = userMessage;
```

unless content has been explicitly sanitized.

------------------------------------------------------------------------

# 14. Socket.IO Rules

Before accepting a real time action, the server must verify:

1.  The socket is connected.
2.  The requested room exists.
3.  The room is active.
4.  The user belongs to the room.
5.  The action is allowed for that user.

For host-only operations, verify host ownership on the server.

Example:

``` text
Close Room
    ↓
Socket sends request
    ↓
Server checks socket
    ↓
Server checks room
    ↓
Server checks host
    ↓
Allow / Reject
```

------------------------------------------------------------------------

# 15. Room Rules

A room should have a clear lifecycle:

``` text
Created
   ↓
Active
   ↓
Closed
```

Once a room is closed:

-   New users cannot join.
-   Existing users are informed.
-   Chat activity should stop.
-   The room should eventually be removed from active memory.

------------------------------------------------------------------------

# 16. Error Handling

Errors must be controlled and predictable.

Use structured error codes such as:

``` text
NAME_REQUIRED
NAME_TOO_LONG

INVALID_ROOM_CODE
ROOM_NOT_FOUND
ROOM_CLOSED

PASSWORD_REQUIRED
INVALID_PASSWORD

MESSAGE_EMPTY
MESSAGE_TOO_LONG

NOT_ROOM_MEMBER
NOT_ROOM_HOST

NETWORK_ERROR
SERVER_ERROR
```

The frontend should convert technical errors into friendly messages.

Example:

``` text
ROOM_NOT_FOUND
        ↓
"Room not found. Please check the room code."
```

Never show raw server stack traces to normal users.

------------------------------------------------------------------------

# 17. Error Recovery

Whenever possible, an error should tell the user:

1.  What went wrong.
2.  Why it happened.
3.  What they can do next.

Bad:

``` text
Error 400
```

Better:

``` text
Room not found.
Please check the room code and try again.
```

------------------------------------------------------------------------

# 18. Loading States

Every operation that may take noticeable time should have an appropriate
loading state.

Examples:

``` text
Creating room...
Joining room...
Connecting...
Sending...
Submitting report...
```

Prevent duplicate actions while an operation is in progress.

For example, the user should not be able to create five rooms by rapidly
clicking the Create button.

------------------------------------------------------------------------

# 19. UI Rules

Follow `design.md`.

Do not introduce random colors, fonts, shadows, or border styles.

Maintain:

-   Consistent spacing
-   Consistent typography
-   Consistent buttons
-   Consistent cards
-   Consistent inputs
-   Consistent error states
-   Responsive behavior

Do not redesign existing screens unless the task specifically asks for a
redesign.

------------------------------------------------------------------------

# 20. Accessibility Rules

Every important interactive element should be usable with a keyboard.

Inputs should have labels.

Buttons should have meaningful names.

Focus states must remain visible.

Do not rely only on color to communicate:

-   Errors
-   Online state
-   Success
-   Warnings

Use text, icons, or other indicators when appropriate.

------------------------------------------------------------------------

# 21. QR Code Rules

QR codes should contain only the minimum information required to join a
room.

Do NOT put:

-   Passwords
-   Private user information
-   Server secrets
-   Authentication secrets

inside the QR code.

The server must still validate all information received from a QR scan.

------------------------------------------------------------------------

# 22. Library Rules

Use the documented technology stack unless there is a strong reason to
change it.

Preferred core stack:

-   Node.js
-   Express
-   Socket.IO
-   Vite
-   HTML
-   CSS
-   JavaScript
-   QR generation/scanning library

Before installing a new library, ask:

1.  Is it actually required?
2.  Can the functionality be implemented simply without it?
3.  Is an existing dependency already capable of doing it?
4.  Does the library fit the project architecture?
5.  Does it introduce unnecessary complexity?

Do not install libraries just because they are popular.

------------------------------------------------------------------------

# 23. Dependency Rules

When adding a dependency:

-   Explain why it is required.
-   Use a stable and maintained package.
-   Keep its usage limited to the relevant feature.
-   Update `package.json`.
-   Test the application after installation.

Never add dependencies silently.

------------------------------------------------------------------------

# 24. Security Rules

Never expose:

-   API secrets
-   Private keys
-   Passwords
-   Environment secrets
-   Internal server information

Do not commit `.env` files containing secrets.

Use:

``` text
.env
```

and include it in `.gitignore` when appropriate.

Use:

``` text
.env.example
```

for documenting required environment variables without real secrets.

------------------------------------------------------------------------

# 25. Local Network Rules

Net Less is designed primarily for local WiFi/hotspot communication.

If another device cannot connect, investigate:

1.  Same WiFi/hotspot?
2.  Correct local IP?
3.  Correct server port?
4.  Server running?
5.  Firewall blocking connection?
6.  Router/client isolation?
7.  Hotspot restrictions?

Do not automatically assume that every connection problem is a
JavaScript bug.

------------------------------------------------------------------------

# 26. Testing Rules

Every meaningful feature must be tested.

Test at least:

### Happy path

The normal successful scenario.

### Invalid input

Incorrect or missing values.

### Failure path

Server/network failure.

### Edge cases

Examples:

-   Empty message
-   Very long message
-   Invalid room code
-   Closed room
-   Wrong password
-   Disconnect during chat
-   Duplicate button click

------------------------------------------------------------------------

# 27. Two-Device Testing

Networking features must eventually be tested using two devices.

Example:

``` text
Device A
↓
Create Room
↓
Room Code
↓
Device B
↓
Join Room
↓
Chat
```

Then test:

``` text
A → B message
B → A message
B leaves
A sees participant update
A closes room
B receives room-closed event
```

A feature should not be considered fully verified until the real network
scenario works.

------------------------------------------------------------------------

# 28. Git Rules

Use small, meaningful commits.

Examples:

``` text
feat: add room creation
feat: add room code validation
feat: add join room flow
feat: add socket chat
feat: add QR joining

fix: handle invalid room code
fix: prevent duplicate message send
fix: handle socket disconnect

style: improve chat responsive layout

docs: update architecture
docs: update task plan
```

Do not create commits with vague messages such as:

``` text
update
changes
fix stuff
final
```

------------------------------------------------------------------------

# 29. Change Discipline

When modifying existing functionality:

1.  Understand the current implementation.
2.  Identify dependencies.
3.  Make the smallest reasonable change.
4.  Test affected functionality.
5.  Test nearby functionality.
6.  Update documentation if the architecture changes.
7.  Update `memory.md` if the decision is important.

------------------------------------------------------------------------

# 30. Documentation Rules

If implementation changes the architecture, update:

``` text
architecture.md
```

If implementation changes a product requirement, update:

``` text
prd.md
```

If implementation changes visual design, update:

``` text
design.md
```

If implementation changes the task sequence, update:

``` text
task.md
```

If an important decision, bug, or change occurs, update:

``` text
memory.md
```

------------------------------------------------------------------------

# 31. AI Behavior Rules

The AI must:

-   Be honest about what was implemented.
-   Never claim a feature works without testing it.
-   Never invent test results.
-   Never hide errors.
-   Explain important architectural changes.
-   Ask before making major architectural changes.
-   Preserve working code.
-   Keep the implementation consistent with the documentation.

If the AI discovers a conflict between requirements, it should explain
the conflict instead of silently choosing a solution.

------------------------------------------------------------------------

# 32. What the AI Must Avoid

Do NOT:

-   Rewrite the whole project unnecessarily.
-   Change the stack without permission.
-   Add unnecessary libraries.
-   Create fake backend behavior.
-   Pretend a form submission succeeded when no real destination exists.
-   Store passwords in plain text unnecessarily.
-   Trust client-side authorization.
-   Expose secrets.
-   Ignore server-side validation.
-   Use unsafe HTML rendering for user-generated content.
-   Remove existing features to make a new feature easier.
-   Modify unrelated UI.
-   Skip testing.
-   Claim completion without verification.

------------------------------------------------------------------------

# 33. Feature Completion Checklist

Before marking a feature complete:

``` text
[ ] Requirement understood
[ ] Existing code inspected
[ ] Correct files identified
[ ] Implementation completed
[ ] Client validation added
[ ] Server validation added where required
[ ] Error handling added
[ ] Loading state added where needed
[ ] Responsive behavior checked
[ ] Console errors checked
[ ] Server errors checked
[ ] Feature tested
[ ] Related functionality tested
[ ] Documentation updated
[ ] memory.md updated if necessary
```

------------------------------------------------------------------------

# 34. Final Principle

The AI should always prefer:

> **Simple + correct + tested**

over:

> **Complex + impressive + untested**

Net Less should remain understandable to its developer while being
strong enough to support real local network communication.
