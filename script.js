const $ = id => document.getElementById(id);
const PREFIX = 'netless-';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no 0/O/1/I confusion

let peer = null;
let isHost = false;
let myName = '';
let roomCode = '';
let myId = Math.random().toString(36).slice(2, 8);
let hostConn = null;                 // guest -> host connection
const guests = new Map();            // host: conn.peer -> {conn,name,id}
const members = new Map();           // id -> name (everyone incl. me)
let pendingRoom = null;              // room from ?room= link
let roomPassword = '';               // host: current room password ('' = none)
let awaitingPassword = false;        // guest: waiting on a password retry

/* ---------- SCREENS ---------- */
function show(id){
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const s = $(id); if (s) s.classList.add('active');
  if (id === 's-chat') setTimeout(() => $('msgInput').focus(), 150);
}
function showHelp(type){
  const menu = $('helpMenu');
  const details = $('helpDetails');
  const help = {

    join: {
      title: 'How to join a room',
      icon: '⌗',
      content: `
        <p>1. Ask the host for the 9-character room code.</p>
        <p>2. Enter the code on the Join a room screen.</p>
        <p>3. If the room has a password, enter the 4-digit password.</p>
        <p>4. You can also scan the host's QR code to join.</p>
      `
    },

    host: {
      title: 'How to host a room',
      icon: '＋',
      content: `
        <p>1. Select <b>Create a room</b>.</p>
        <p>2. Your room code and QR code will appear.</p>
        <p>3. Share the code or QR code with other people.</p>
        <p>4. Keep this page open while people are chatting.</p>
        <p>5. You can also set an optional 4-digit password.</p>
      `
    },

    connection: {
      title: 'Connection problems',
      icon: '⌁',
      content: `
        <p>• Make sure everyone is connected to the same Wi-Fi or hotspot.</p>
        <p>• The host must keep the room open.</p>
        <p>• Check that the room code is correct.</p>
        <p>• If the connection fails, try leaving and joining again.</p>
      `
    },

    report: {
      title: 'Report a problem',
      icon: '!',
      content: `
        <p>Tell us what went wrong.</p>

        <label class="help-label">Name</label>

        <input
          type="text"
          id="problemName"
          class="help-input"
          maxlength="50"
          placeholder="Enter your name"
          required
        >

        <label class="help-label">Email</label>

        <input
          type="email"
          id="problemEmail"
          class="help-input"
          maxlength="100"
          placeholder="Enter your email"
          required
        >

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
          <option value="Other">Other</option>
        </select>

        <label class="help-label">Description</label>

        <textarea
          id="problemText"
          class="help-textarea"
          maxlength="500"
          placeholder="Describe the problem..."
          required
        ></textarea>

        <button class="btn-main" onclick="submitProblem()">
          Send Report
        </button>
      `
    }

  };
  const item = help[type];
  if (!item) return;
  menu.style.display = 'none';
  details.innerHTML = `
    <div class="help-title">
      <span class="help-title-icon">${item.icon}</span>
      <h1>${item.title}</h1>
    </div>

    <div class="help-instructions">
      ${item.content}
    </div>

    <button class="back" onclick="backToHelpMenu()">
      ← Back to Help
    </button>
  `;
  details.style.display = 'block';
}
function backToHelpMenu(){
  $('helpDetails').style.display = 'none';
  $('helpDetails').innerHTML = '';
  $('helpMenu').style.display = 'block';

}
async function submitProblem(){

  const subject = $('problemSubject').value;
  const problem = $('problemText').value.trim();

  if (!subject){
    toast('Please select a problem', 'err');
    $('problemSubject').focus();
    return;
  }

  if (!problem){
    toast('Please describe the problem', 'err');
    $('problemText').focus();
    return;
  }

  const formData = new FormData();

  formData.append('access_key', 'b6d39fa0-0475-4726-a82d-e2191a7316fb');
  formData.append('subject', 'Net Less | ' + subject);
  formData.append('from_name', 'Net Less User');
  formData.append('message', problem);

  try {

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success){

      toast('Report submitted successfully', 'ok');

      $('problemSubject').value = '';
      $('problemText').value = '';

    } else {

      toast('Failed to submit report', 'err');

    }

  } catch (error) {

    toast('Connection error. Try again.', 'err');

  }
}
/* ---------- TOAST ---------- */
function toast(msg, kind = 'info'){
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.textContent = msg;
  $('toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3000);
}

/* ---------- HELPERS ---------- */
function makeCode(){
  const b = crypto.getRandomValues(new Uint8Array(9));
  return [...b].map(x => ALPHABET[x % ALPHABET.length]).join('');
}

function parseRoom(str){
  if (!str) return null;
  let s = String(str).trim();
  try { const u = new URL(s); const r = u.searchParams.get('room'); if (r) s = r; } catch {}
  s = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = s.match(/[A-Z0-9]{9}$/);
  return m && [...m[0]].every(c => ALPHABET.includes(c)) ? m[0] : null;
}

function roomLink(){
  return location.href.split('#')[0].split('?')[0] + '?room=' + roomCode;
}

function hue(name){
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function avatar(name, cls = ''){
  const a = document.createElement('span');
  a.className = 'avatar ' + cls;
  a.style.setProperty('--h', hue(name));
  a.textContent = (name.trim()[0] || '?').toUpperCase();
  a.title = name;
  return a;
}

const clip = (s, n) => String(s || '').slice(0, n);
const timeNow = ts => new Date(ts || Date.now()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

function copyRaw(text, ok){
  const done = () => toast(ok, 'ok');
  if (navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text).then(done, fallback);
  } else fallback();
  function fallback(){
    const t = document.createElement('textarea');
    t.value = text; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch { toast('Could not copy', 'err'); }
    t.remove();
  }
}
const copyCode = () => copyRaw(roomCode, 'Room code copied');
const copyLink = () => copyRaw(roomLink(), 'Join link copied');

/* ---------- CHAT UI ---------- */
function addMsg(text, who, senderName, ts){
  const d = document.createElement('div');
  d.className = 'msg ' + who;
  if (who !== 'me' && senderName){
    const w = document.createElement('div');
    w.className = 'who'; w.style.setProperty('--h', hue(senderName));
    w.textContent = senderName; d.appendChild(w);
  }
  const t = document.createElement('div'); t.className = 'txt'; t.textContent = text; d.appendChild(t);
  const m = document.createElement('div'); m.className = 'time'; m.textContent = timeNow(ts); d.appendChild(m);
  $('chatBox').appendChild(d);
  $('chatBox').scrollTop = 1e7;
}

function sysMsg(text){
  const d = document.createElement('div');
  d.className = 'msg sys'; d.textContent = text;
  $('chatBox').appendChild(d);
  $('chatBox').scrollTop = 1e7;
}

function renderMembers(){
  const list = $('memberList'); list.innerHTML = '';
  const stack = $('avatarStack'); stack.innerHTML = '';
  [...members].forEach(([id, name], i) => {
    const row = document.createElement('div'); row.className = 'member';
    const left = document.createElement('span'); left.className = 'm-left';
    left.appendChild(avatar(name));
    const n = document.createElement('span');
    n.textContent = name + (id === myId ? ' (You)' : (isHost ? '' : (i === 0 ? '' : '')));
    left.appendChild(n); row.appendChild(left);
    const st = document.createElement('span'); st.className = 'online'; st.textContent = 'online';
    row.appendChild(st); list.appendChild(row);
    if (i < 5) stack.appendChild(avatar(name, 'sm'));
  });
  const c = members.size;
  $('memberCount').textContent = c;
  $('waiting').style.display = (isHost && c === 1) ? 'flex' : 'none';
  if (c > 5){ const more = document.createElement('span'); more.className = 'avatar sm more'; more.textContent = '+' + (c - 5); stack.appendChild(more); }
}

/* ---------- TYPING ---------- */
let typingTimer = null, typingSentAt = 0;
function showTyping(name){
  $('typing').innerHTML = '';
  const s = document.createElement('span'); s.textContent = name + ' is typing';
  const dots = document.createElement('span'); dots.className = 'dots'; dots.innerHTML = '<i></i><i></i><i></i>';
  $('typing').append(s, dots);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => $('typing').innerHTML = '', 1800);
}

/* ---------- NAME STEP ---------- */
function goToRoomOptions(){
  const input = $('name'), err = $('nameError'), name = input.value.trim();
  if (!name){
    input.classList.add('input-error'); err.style.display = 'block'; input.focus(); return;
  }
  input.classList.remove('input-error'); err.style.display = 'none';
  myName = name; $('userName').textContent = name;

  if (pendingRoom){                       // opened via QR / link
    $('joinCode').value = pendingRoom;
    show('s-join'); joinRoom(); pendingRoom = null;
  } else show('s-options');
}
$('name').addEventListener('input', function(){
  if (this.value.trim()){ this.classList.remove('input-error'); $('nameError').style.display = 'none'; }
});
$('name').addEventListener('keydown', e => { if (e.key === 'Enter') goToRoomOptions(); });

$('joinCode').addEventListener('input', function(){
  const p = parseRoom(this.value);
  if (p) this.value = p;
  else if (!this.value.includes('/')) this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
});
$('joinCode').addEventListener('keydown', e => { if (e.key === 'Enter') joinRoom(); });
$('joinPass').addEventListener('input', function(){
  this.value = this.value.replace(/\D/g, '').slice(0, 4);
});
$('joinPass').addEventListener('keydown', e => { if (e.key === 'Enter') joinRoom(); });

/* =========================================================
   HOST
========================================================= */
function startHost(attempt = 0){
  if (typeof Peer === 'undefined'){ toast('Could not load the connection library. Check your internet.', 'err'); return; }
  destroyPeer();
  isHost = true;
  roomCode = makeCode();
  roomPassword = '';
  members.clear(); members.set(myId, myName);
  guests.clear();

  peer = new Peer(PREFIX + roomCode);

  peer.on('open', () => {
    $('roomChip').textContent = roomCode;
    $('roomInfoBtn').style.display = '';
    drawCode(); drawQR(); renderMembers();
    $('passInput').value = '';
    $('passHint').textContent = 'No password (optional). Set one for extra safety.';
    $('chatBox').innerHTML = '';
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
    if (err.type === 'unavailable-id' && attempt < 4) return startHost(attempt + 1);
    if (!peer || !peer.open) toast('Could not create room. Check your internet and try again.', 'err');
  });
  peer.on('disconnected', () => { try { peer.reconnect(); } catch {} });
}

function drawCode(){
  const b = $('codeBoard'); b.innerHTML = '';
  [...roomCode].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ch'; s.textContent = ch; s.style.animationDelay = (i * 70) + 'ms';
    b.appendChild(s);
  });
}

function drawQR(){
  const box = $('qr'); box.innerHTML = '';
  new QRCode(box, { text: roomLink(), width: 168, height: 168, colorDark: '#06222b', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  $('qrHint').textContent = location.protocol === 'file:'
    ? 'Tip: host this page on a web address so the QR opens on phones. Guests can still type the code.'
    : 'Scan with any phone camera to join instantly.';
}

/* ---------- ROOM PASSWORD (host) ---------- */
function setPassword(){
  const v = $('passInput').value.trim();
  if (!/^\d{4}$/.test(v)){
    toast('Password must be exactly 4 digits', 'err');
    return;
  }
  roomPassword = v;
  $('passInput').value = '';
  $('passHint').textContent = 'Password protected — guests must enter this 4-digit code to join.';
  toast('Room password set', 'ok');
}

function removePassword(){
  if (!roomPassword){
    toast('No password is set', 'info');
    return;
  }
  roomPassword = '';
  $('passInput').value = '';
  $('passHint').textContent = 'No password (optional). Set one for extra safety.';
  toast('Room password removed', 'ok');
}

function hostBroadcast(obj, except){
  guests.forEach(g => { if (g !== except && g.id && g.conn.open) g.conn.send(obj); });
}

function hostData(entry, d){
  if (!d || typeof d !== 'object') return;

  if (d.t === 'hello' && !entry.id){
    if (roomPassword && clip(d.pass, 4) !== roomPassword){
      try { entry.conn.send({ t: 'badpass' }); } catch {}
      setTimeout(() => { try { entry.conn.close(); } catch {} }, 200);
      return;
    }

    entry.name = clip(d.name, 20).trim() || 'Guest';
    let id = clip(d.id, 12) || Math.random().toString(36).slice(2, 8);
    if (members.has(id)) id = Math.random().toString(36).slice(2, 8);
    entry.id = id;
    guests.set(entry.conn.peer, entry);

    entry.conn.send({ t: 'welcome', code: roomCode, members: [...members] });
    members.set(entry.id, entry.name);
    hostBroadcast({ t: 'join', id: entry.id, name: entry.name }, entry);
    sysMsg(entry.name + ' joined');
    toast(entry.name + ' joined', 'ok');
    renderMembers();
    return;
  }
  if (!entry.id) return;

  if (d.t === 'msg'){
    const m = { t: 'msg', id: entry.id, name: entry.name, text: clip(d.text, 1000), ts: Date.now() };
    addMsg(m.text, 'fr', m.name, m.ts);
    hostBroadcast(m, entry);
  } else if (d.t === 'typing'){
    showTyping(entry.name);
    hostBroadcast({ t: 'typing', name: entry.name }, entry);
  }
}

function hostDrop(entry){
  if (entry.dropped) return; entry.dropped = true;
  guests.delete(entry.conn.peer);
  if (entry.id && members.has(entry.id)){
    members.delete(entry.id);
    hostBroadcast({ t: 'leave', id: entry.id, name: entry.name });
    sysMsg(entry.name + ' left');
    renderMembers();
  }
}

function closeRoom(){
  if (!confirm('Close the room? Everyone will be disconnected.')) return;
  leaveRoom(true);
}

/* =========================================================
   GUEST
========================================================= */
function setJoining(on){
  $('joinBtn').classList.toggle('loading', on);
  $('joinBtn').disabled = on;
}

function joinAction(){ joinRoom(); }

function joinRoom(){
  const code = parseRoom($('joinCode').value);
  const st = $('joinStatus');
  if (!code){ setStatus(st, 'Enter a valid 9-character room code.', 'err'); return; }
  if (typeof Peer === 'undefined'){ setStatus(st, 'Could not load the connection library. Check your internet.', 'err'); return; }

  destroyPeer();
  isHost = false; roomCode = code;
  members.clear();
  setJoining(true);
  setStatus(st, 'Looking for room ' + code + '…', 'info');

  const passValue = $('joinPass').value.trim();

  let settled = false;
  const fail = msg => {
    if (settled) return; settled = true;
    setJoining(false); setStatus(st, msg, 'err'); destroyPeer();
  };
  const timeout = setTimeout(() => fail('Room not reachable. Make sure you are on the same Wi-Fi and the host is online.'), 15000);

  peer = new Peer();
  peer.on('error', err => {
    clearTimeout(timeout);
    fail(err.type === 'peer-unavailable' ? 'Room not found. Check the code and try again.' : 'Connection problem. Try again.');
  });

  peer.on('open', () => {
    hostConn = peer.connect(PREFIX + code, { reliable: true });

    hostConn.on('open', () => hostConn.send({ t: 'hello', name: myName, id: myId, pass: passValue }));

    hostConn.on('data', d => {
      if (!d || typeof d !== 'object') return;
      if (d.t === 'badpass'){
        clearTimeout(timeout);
        settled = true;
        awaitingPassword = true;
        setJoining(false);
        $('joinPass').style.display = 'block';
        $('joinPass').focus();
        setStatus(st, 'Wrong or missing password. Enter the room password and join again.', 'err');
        return;
      }
      if (d.t === 'welcome'){
        clearTimeout(timeout); settled = true; setJoining(false);
        d.members.forEach(([id, name]) => members.set(id, name));
        members.set(myId, myName);
        $('roomChip').textContent = roomCode;
        $('roomInfoBtn').style.display = 'none';
        $('chatBox').innerHTML = '';
        sysMsg('Connected to room ' + roomCode);
        renderMembers(); $('joinStatus').className = 'status'; show('s-chat');
      }
      else if (d.t === 'join'){ members.set(d.id, d.name); sysMsg(d.name + ' joined'); renderMembers(); }
      else if (d.t === 'leave'){ members.delete(d.id); sysMsg(d.name + ' left'); renderMembers(); }
      else if (d.t === 'msg'){ addMsg(clip(d.text, 1000), 'fr', d.name, d.ts); }
      else if (d.t === 'typing'){ showTyping(d.name); }
    });

    hostConn.on('close', () => {
      if (awaitingPassword){ awaitingPassword = false; destroyPeer(); return; }
      if (!settled) return fail('The host closed the room.');
      toast('The host closed the room', 'err');
      leaveRoom(true);
    });
  });
}

function setStatus(el, msg, cls){ el.className = 'status ' + cls; el.textContent = msg; }

/* =========================================================
   SEND
========================================================= */
function sendMsg(){
  const t = $('msgInput').value.trim();
  if (!t) return;
  const m = { t: 'msg', id: myId, name: myName, text: t, ts: Date.now() };

  if (isHost){
    if (guests.size === 0) toast('No one has joined yet. Share the room code.', 'info');
    hostBroadcast(m);
  } else if (hostConn && hostConn.open){
    hostConn.send(m);
  } else { toast('Not connected', 'err'); return; }

  addMsg(t, 'me', '', m.ts);
  $('msgInput').value = '';
}

$('msgInput').addEventListener('input', () => {
  const now = Date.now();
  if (now - typingSentAt < 1500) return;
  typingSentAt = now;
  const m = { t: 'typing', name: myName };
  if (isHost) hostBroadcast(m);
  else if (hostConn && hostConn.open) hostConn.send(m);
});

/* =========================================================
   EMOJI PICKER
========================================================= */
const EMOJI_CATS = [
  { label: '😀', ranges: [[0x1F600, 0x1F64F]] },              // Smileys & Emotion
  { label: '🐻', ranges: [[0x1F300, 0x1F5FF]] },              // Nature, faces, misc symbols/pictographs
  { label: '🚗', ranges: [[0x1F680, 0x1F6FF]] },              // Transport & Places
  { label: '🎉', ranges: [[0x1F900, 0x1F9FF], [0x1FA70, 0x1FAFF]] }, // Extra people/food/objects
  { label: '❤️', ranges: [[0x2600, 0x26FF], [0x2700, 0x27BF]] }      // Symbols & dingbats
];
let emojiBuilt = false;

function isEmojiChar(ch){
  try { return /\p{Extended_Pictographic}/u.test(ch); }
  catch { return true; }
}

function rangeEmojis(ranges){
  const out = [];
  ranges.forEach(([start, end]) => {
    for (let cp = start; cp <= end; cp++){
      const ch = String.fromCodePoint(cp);
      if (isEmojiChar(ch)) out.push(ch);
    }
  });
  return out;
}

function buildEmojiPicker(){
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

function renderEmojiGrid(i){
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

function selectEmojiCat(i){
  [...$('emojiTabs').children].forEach((b, idx) => b.classList.toggle('active', idx === i));
  renderEmojiGrid(i);
}

function insertEmoji(ch){
  const input = $('msgInput');
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = input.value.slice(0, start) + ch + input.value.slice(end);
  const pos = start + ch.length;
  input.focus();
  input.setSelectionRange(pos, pos);
}

function toggleEmojiPicker(){
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
function destroyPeer(){
  try { if (hostConn) hostConn.close(); } catch {}
  try { if (peer) peer.destroy(); } catch {}
  peer = null; hostConn = null; guests.clear();
}

function leaveRoom(silent){
  destroyPeer();
  members.clear(); isHost = false; roomPassword = '';
  $('chatBox').innerHTML = ''; $('typing').innerHTML = '';
  $('emojiPicker').classList.remove('open');
  setJoining(false);
  $('joinStatus').className = 'status';
  $('joinPass').style.display = 'none'; $('joinPass').value = '';
  show('s-options');
}

function leaveToOptions(){
  destroyPeer(); setJoining(false); $('joinStatus').className = 'status';
  $('joinPass').style.display = 'none'; $('joinPass').value = '';
  show('s-options');
}

/* =========================================================
   QR SCANNER
========================================================= */
let scanStream = null, scanning = false;

async function openScanner(){
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    toast('Camera needs a secure (https) page. Type the code instead.', 'err'); return;
  }
  if (typeof jsQR === 'undefined'){
    toast('QR library not loaded. Check your internet and reload.', 'err'); return;
  }
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch (e) {
    console.error('Camera error:', e);
    toast('Camera permission was denied', 'err'); return;
  }
  const v = $('scanVideo');
  v.srcObject = scanStream; await v.play();
  $('scanner').classList.add('open');
  scanning = true; requestAnimationFrame(scanTick);
}

function scanTick(){
  if (!scanning) return;
  const v = $('scanVideo');
  if (v.readyState >= 4){            // 4 = HAVE_ENOUGH_DATA
    const c = scanTick.c || (scanTick.c = document.createElement('canvas'));
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const r = jsQR(img.data, img.width, img.height);
    const code = r && parseRoom(r.data);
    if (code){ closeScanner(); $('joinCode').value = code; joinRoom(); return; }
  }
  requestAnimationFrame(scanTick);
}

function closeScanner(){
  scanning = false;
  if (scanStream) scanStream.getTracks().forEach(t => t.stop());
  scanStream = null;
  $('scanner').classList.remove('open');
}

/* =========================================================
   INIT – opened from a QR / link?
========================================================= */
(function init(){
  const r = parseRoom(new URLSearchParams(location.search).get('room'));
  if (r){
    pendingRoom = r;
    $('userName').textContent = '';
    $('nameError').textContent = 'Enter your name to join room ' + r + '.';
  }
})();
window.addEventListener('beforeunload', destroyPeer);
window.addEventListener('beforeunload', destroyPeer);
