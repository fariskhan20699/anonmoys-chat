# Net Less |Design Specification

## 1. Purpose

This document defines the visual and interaction design for Net Less.

The design should feel:
- Simple
- Modern
- Friendly
- Fast
- Easy for first time users
- Comfortable on both desktop and mobile screens

The interface should avoid unnecessary complexity and keep the main action obvious on every screen.

---

## 2. Design Principles

### 2.1 Simplicity
Each screen should have one clear primary purpose.

### 2.2 Consistency
Buttons, inputs, cards, spacing, typography, icons, and colors should follow the same visual system.

### 2.3 Clear Feedback
Users should always know:
- What is happening
- Whether an action succeeded
- Whether something failed
- Whether they are connected
- Whether a room is active

### 2.4 Responsive Design
The interface must work on:
- Desktop
- Laptop
- Tablet
- Mobile phones

### 2.5 Accessibility
Controls should have readable labels, visible focus states, sufficient contrast, and usable touch targets.

---

## 3. Visual Direction

Net Less should use a clean modern interface with rounded cards, clear typography, comfortable spacing, and subtle visual feedback.

Avoid:
- Excessive gradients
- Too many colors
- Overloaded screens
- Tiny buttons
- Long paragraphs inside primary UI
- Unnecessary animations

---

## 4. Global Layout

### Desktop

Typical structure:

```text
┌──────────────────────────────────────────────┐
│ Logo / Net Less                         Help │
├──────────────────────────────────────────────┤
│                                              │
│              Main Content Area               │
│                                              │
│          Card / Form / Dashboard             │
│                                              │
└──────────────────────────────────────────────┘
```

### Mobile

```text
┌──────────────────────┐
│ Net Less          ☰ │
├──────────────────────┤
│                      │
│    Main Content      │
│                      │
│    Full-width Card   │
│                      │
└──────────────────────┘
```

The content area should not feel cramped on small screens.

---

## 5. Typography

Use one primary font family throughout the application.

Recommended characteristics:
- Modern sans serif
- Good readability
- Multiple font weights
- Clear numbers and letters

Suggested hierarchy:

```text
Page Title       28–36px
Section Title    20–24px
Card Title       18–20px
Body Text        14–16px
Small Text       12–14px
Button Text      14–16px
```

Do not use too many font sizes.

---

## 6. Color System

Use a small and consistent color palette.

Recommended semantic roles:

```text
Primary     → Main actions
Secondary   → Supporting actions
Success     → Connected / successful
Warning     → Important attention
Danger      → Close / leave / errors
Background  → Main page background
Surface     → Cards and panels
Text        → Main readable content
Muted       → Secondary information
Border      → Input/card boundaries
```

The exact colors may be selected during implementation, but the same semantic roles must remain consistent across all screens.

---

## 7. Buttons

### Primary Button

Used for the main action.

Examples:
- Continue
- Create Room
- Join Room
- Open Chat
- Send Report

Primary buttons should be visually prominent.

### Secondary Button

Used for supporting actions.

Examples:
- Back
- Copy Code
- Copy Link
- Scan QR

### Danger Button

Used for destructive or exit actions.

Examples:
- Close Room
- Leave Room

Danger actions should be visually distinguishable and should not be accidentally triggered.

### Button States

Every interactive button should support:

```text
Default
Hover
Focus
Active
Disabled
Loading
```

---

## 8. Input Fields

Inputs should have:
- Visible label
- Placeholder when useful
- Clear border
- Focus state
- Validation state
- Error message when invalid

Example:

```text
Monkey Name
┌──────────────────────────────┐
│ Enter your Monkey name       │
└──────────────────────────────┘
```

---

## 9. Welcome Screen

Purpose: collect the user's temporary Monkey Name.

Structure:

```text
        Net Less

   Connect without accounts

   Monkey Name
   ┌───────────────────────┐
   │ Enter your name       │
   └───────────────────────┘

        [ Continue ]
```

Requirements:
- Keep the screen focused on one action.
- Explain briefly that the name is temporary.
- Prevent empty names.
- Show validation feedback clearly.

---

## 10. Dashboard

Purpose: provide the main navigation after entering a name.

Suggested structure:

```text
Welcome, Monkey Name

┌──────────────────┐  
│  Create Room     │  
│  Host a chat     │  
└──────────────────┘  
┌──────────────────┐
│   Join Room      │
│   Enter a room   │
└──────────────────┘
┌──────────────────┐  
│ Help & Support   │  
└──────────────────┘  
┌──────────────────┐
│ Change Name      │
└──────────────────┘
```

Create Room and Join Room should be the most visually prominent actions.

---

## 11. Create Room Screen

Required elements:
- Room code
- Copy code button
- Copy link button
- QR code
- Optional 4 digit password
- Participant count/list
- Open Chat button
- Close Room button

Suggested layout:

```text
Create Room

Room Code
┌──────────────────────┐
│ A7K9P2X4M            │
└──────────────────────┘
[ Copy Code ] [ Copy Link ]

     ┌─────────┐
     │ QR CODE │
     └─────────┘

Room Password (Optional)
┌──────────────────────┐
│ 1234  | set  | Reset │
└──────────────────────┘

Participants
• Monkey A
• Monkey B

[ Open Chat ]

[ Close Room ]
```

The room code must be easy to read and copy.

---

## 12. Join Room Screen

Required elements:
- Room code input
- Join Room button
- Scan QR Code button
- Back button

Suggested structure:

```text
Join Room

Room Code
┌────────────────────────┐
│ Enter 9 character code │
└────────────────────────┘

[ Join Room ]

       or

[ Scan QR Code ]

[ Back ]
```

Room-code validation should happen before attempting to join.

---

## 13. Chat Screen

The chat screen is the most important interactive screen.

Suggested layout:

```text
┌─────────────────────────────────────┐
│ Room: A7K9P2X4M        ● Connected  │
│ 3 Participants          [ Leave ]   │
├─────────────────────────────────────┤
│                                     │
│ Monkey A                            │
│ ┌──────────────────────┐            │
│ │ Hello!               │            │
│ └──────────────────────┘            │
│                                     │
│             ┌──────────────────────┐│
│             │ Hi!                  ││
│             └──────────────────────┘│
│                         You         |
| Monkey B                            │
│ ┌──────────────────────┐            │
│ │ What's Up!           │            │
│ └──────────────────────┘            │
│                                     │
├─────────────────────────────────────┤
│     ┌──────────────────────┐        │
│ 😊  │ Type a message...    │ [Send] │
│     └──────────────────────┘        │
└─────────────────────────────────────┘
```

### Message Design

Incoming messages:
- Align left
- Show sender name where useful

Outgoing messages:
- Align right
- Visually distinguish from incoming messages

Messages should have:
- Readable text
- Comfortable padding
- Rounded corners
- Reasonable maximum width

Do not make chat bubbles excessively large.

---

## 14. Connection Status

The chat header should communicate connection state.

Possible states:

```text
● Connected
○ Connecting...
! Connection lost
```

The status should update automatically.

If connection is lost:
- Explain the issue clearly.
- Avoid silently failing.
- Allow automatic reconnection where possible.

---

## 15. Help & Support Screen

Use expandable sections/cards.

Suggested topics:

```text
How to join a room
How to host a room
Connection problems
Report a problem
```

Each section should contain short, actionable instructions.

Avoid large blocks of text.

---

## 16. Report Problem Screen

Fields:

```text
Name
Email
Subject
Description
```

Actions:

```text
[ Send Report ]
[ Back to Help ]
```

Validation:
- Name required
- Email required and valid
- Subject required
- Description required

Show a clear success state after submission.

---

## 17. Modals and Confirmations

Use confirmation dialogs for actions that can remove access or close a room.

Example:

```text
Close Room?

Everyone will be disconnected from this room.

[ Cancel ]    [ Close Room ]
```

Do not use confirmation dialogs for ordinary actions such as:
- Copying a room code
- Opening Help
- Going back from a screen with no unsaved data

---

## 18. Toasts and Feedback

Use short feedback messages for lightweight actions.

Examples:
- "Room code copied"
- "Link copied"
- "Report sent"
- "Connected"
- "Reconnected"

Toasts should:
- Be visible but unobtrusive
- Disappear automatically when appropriate
- Not block important controls

---

## 19. Loading States

When an operation takes time, show a loading state.

Examples:
- Joining room
- Creating room
- Sending report
- Connecting to server

Avoid making users wonder whether their click worked.

---

## 20. Empty States

If there is no participant other than the host:

```text
No other participants yet.

Share the room code or QR code to invite someone.
```

Empty states should tell the user what they can do next.

---

## 21. Error States

Errors should be specific and actionable.

Bad:

```text
Error
```

Better:

```text
Could not join the room.

Check the room code and make sure the host is still connected.
```

Where possible, provide:
- Problem
- Reason
- Next action

---

## 22. Responsive Rules

### Desktop
- Use centered content containers.
- Keep cards readable rather than stretching them across the entire screen.
- Chat should use the available vertical space.

### Tablet
- Reduce horizontal spacing.
- Stack cards when necessary.

### Mobile
- Use one column layouts.
- Buttons may become full width.
- Inputs should be easy to tap.
- Chat composer should remain accessible.
- Avoid horizontal scrolling.
- QR code should remain clearly visible.

---

## 23. Animation

Animations should be subtle.

Allowed:
- Button hover transitions
- Card hover transitions
- Toast appearance
- Message appearance
- Modal fade/scale

Avoid:
- Constant movement
- Long transitions
- Distracting background animations

Typical transition duration:

```text
150 – 250ms
```

---

## 24. Icon Rules

Icons may be used for:
- Copy
- QR scan
- Send
- Help
- Leave
- Close
- Connection status

Important actions should still have readable text where appropriate.

Do not use an icon alone if its meaning may be unclear.

---

## 25. UX Rules

1. Every page must have a clear primary action.
2. Users should always know how to go back when appropriate.
3. Forms should explain validation errors.
4. Destructive actions should be clearly separated.
5. Network failures must provide useful feedback.
6. Chat should prioritize readability.
7. The interface must remain usable without relying on animations.
8. Do not hide critical information behind unnecessary menus.
9. Keep the number of steps low.
10. Preserve the user's current room/name state during normal navigation.

---

## 26. Design Completion Checklist

Before considering the design complete:

- [ ] Welcome screen designed
- [ ] Dashboard designed
- [ ] Create Room designed
- [ ] Join Room designed
- [ ] Chat screen designed
- [ ] Help & Support designed
- [ ] Report Problem designed
- [ ] Buttons have consistent states
- [ ] Inputs have validation states
- [ ] Loading states defined
- [ ] Error states defined
- [ ] Empty states defined
- [ ] Toast feedback defined
- [ ] Responsive behavior defined
- [ ] Accessibility basics considered
- [ ] Destructive actions have confirmation
- [ ] Chat connection status is visible

---

## 27. Final Design Principle

Net Less should feel like a small, fast, local communication tool.

The interface should never make the user think:

> "Where do I click?"

The next action should be obvious, the current connection state should be visible, and errors should explain what the user can do next.
