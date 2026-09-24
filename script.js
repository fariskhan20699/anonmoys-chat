/* =========================================================
   NET LESS — Peer-to-peer chat (PeerJS)
   ========================================================= */

'use strict';

/* ---------- Constants & State ---------- */

const $ = id => document.getElementById(id);
const PREFIX = 'netless-';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const CHUNK_SIZE = 16 * 1024;
const JOIN_TIMEOUT_MS = 15000;

let peer = null;
let isHost = false;
let myName = '';
let roomCode = '';
const myId = Math.random().toString(36).slice(2, 8);

let hostConn = null;

const guests = new Map();
const members = new Map();

let pendingRoom = null;
let roomPassword = '';
let awaitingPassword = false;

let selectedFile = null;
const incomingFiles = new Map();

/* =========================================================
   CHAT HISTORY (localStorage — text & system messages only)
   Files/images are NOT saved (localStorage is only ~5 MB).
   ========================================================= */

const HISTORY_LIMIT = 200;
const historyKey = code => 'netless-history-' + code;
let historyRestoring = false;

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(historyKey(roomCode)) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(entry) {
  // Only the host persists history; skip while restoring old messages
  if (historyRestoring || !isHost || !roomCode) return;

  try {
    const arr = getHistory();
    arr.push(entry);
    if (arr.length > HISTORY_LIMIT) arr.splice(0, arr.length - HISTORY_LIMIT);
    localStorage.setItem(historyKey(roomCode), JSON.stringify(arr));
  } catch { /* storage full — skip saving */ }
}

function renderHistory(entries) {
  if (!entries || !entries.length) return;

  historyRestoring = true;

  sysMsg('—— earlier messages ——');

  entries.forEach(e => {
    if (e.kind === 'sys') {
      sysMsg(e.text);
    } else {
      // "me"/"fr" is decided by comparing stored id with current myId,
      // so history looks correct even after a page reload.
      const who = e.id && e.id === myId ? 'me' : 'fr';
      addMsg(e.text, who, who === 'me' ? '' : e.senderName, e.ts, e.id);
    }
  });

  historyRestoring = false;
}

function loadHistory() {
  renderHistory(getHistory());
}

function clearHistory() {
  if (!roomCode) return;
  if (!confirm('Delete chat history for room ' + roomCode + '? This cannot be undone.')) return;

  try { localStorage.removeItem(historyKey(roomCode)); } catch { /* ignore */ }

  $('chatBox').innerHTML = '';
  sysMsg('Chat history cleared.');
  toast('Chat history cleared', 'ok');
}

/* =========================================================
   SCREENS
   ========================================================= */

function show(id) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  $(id)?.classList.add('active');

  if (id === 's-chat') {
    setTimeout(() => $('msgInput')?.focus(), 150);
  }
}

/* =========================================================
   IMAGE VIEWER
   ========================================================= */

let imageZoom = 1;
let imageRotation = 0;
let mouseX = 50;
let mouseY = 50;
let currentImageIndex = 0;

const instructionImages = [
  './img/01.png', './img/02.png', './img/03.png',
  './img/04.png', './img/05.png', './img/06.png',
  './img/07.png', './img/08.png', './img/09.png'
];

function updateImageTransform() {
  const image = $('previewImage');
  image.style.transformOrigin = `${mouseX}% ${mouseY}%`;
  image.style.transform = `scale(${imageZoom}) rotate(${imageRotation}deg)`;
}

function resetImageView() {
  imageZoom = 1;
  imageRotation = 0;
  mouseX = 50;
  mouseY = 50;
  $('previewImage').style.transformOrigin = '50% 50%';
  updateImageTransform();
}

function setMouseFromEvent(e, el) {
  const rect = el.getBoundingClientRect();
  mouseX = ((e.clientX - rect.left) / rect.width) * 100;
  mouseY = ((e.clientY - rect.top) / rect.height) * 100;
}

function openImage(src) {
  currentImageIndex = instructionImages.indexOf(src);
  if (currentImageIndex === -1) currentImageIndex = 0;

  $('previewImage').src = instructionImages[currentImageIndex];
  resetImageView();
  $('imageModal').classList.add('active');
}

function closeImage() {
  $('imageModal').classList.remove('active');
}

function stepZoom(delta) {
  imageZoom = Math.min(3, Math.max(0.5, imageZoom + delta));
  updateImageTransform();
}

const zoomIn = () => stepZoom(0.2);
const zoomOut = () => stepZoom(-0.2);
const resetZoom = resetImageView;

function rotateImage() {
  imageRotation = (imageRotation + 90) % 360;
  updateImageTransform();
}

function stepImage(delta) {
  currentImageIndex = (currentImageIndex + delta + instructionImages.length) % instructionImages.length;
  $('previewImage').src = instructionImages[currentImageIndex];
  resetImageView();
}

const nextImage = () => stepImage(1);
const previousImage = () => stepImage(-1);

$('previewImage').addEventListener('mousemove', function (e) {
  setMouseFromEvent(e, this);
  this.style.transformOrigin = `${mouseX}% ${mouseY}%`;
});

$('previewImage').addEventListener('wheel', function (e) {
  e.preventDefault();
  setMouseFromEvent(e, this);
  stepZoom(e.deltaY < 0 ? 0.2 : -0.2);
});

/* =========================================================
   HELP & SUPPORT
   ========================================================= */

function showHelp(type) {
  const help = {
    join: {
      title: 'How to join a room',
      icon: '⌗',
      content: `
        <p>1. Ask the host for the 9-character room code.</p>
        <p>2. Enter the code on the Join a room screen.</p>
        <p>3. If the room has a password, enter the 4-digit password.</p>
        <p>4. You can also scan the host's QR code to join.</p>`
    },
    host: {
      title: 'How to host a room',
      icon: '＋',
      content: `
        <p>1. Select <b>Create a room</b>.</p>
        <p>2. Your room code and QR code will appear.</p>
        <p>3. Share the code or QR code with other people.</p>
        <p>4. Keep this page open while people are chatting.</p>
        <p>5. You can also set an optional 4-digit password.</p>`
    },
    connection: {
      title: 'Connection problems',
      icon: '⌁',
      content: `
        <p>• Make sure everyone is connected to the same Wi-Fi or hotspot.</p>
        <p>• The host must keep the room open.</p>
        <p>• Check that the room code is correct.</p>
        <p>• If the connection fails, try leaving and joining again.</p>`
    },
    report: {
      title: 'Report a problem',
      icon: '!',
      content: `
        <p>Tell us what went wrong.</p>

        <label class="help-label">Name</label>
        <input type="text" id="problemName" class="help-input"
               maxlength="50" placeholder="Enter your name" required>

        <label class="help-label">Email</label>
        <input type="email" id="problemEmail" class="help-input"
               maxlength="100" placeholder="Enter your email" required>

        <label class="help-label">Subject</label>
        <select id="problemSubject" class="help-select">
          <option value="">Select a problem</option>
          <option value="Can't create a room">Can't create a room</option>
          <option value="Can't join a room">Can't join a room</option>
          <option value="Room code not working">Room code not working</option>
          <option value="QR code not working">QR code not working</option>
          <option value="Connection problem">Connection problem</option>
          <option value="Room password problem">Room password problem</option>
          <option value="Messages not sending">Messages not sending</option>
          <option value="Chat not updating">Chat not updating</option>
          <option value="Emoji problem">Emoji problem</option>
          <option value="Camera / QR scanner problem">Camera / QR scanner problem</option>
          <option value="Page not loading">Page not loading</option>
          <option value="File sharing problem">File sharing problem</option>
          <option value="Other">Other</option>
        </select>

        <label class="help-label">Description</label>
        <textarea id="problemText" class="help-textarea" maxlength="500"
                  placeholder="Describe the problem..." required></textarea>

        <button class="btn-main" onclick="submitProblem()">Send Report</button>

        <p class="support-email">
          Need help? Contact us at
          <a href="mailto:netlesscodesupport@gmail.com">netlesscodesupport@gmail.com</a>
        </p>`
    }
  };

  const item = help[type];
  if (!item) return;

  $('helpMenu').style.display = 'none';
  $('helpDetails').innerHTML = `
    <div class="help-title">
      <span class="help-title-icon">${item.icon}</span>
      <h1>${item.title}</h1>
    </div>
    <div class="help-instructions">${item.content}</div>
    <button class="back" onclick="backToHelpMenu()">← Back to Help</button>`;
  $('helpDetails').style.display = 'block';
}

function backToHelpMenu() {
  $('helpDetails').style.display = 'none';
  $('helpDetails').innerHTML = '';
  $('helpMenu').style.display = 'block';
}

async function submitProblem() {
  const name = $('problemName');
  const email = $('problemEmail');
  const subject = $('problemSubject').value;
  const problem = $('problemText').value.trim();

  if (!name.value.trim()) { toast('Please enter your name', 'err'); name.focus(); return; }
  if (!email.value.trim()) { toast('Please enter your email', 'err'); email.focus(); return; }
  if (!subject) { toast('Please select a problem', 'err'); $('problemSubject').focus(); return; }
  if (!problem) { toast('Please describe the problem', 'err'); $('problemText').focus(); return; }

  const formData = new FormData();
  formData.append('access_key', 'b6d39fa0-0475-4726-a82d-e2191a7316fb');
  formData.append('subject', 'Net Less | ' + subject);
  formData.append('from_name', 'Net Less User');
  formData.append('message', problem);

  try {
    const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
    const data = await response.json();

    if (data.success) {
      toast('Report submitted successfully', 'ok');
      $('problemSubject').value = '';
      $('problemText').value = '';
    } else {
      toast('Failed to submit report', 'err');
    }
  } catch {
    toast('Connection error. Try again.', 'err');
  }
}

/* =========================================================
   TOAST
   ========================================================= */

function toast(msg, kind = 'info') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.textContent = msg;
  $('toasts').appendChild(t);

  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3000);
}

/* =========================================================
   HELPERS
   ========================================================= */

function makeCode() {
  const b = crypto.getRandomValues(new Uint8Array(9));
  return [...b].map(x => ALPHABET[x % ALPHABET.length]).join('');
}

function parseRoom(str) {
  if (!str) return null;

  let s = String(str).trim();

  try {
    const r = new URL(s).searchParams.get('room');
    if (r) s = r;
  } catch { /* not a URL */ }

  s = s.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const m = s.match(/[A-Z0-9]{9}$/);
  return m && [...m[0]].every(c => ALPHABET.includes(c)) ? m[0] : null;
}

function roomLink() {
  return location.href.split('#')[0].split('?')[0] + '?room=' + roomCode;
}

function hue(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function avatar(name, cls = '') {
  const a = document.createElement('span');
  a.className = 'avatar ' + cls;
  a.style.setProperty('--h', hue(name));
  a.textContent = (name.trim()[0] || '?').toUpperCase();
  a.title = name;
  return a;
}

const clip = (s, n) => String(s || '').slice(0, n);

const timeNow = ts =>
  new Date(ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function copyRaw(text, ok) {
  const done = () => toast(ok, 'ok');

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, fallback);
  } else {
    fallback();
  }

  function fallback() {
    const t = document.createElement('textarea');
    t.value = text;
    document.body.appendChild(t);
    t.select();

    try {
      document.execCommand('copy');
      done();
    } catch {
      toast('Could not copy', 'err');
    }

    t.remove();
  }
}

const copyCode = () => copyRaw(roomCode, 'Room code copied');
const copyLink = () => copyRaw(roomLink(), 'Join link copied');

/* =========================================================
   CHAT UI
   ========================================================= */

function addMsg(text, who, senderName, ts, id) {
  const d = document.createElement('div');
  d.className = 'msg ' + who;

  if (who !== 'me' && senderName) {
    const w = document.createElement('div');
    w.className = 'who';
    w.style.setProperty('--h', hue(senderName));
    w.textContent = senderName;
    d.appendChild(w);
  }

  const t = document.createElement('div');
  t.className = 'txt';
  t.textContent = text;
  d.appendChild(t);

  const m = document.createElement('div');
  m.className = 'time';
  m.textContent = timeNow(ts);
  d.appendChild(m);

  $('chatBox').appendChild(d);
  $('chatBox').scrollTop = 1e7;

  saveHistory({
    kind: 'msg',
    text,
    who,
    senderName,
    ts,
    id: id || (who === 'me' ? myId : '')
  });
}

function sysMsg(text) {
  const d = document.createElement('div');
  d.className = 'msg sys';
  d.textContent = text;
  $('chatBox').appendChild(d);
  $('chatBox').scrollTop = 1e7;

  saveHistory({ kind: 'sys', text });
}

/* =========================================================
   MEMBERS
   ========================================================= */

function renderMembers() {
  const list = $('memberList');
  const stack = $('avatarStack');
  list.innerHTML = '';
  stack.innerHTML = '';

  [...members].forEach(([id, name], i) => {
    const row = document.createElement('div');
    row.className = 'member';

    const left = document.createElement('span');
    left.className = 'm-left';
    left.appendChild(avatar(name));

    const n = document.createElement('span');
    n.textContent = name + (id === myId ? ' (You)' : '');
    left.appendChild(n);

    row.appendChild(left);

    const st = document.createElement('span');
    st.className = 'online';
    st.textContent = 'online';
    row.appendChild(st);

    list.appendChild(row);

    if (i < 5) stack.appendChild(avatar(name, 'sm'));
  });

  const c = members.size;
  $('memberCount').textContent = c;
  $('waiting').style.display = isHost && c === 1 ? 'flex' : 'none';

  if (c > 5) {
    const more = document.createElement('span');
    more.className = 'avatar sm more';
    more.textContent = '+' + (c - 5);
    stack.appendChild(more);
  }
}

/* =========================================================
   TYPING
   ========================================================= */

let typingTimer = null;
let typingSentAt = 0;

function showTyping(name) {
  $('typing').innerHTML = '';

  const s = document.createElement('span');
  s.textContent = name + ' is typing';

  const dots = document.createElement('span');
  dots.className = 'dots';
  dots.innerHTML = '<i></i><i></i><i></i>';

  $('typing').append(s, dots);

  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => ($('typing').innerHTML = ''), 1800);
}

/* =========================================================
   NAME STEP
   ========================================================= */

function goToRoomOptions() {
  const input = $('name');
  const err = $('nameError');
  const name = input.value.trim();

  if (!name) {
    input.classList.add('input-error');
    err.style.display = 'block';
    input.focus();
    return;
  }

  input.classList.remove('input-error');
  err.style.display = 'none';

  myName = name;
  $('userName').textContent = name;

  if (pendingRoom) {
    $('joinCode').value = pendingRoom;
    show('s-join');
    joinRoom();
    pendingRoom = null;
  } else {
    show('s-options');
  }
}

$('name').addEventListener('input', function () {
  if (this.value.trim()) {
    this.classList.remove('input-error');
    $('nameError').style.display = 'none';
  }
});

$('name').addEventListener('keydown', e => {
  if (e.key === 'Enter') goToRoomOptions();
});

$('joinCode').addEventListener('input', function () {
  const p = parseRoom(this.value);

  if (p) {
    this.value = p;
  } else if (!this.value.includes('/')) {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
});

$('joinCode').addEventListener('keydown', e => {
  if (e.key === 'Enter') joinRoom();
});

$('joinPass').addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '').slice(0, 4);
});

$('joinPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') joinRoom();
});

/* =========================================================
   HOST
   ========================================================= */

function startHost(attempt = 0) {
  if (typeof Peer === 'undefined') {
    toast('Could not load the connection library. Check your internet.', 'err');
    return;
  }

  destroyPeer();

  isHost = true;
  roomCode = makeCode();
  roomPassword = '';

  members.clear();
  members.set(myId, myName);
  guests.clear();

  peer = new Peer(PREFIX + roomCode);

  peer.on('open', () => {
    $('roomChip').textContent = roomCode;
    $('roomInfoBtn').style.display = '';

    drawCode();
    drawQR();
    renderMembers();

    $('passInput').value = '';
    $('passHint').textContent = 'No password (optional). Set one for extra safety.';
    $('chatBox').innerHTML = '';
    loadHistory();

    sysMsg('Room ' + roomCode + ' created. Share the code to invite people.');
    show('s-host');
  });

  peer.on('connection', conn => {
    const entry = { conn, name: '', id: '' };

    conn.on('data', d => hostData(entry, d));
    conn.on('close', () => hostDrop(entry));
    conn.on('error', () => hostDrop(entry));
  });

  peer.on('error', err => {
    if (err.type === 'unavailable-id' && attempt < 4) {
      return startHost(attempt + 1);
    }

    if (!peer || !peer.open) {
      toast('Could not create room. Check your internet and try again.', 'err');
    }
  });

  peer.on('disconnected', () => {
    try { peer.reconnect(); } catch { /* ignore */ }
  });
}

function drawCode() {
  const b = $('codeBoard');
  b.innerHTML = '';

  [...roomCode].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = ch;
    s.style.animationDelay = i * 70 + 'ms';
    b.appendChild(s);
  });
}

function drawQR() {
  const box = $('qr');
  box.innerHTML = '';

  new QRCode(box, {
    text: roomLink(),
    width: 168,
    height: 168,
    colorDark: '#06222b',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });

  $('qrHint').textContent =
    location.protocol === 'file:'
      ? "Tip: host this page on a web address so the QR opens on phones. Guests can still type the code."
      : 'Scan with any phone camera to join instantly.';
}

/* =========================================================
   ROOM PASSWORD
   ========================================================= */

function setPassword() {
  const v = $('passInput').value.trim();

  if (!/^\d{4}$/.test(v)) {
    toast('Password must be exactly 4 digits', 'err');
    return;
  }

  roomPassword = v;
  $('passInput').value = '';
  $('passHint').textContent = 'Password protected guests must enter this 4-digit code to join.';
  toast('Room password set', 'ok');
}

function removePassword() {
  if (!roomPassword) {
    toast('No password is set', 'info');
    return;
  }

  roomPassword = '';
  $('passInput').value = '';
  $('passHint').textContent = 'No password (optional). Set one for extra safety.';
  toast('Room password removed', 'ok');
}

/* =========================================================
   HOST BROADCAST & DATA HANDLING
   ========================================================= */

function hostBroadcast(obj, except) {
  guests.forEach(g => {
    if (g !== except && g.id && g.conn.open) {
      try { g.conn.send(obj); } catch { /* connection died mid-send */ }
    }
  });
}

function hostData(entry, d) {
  if (!d || typeof d !== 'object') return;

  /* --- HELLO: register new guest --- */
  if (d.t === 'hello' && !entry.id) {
    if (roomPassword && clip(d.pass, 4) !== roomPassword) {
      try { entry.conn.send({ t: 'badpass' }); } catch { /* ignore */ }

      setTimeout(() => {
        try { entry.conn.close(); } catch { /* ignore */ }
      }, 200);

      return;
    }

    entry.name = clip(d.name, 20).trim() || 'Guest';

    let id = clip(d.id, 12) || Math.random().toString(36).slice(2, 8);
    if (members.has(id)) id = Math.random().toString(36).slice(2, 8);

    entry.id = id;
    guests.set(entry.conn.peer, entry);

    entry.conn.send({ t: 'welcome', code: roomCode, members: [...members], history: getHistory() });

    members.set(entry.id, entry.name);

    hostBroadcast({ t: 'join', id: entry.id, name: entry.name }, entry);

    sysMsg(entry.name + ' joined');
    toast(entry.name + ' joined', 'ok');
    renderMembers();
    return;
  }

  if (!entry.id) return;

  /* --- TEXT MESSAGE --- */
  if (d.t === 'msg') {
    const m = {
      t: 'msg',
      id: entry.id,
      name: entry.name,
      text: clip(d.text, 1000),
      ts: Date.now()
    };

    addMsg(m.text, 'fr', m.name, m.ts, m.id);
    hostBroadcast(m, entry);
  }

  /* --- TYPING --- */
  else if (d.t === 'typing') {
    showTyping(entry.name);
    hostBroadcast({ t: 'typing', name: entry.name }, entry);
  }

  /* --- FILE TRANSFER (guest → host, then host → everyone else) --- */
  else if (d.t === 'file-start') {
    receiveFileStart(d);
    hostBroadcast(d, entry);
  } else if (d.t === 'file-chunk') {
    receiveFileChunk(d);
    hostBroadcast(d, entry);
  } else if (d.t === 'file-end') {
    receiveFileEnd(d);
    hostBroadcast(d, entry);
  }
}

function hostDrop(entry) {
  if (entry.dropped) return;
  entry.dropped = true;

  guests.delete(entry.conn.peer);

  if (entry.id && members.has(entry.id)) {
    members.delete(entry.id);

    hostBroadcast({ t: 'leave', id: entry.id, name: entry.name });
    sysMsg(entry.name + ' left');
    renderMembers();
  }
}

function closeRoom() {
  if (!confirm('Close the room? Everyone will be disconnected.')) return;
  leaveRoom(true);
}

/* =========================================================
   GUEST
   ========================================================= */

function setJoining(on) {
  $('joinBtn').classList.toggle('loading', on);
  $('joinBtn').disabled = on;
}

function joinAction() {
  joinRoom();
}

function joinRoom() {
  const code = parseRoom($('joinCode').value);
  const st = $('joinStatus');

  if (!code) {
    setStatus(st, 'Enter a valid 9-character room code.', 'err');
    return;
  }

  if (typeof Peer === 'undefined') {
    setStatus(st, 'Could not load the connection library. Check your internet.', 'err');
    return;
  }

  destroyPeer();

  isHost = false;
  roomCode = code;
  members.clear();

  setJoining(true);
  setStatus(st, 'Looking for room ' + code + '…', 'info');

  const passValue = $('joinPass').value.trim();
  let settled = false;

  const fail = msg => {
    if (settled) return;
    settled = true;
    setJoining(false);
    setStatus(st, msg, 'err');
    destroyPeer();
  };

  const timeout = setTimeout(
    () => fail('Room not reachable. Make sure you are on the same Wi-Fi and the host is online.'),
    JOIN_TIMEOUT_MS
  );

  peer = new Peer();

  peer.on('error', err => {
    clearTimeout(timeout);
    fail(
      err.type === 'peer-unavailable'
        ? 'Room not found. Check the code and try again.'
        : 'Connection problem. Try again.'
    );
  });

  peer.on('open', () => {
    hostConn = peer.connect(PREFIX + code, { reliable: true });

    hostConn.on('open', () => {
      hostConn.send({ t: 'hello', name: myName, id: myId, pass: passValue });
    });

    hostConn.on('data', d => {
      if (!d || typeof d !== 'object') return;

      /* --- BAD PASSWORD --- */
      if (d.t === 'badpass') {
        clearTimeout(timeout);
        settled = true;
        awaitingPassword = true;

        setJoining(false);
        $('joinPass').style.display = 'block';
        $('joinPass').focus();
        setStatus(st, 'Wrong or missing password. Enter the room password and join again.', 'err');
        return;
      }

      /* --- WELCOME --- */
      if (d.t === 'welcome') {
        clearTimeout(timeout);
        settled = true;
        setJoining(false);

        d.members.forEach(([id, name]) => members.set(id, name));
        members.set(myId, myName);

        $('roomChip').textContent = roomCode;
        $('roomInfoBtn').style.display = 'none';
        $('chatBox').innerHTML = '';

        sysMsg('Connected to room ' + roomCode);
        renderMembers();
        renderHistory(d.history);

        $('joinStatus').className = 'status';
        show('s-chat');
      }

      /* --- PEER EVENTS --- */
      else if (d.t === 'join') {
        members.set(d.id, d.name);
        sysMsg(d.name + ' joined');
        renderMembers();
      } else if (d.t === 'leave') {
        members.delete(d.id);
        sysMsg(d.name + ' left');
        renderMembers();
      }

      /* --- CONTENT --- */
      else if (d.t === 'msg') {
        addMsg(clip(d.text, 1000), 'fr', d.name, d.ts, d.id);
      } else if (d.t === 'typing') {
        showTyping(d.name);
      } else if (d.t === 'file-start') {
        receiveFileStart(d);
      } else if (d.t === 'file-chunk') {
        receiveFileChunk(d);
      } else if (d.t === 'file-end') {
        receiveFileEnd(d);
      }
    });

    hostConn.on('close', () => {
      if (awaitingPassword) {
        awaitingPassword = false;
        destroyPeer();
        return;
      }

      if (!settled) return fail('The host closed the room.');

      toast('The host closed the room', 'err');
      leaveRoom(true);
    });
  });
}

function setStatus(el, msg, cls) {
  el.className = 'status ' + cls;
  el.textContent = msg;
}

/* =========================================================
   FILE SHARING
   ========================================================= */

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    toast('File must be smaller than 10 MB', 'err');
    $('fileInput').value = '';
    return;
  }

  selectedFile = file;
  showFilePreview(file);
}

function showFilePreview(file) {
  const preview = $('filePreview');
  if (!preview) return;

  preview.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'selected-file';

  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.className = 'selected-file-image';
    img.src = URL.createObjectURL(file);
    img.onclick = () => openSelectedImage(file);
    card.appendChild(img);
  } else {
    const icon = document.createElement('div');
    icon.className = 'selected-file-icon';
    icon.textContent = '📄';
    card.appendChild(icon);
  }

  const info = document.createElement('div');
  info.className = 'selected-file-info';

  const name = document.createElement('div');
  name.className = 'selected-file-name';
  name.textContent = file.name;

  const size = document.createElement('div');
  size.className = 'selected-file-size';
  size.textContent = formatFileSize(file.size);

  info.appendChild(name);
  info.appendChild(size);
  card.appendChild(info);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-file';
  remove.textContent = '×';
  remove.title = 'Remove file';
  remove.onclick = cancelSelectedFile;
  card.appendChild(remove);

  preview.appendChild(card);
  preview.style.display = 'flex';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function cancelSelectedFile() {
  selectedFile = null;

  if ($('fileInput')) $('fileInput').value = '';

  const preview = $('filePreview');
  if (preview) {
    preview.innerHTML = '';
    preview.style.display = 'none';
  }
}

function openSelectedImage(blob) {
  const url = URL.createObjectURL(blob);
  const modal = $('imageModal');
  const image = $('previewImage');

  image.onload = resetImageView;
  image.src = url;
  modal.classList.add('active');
}

/* ---------- SEND FILE ---------- */

async function sendFile(file) {
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    toast('File must be smaller than 10 MB', 'err');
    return;
  }

  if (!isHost && (!hostConn || !hostConn.open)) {
    toast('Not connected', 'err');
    return;
  }

  if (isHost && guests.size === 0) {
    toast('No one has joined yet', 'info');
    return;
  }

  const transferId = crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now() + '-' + Math.random().toString(36).slice(2);

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  const broadcast = obj => {
    if (isHost) hostBroadcast(obj);
    else hostConn.send(obj);
  };

  /* Start */
  broadcast({
    t: 'file-start',
    transferId,
    id: myId,
    name: myName,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    totalChunks,
    ts: Date.now()
  });

  toast('Sending ' + file.name + '...', 'info');

  /* Chunks */
  for (let i = 0; i < totalChunks; i++) {
    const startByte = i * CHUNK_SIZE;
    const endByte = Math.min(startByte + CHUNK_SIZE, file.size);
    const buffer = await file.slice(startByte, endByte).arrayBuffer();

    broadcast({ t: 'file-chunk', transferId, index: i, data: buffer });

    // Prevent flooding the connection
    await new Promise(resolve => setTimeout(resolve, 2));
  }

  /* End */
  broadcast({ t: 'file-end', transferId, ts: Date.now() });

  /* Own chat message */
  addFileMessage(file.name, file.size, 'me', myName, file.type, file);
  toast('File sent', 'ok');
}

/* ---------- RECEIVE FILE ---------- */

function receiveFileStart(d) {
  incomingFiles.set(d.transferId, {
    fileName: d.fileName,
    fileSize: d.fileSize,
    fileType: d.fileType,
    totalChunks: d.totalChunks,
    chunks: [],
    received: 0,
    senderName: d.name,
    ts: d.ts
  });

  toast('Receiving ' + d.fileName + '...', 'info');
}

function receiveFileChunk(d) {
  const file = incomingFiles.get(d.transferId);
  if (!file) return;

  file.chunks[d.index] = d.data;
  file.received++;
}

function receiveFileEnd(d) {
  const file = incomingFiles.get(d.transferId);
  if (!file) return;

  const blob = new Blob(file.chunks, { type: file.fileType });

  addFileMessage(file.fileName, file.fileSize, 'fr', file.senderName, file.fileType, blob);
  incomingFiles.delete(d.transferId);

  toast(file.fileName + ' received', 'ok');
}

/* ---------- FILE CHAT MESSAGE ---------- */

function addFileMessage(fileName, fileSize, who, senderName, fileType, blob) {
  const d = document.createElement('div');
  d.className = 'msg ' + who + ' file-msg';

  /* Sender name */
  if (who !== 'me' && senderName) {
    const w = document.createElement('div');
    w.className = 'who';
    w.style.setProperty('--h', hue(senderName));
    w.textContent = senderName;
    d.appendChild(w);
  }

  /* File card */
  const card = document.createElement('div');
  card.className = 'chat-file';

  if (fileType && fileType.startsWith('image/') && blob) {
    const img = document.createElement('img');
    img.className = 'chat-file-image';
    img.src = URL.createObjectURL(blob);
    img.alt = fileName;
    img.title = 'Click to view';
    img.onclick = () => openSelectedImage(blob);
    card.appendChild(img);
  } else {
    const icon = document.createElement('div');
    icon.className = 'chat-file-icon';
    icon.textContent = '📄';
    card.appendChild(icon);

    const info = document.createElement('div');
    info.className = 'chat-file-info';

    const name = document.createElement('div');
    name.className = 'chat-file-name';
    name.textContent = fileName;

    const size = document.createElement('div');
    size.className = 'chat-file-size';
    size.textContent = formatFileSize(fileSize);

    info.appendChild(name);
    info.appendChild(size);
    card.appendChild(info);
  }

  /* Download button */
  if (blob) {
    const download = document.createElement('button');
    download.type = 'button';
    download.className = 'file-download';
    download.textContent = '↓';
    download.title = 'Download';
    download.onclick = () => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    card.appendChild(download);
  }

  d.appendChild(card);

  /* Time */
  const m = document.createElement('div');
  m.className = 'time';
  m.textContent = timeNow();
  d.appendChild(m);

  /* Chat */
  $('chatBox').appendChild(d);
  $('chatBox').scrollTop = 1e7;
}

/* =========================================================
   SEND MESSAGE
   ========================================================= */

function sendMsg() {
  const text = $('msgInput').value.trim();

  if (!text && !selectedFile) return;

  /* File */
  if (selectedFile) {
    const file = selectedFile;
    cancelSelectedFile(); // clear selection so UI doesn't stay stuck
    sendFile(file);
  }

  /* Text */
  if (text) {
    const m = { t: 'msg', id: myId, name: myName, text, ts: Date.now() };

    if (isHost) {
      if (guests.size === 0) {
        toast('No one has joined yet. Share the room code.', 'info');
      }
      hostBroadcast(m);
    } else if (hostConn && hostConn.open) {
      hostConn.send(m);
    } else {
      toast('Not connected', 'err');
      return;
    }

    addMsg(text, 'me', '', m.ts);
    $('msgInput').value = '';
  }
}

/* =========================================================
   TYPING INDICATOR
   ========================================================= */

$('msgInput').addEventListener('input', () => {
  const now = Date.now();
  if (now - typingSentAt < 1500) return;

  typingSentAt = now;

  const m = { t: 'typing', name: myName };

  if (isHost) {
    hostBroadcast(m);
  } else if (hostConn && hostConn.open) {
    hostConn.send(m);
  }
});

/* =========================================================
   EMOJI PICKER
   ========================================================= */

const EMOJI_CATS = [
  { label: '😀', ranges: [[0x1F600, 0x1F64F]] },
  { label: '🐻', ranges: [[0x1F300, 0x1F5FF]] },
  { label: '🚗', ranges: [[0x1F680, 0x1F6FF]] },
  { label: '🎉', ranges: [[0x1F900, 0x1F9FF], [0x1FA70, 0x1FAFF]] },
  { label: '❤️', ranges: [[0x2600, 0x26FF], [0x2700, 0x27BF]] }
];

let emojiBuilt = false;

function isEmojiChar(ch) {
  try {
    return /\p{Extended_Pictographic}/u.test(ch);
  } catch {
    return true;
  }
}

function rangeEmojis(ranges) {
  const out = [];

  ranges.forEach(([start, end]) => {
    for (let cp = start; cp <= end; cp++) {
      const ch = String.fromCodePoint(cp);
      if (isEmojiChar(ch)) out.push(ch);
    }
  });

  return out;
}

function buildEmojiPicker() {
  if (emojiBuilt) return;
  emojiBuilt = true;

  const tabs = $('emojiTabs');
  tabs.innerHTML = '';

  EMOJI_CATS.forEach((cat, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'emoji-tab' + (i === 0 ? ' active' : '');
    b.textContent = cat.label;
    b.onclick = () => selectEmojiCat(i);
    tabs.appendChild(b);
  });

  renderEmojiGrid(0);
}

function renderEmojiGrid(i) {
  const grid = $('emojiGrid');
  grid.innerHTML = '';

  const frag = document.createDocumentFragment();

  rangeEmojis(EMOJI_CATS[i].ranges).forEach(ch => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'emoji-item';
    b.textContent = ch;
    b.onclick = () => insertEmoji(ch);
    frag.appendChild(b);
  });

  grid.appendChild(frag);
}

function selectEmojiCat(i) {
  [...$('emojiTabs').children].forEach((b, idx) =>
    b.classList.toggle('active', idx === i)
  );
  renderEmojiGrid(i);
}

function insertEmoji(ch) {
  const input = $('msgInput');

  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;

  input.value = input.value.slice(0, start) + ch + input.value.slice(end);

  const pos = start + ch.length;
  input.focus();
  input.setSelectionRange(pos, pos);
}

function toggleEmojiPicker() {
  const p = $('emojiPicker');
  const open = p.classList.toggle('open');
  if (open) buildEmojiPicker();
}

document.addEventListener('click', e => {
  const p = $('emojiPicker');
  if (!p.classList.contains('open')) return;

  if (p.contains(e.target) || e.target.id === 'emojiBtn') return;

  p.classList.remove('open');
});

/* =========================================================
   LEAVE / RESET
   ========================================================= */

function destroyPeer() {
  try { if (hostConn) hostConn.close(); } catch { /* ignore */ }
  try { if (peer) peer.destroy(); } catch { /* ignore */ }

  peer = null;
  hostConn = null;
  guests.clear();
}

function resetJoinUI() {
  setJoining(false);
  $('joinStatus').className = 'status';
  $('joinPass').style.display = 'none';
  $('joinPass').value = '';
}

function leaveRoom(silent) {
  destroyPeer();

  members.clear();
  isHost = false;
  roomPassword = '';

  $('chatBox').innerHTML = '';
  $('typing').innerHTML = '';
  $('emojiPicker').classList.remove('open');

  cancelSelectedFile();
  resetJoinUI();

  show('s-options');
}

function leaveToOptions() {
  destroyPeer();
  cancelSelectedFile();
  resetJoinUI();
  show('s-options');
}

/* =========================================================
   QR SCANNER
   ========================================================= */

let scanStream = null;
let scanning = false;

async function openScanner() {
  if (!navigator.mediaDevices?.getUserMedia) {
    toast('Camera needs a secure (https) page. Type the code instead.', 'err');
    return;
  }

  if (typeof jsQR === 'undefined') {
    toast('QR library not loaded. Check your internet and reload.', 'err');
    return;
  }

  try {
    scanStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
  } catch (e) {
    console.error('Camera error:', e);
    toast('Camera permission was denied', 'err');
    return;
  }

  const v = $('scanVideo');
  v.srcObject = scanStream;
  await v.play();

  $('scanner').classList.add('open');
  scanning = true;
  requestAnimationFrame(scanTick);
}

function scanTick() {
  if (!scanning) return;

  const v = $('scanVideo');

  if (v.readyState >= 4) {
    const c = (scanTick.c ||= document.createElement('canvas'));
    c.width = v.videoWidth;
    c.height = v.videoHeight;

    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(v, 0, 0, c.width, c.height);

    const img = ctx.getImageData(0, 0, c.width, c.height);
    const r = jsQR(img.data, img.width, img.height);

    const code = r && parseRoom(r.data);

    if (code) {
      closeScanner();
      $('joinCode').value = code;
      joinRoom();
      return;
    }
  }

  requestAnimationFrame(scanTick);
}

function closeScanner() {
  scanning = false;

  if (scanStream) {
    scanStream.getTracks().forEach(t => t.stop());
  }

  scanStream = null;
  $('scanner').classList.remove('open');
}

/* =========================================================
   INIT
   ========================================================= */

(function init() {
  const r = parseRoom(new URLSearchParams(location.search).get('room'));

  if (r) {
    pendingRoom = r;
    $('userName').textContent = '';
    $('nameError').textContent = 'Enter your name to join room ' + r + '.';
  }
})();

/* ---------- Cleanup on page unload ---------- */
window.addEventListener('beforeunload', destroyPeer);