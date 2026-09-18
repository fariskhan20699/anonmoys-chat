let peers = [];        // {pc, dc, name, id}
let myName = '', isHost = false, myId = Math.random().toString(36).slice(2,8);
const $ = id => document.getElementById(id);

function show(id){
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
  $(id).classList.add('active');
}
function goBack(){ show(isHost ? 's-host' : 's-chat'); }
function copyText(id){
  $(id).select(); document.execCommand('copy');
  if(navigator.clipboard) navigator.clipboard.writeText($(id).value);
}
function setStatus(el, msg, cls){
  el.className = 'status ' + cls; el.textContent = msg;
}
function addMsg(text, who, senderName){
  const d = document.createElement('div');
  d.className = 'msg ' + who;
  if(senderName && who !== 'me'){
    const w = document.createElement('div'); w.className='who'; w.textContent = senderName;
    d.appendChild(w);
  }
  const t = document.createElement('div'); t.textContent = text;
  d.appendChild(t);
  $('chatBox').appendChild(d);
  $('chatBox').scrollTop = 999999;
}
function sysMsg(text){
  const d = document.createElement('div');
  d.className = 'msg sys'; d.textContent = text;
  $('chatBox').appendChild(d);
  $('chatBox').scrollTop = 999999;
}
function waitIce(peer){
  return new Promise(res=>{
    if(peer.iceGatheringState === 'complete') return res();
    const t = setInterval(()=>{
      if(peer.iceGatheringState === 'complete'){ clearInterval(t); res(); }
    }, 200);
    setTimeout(()=>{ clearInterval(t); res(); }, 6000);
  });
}
const encode = d => btoa(JSON.stringify(d));
const decode = c => JSON.parse(atob(c.trim()));
const shortId = id => id.slice(0,4);

/* ---------- HOST ---------- */
function startHost(){
  myName = $('name').value.trim() || 'Host';
  isHost = true;
  $('memberList').innerHTML = memberRow(myName + ' (You)', true);
  show('s-host');
}

function memberRow(name, isYou){
  return `<div class="member"><span><span class="dot"></span>${name}${isYou?'':''}</span><span style="font-size:11px;color:#9fd8e8">online</span></div>`;
}

async function genMemberCode(){
  setStatus($('hostStatus'), '⏳ Creating Link...', 'info');
  const pc = new RTCPeerConnection({iceServers:[]});
  pc.createDataChannel('chat');
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitIce(pc);
  $('memberOffer').value = encode(pc.localDescription);
  $('memberAnswer').value = '';
  $('addArea').style.display = 'block';
  $('hostStatus').className = 'status';
  genMemberCode._pendingPc = pc;
}

async function acceptMember(){
  try{
    const pc = genMemberCode._pendingPc;
    await pc.setRemoteDescription(decode($('memberAnswer').value));
    $('addArea').style.display = 'none';
    $('memberAnswer').value = '';
    setStatus($('hostStatus'), '✅ Connecting member...', 'ok');
  }catch(e){ setStatus($('hostStatus'), '❌ wrong reply code!', 'err'); }
}

function hostSetupChannel(pc, dc){
  const peer = {pc, dc, name:'', id:''};
  peers.push(peer);
  dc.onopen = ()=>{
    dc.send(JSON.stringify({type:'hello', name: myName, id: myId}));
  };
  dc.onmessage = e=>{
    try{ var data = JSON.parse(e.data); }catch{ return; }
    if(data.type === 'hello'){
      peer.name = data.name; peer.id = data.id;
      $('memberList').innerHTML += memberRow(peer.name);
      $('memberCount').textContent = peers.length + 1;
      sysMsg('👋 ' + peer.name + ' join ho gaya!');
      // tell others about new member
      relay(peer, JSON.stringify({type:'peer-joined', name: peer.name, id: peer.id}));
      // send existing members list to newcomer
      const others = peers.filter(p=>p!==peer&&p.name).map(p=>({name:p.name,id:p.id}));
      if(others.length) dc.send(JSON.stringify({type:'peers-list', list: others}));
    }
    else if(data.type === 'msg'){
      addMsg(data.text, 'fr', data.name);
      relay(peer, JSON.stringify({type:'msg', text:data.text, name:data.name}));
    }
    else if(data.type === 'typing'){
      $('typing').textContent = data.name + ' typing...';
      setTimeout(()=>$('typing').textContent='',1500);
    }
  };
}

function relay(fromPeer, msgStr){
  peers.forEach(p=>{ if(p!==fromPeer && p.dc && p.dc.readyState==='open') p.dc.send(msgStr); });
}

/* ---------- JOINER ---------- */
async function joinRoom(){
  try{
    myName = $('name').value.trim() || 'Guest';
    setStatus($('joinStatus'), '⏳ Connecting...', 'ok');
    const pc = new RTCPeerConnection({iceServers:[]});
    pc.ondatachannel = e => {
      const dc = e.channel;
      peers.push({pc, dc, name:'Host', id:'host'});
      dc.onopen = ()=>{
        dc.send(JSON.stringify({type:'hello', name: myName, id: myId}));
        show('s-chat');
        sysMsg('✅ Connected to the Room');
      };
      dc.onmessage = ev=>{
        try{ var data = JSON.parse(ev.data); }catch{ return; }
        if(data.type === 'hello'){ peers[0].name = data.name; }
        else if(data.type === 'peers-list'){
          data.list.forEach(p=> sysMsg('👥 ' + p.name + ' is in the room'));
        }
        else if(data.type === 'peer-joined'){ sysMsg('👋 ' + data.name + ' join sucessfully'); }
        else if(data.type === 'msg'){ addMsg(data.text, 'fr', data.name); }
        else if(data.type === 'typing'){ $('typing').textContent = data.name + ' typing...'; setTimeout(()=>$('typing').textContent='',1500); }
      };
    };
    await pc.setRemoteDescription(decode($('joinCode').value));
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    await waitIce(pc);
    $('myAnswer').value = encode(pc.localDescription);
    $('joinStatus').className = 'status'; $('joinStatus').style.display='none';
    show('s-answer');
  }catch(e){ setStatus($('joinStatus'), '❌ Wrong code! Try Again.', 'err'); }
}

/* ---------- CHAT ---------- */
let typingSent = false;
document.addEventListener('input', e=>{
  if(e.target.id === 'msgInput' && !typingSent){
    typingSent = true;
    broadcast(JSON.stringify({type:'typing', name:myName}));
    setTimeout(()=>typingSent=false, 2000);
  }
});

function broadcast(str){
  peers.forEach(p=>{ if(p.dc && p.dc.readyState==='open') p.dc.send(str); });
}
function sendMsg(){
  const t = $('msgInput').value.trim();
  if(!t) return;
  if(peers.length === 0){ sysMsg('⚠️No one is connected yet. Add a member first.'); return; }
  broadcast(JSON.stringify({type:'msg', text:t, name:myName}));
  addMsg(t, 'me');
  $('msgInput').value = '';
}

/* wire host datachannels: intercept createDataChannel */
const _origCDC = RTCPeerConnection.prototype.createDataChannel;
RTCPeerConnection.prototype.createDataChannel = function(label, opts){
  const dc = _origCDC.call(this, label, opts);
  if(isHost && label === 'chat') hostSetupChannel(this, dc);
  return dc;
};