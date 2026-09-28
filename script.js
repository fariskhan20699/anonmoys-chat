
(function(){
  'use strict';

  // Single source of truth for the launch date — used by countdown, progress and footer.
  var LAUNCH_DATE = new Date('October 10, 2026 00:00:00').getTime();
  var START_DATE  = new Date('June 1, 2026 00:00:00').getTime();

  var $ = function(id){ return document.getElementById(id); };
  var els = {
    daysT:$('days-t'), daysU:$('days-u'),
    hoursT:$('hours-t'), hoursU:$('hours-u'),
    minT:$('min-t'), minU:$('min-u'),
    secT:$('sec-t'), secU:$('sec-u'),
    countdown:$('countdown'),
    progressWrap:$('progressWrap'), progressFill:$('progressFill'),
    progressPct:$('progressPct'), progressDate:$('progressDate'),
    launched:$('launched'), email:$('email'), notifyMsg:$('notifyMsg'),
    notifyBtn:$('notifyBtn')
  };

  function createDigit(el, value){
    if(!el) return;
    el.innerHTML =
      '<div class="half top"><span>'+value+'</span></div>'+
      '<div class="half bottom"><span>'+value+'</span></div>'+
      '<div class="half flap-top"><span>'+value+'</span></div>'+
      '<div class="half flap-bottom"><span>'+value+'</span></div>';
  }

  var previous = { daysT:null, daysU:null, hoursT:null, hoursU:null, minT:null, minU:null, secT:null, secU:null };

  function updateDigit(el, newValue, key){
    if(!el) return;
    if(previous[key] === null){ createDigit(el, newValue); previous[key] = newValue; return; }
    if(previous[key] === newValue) return;
    previous[key] = newValue;

    var top = el.querySelector('.top span');
    var bottom = el.querySelector('.bottom span');
    var flapTop = el.querySelector('.flap-top');
    var flapBottom = el.querySelector('.flap-bottom');
    var flapTopText = el.querySelector('.flap-top span');
    var flapBottomText = el.querySelector('.flap-bottom span');
    if(!top || !bottom || !flapTop || !flapBottom){ createDigit(el, newValue); return; }

    var oldValue = top.textContent;
    flapTopText.textContent = oldValue;
    flapBottomText.textContent = newValue;

    flapTop.classList.remove('flip-top');
    flapBottom.classList.remove('flip-bottom');
    void flapTop.offsetWidth;
    void flapBottom.offsetWidth;

    flapTop.classList.add('flip-top');
    setTimeout(function(){ flapBottom.classList.add('flip-bottom'); }, 150);
    setTimeout(function(){
      top.textContent = newValue;
      bottom.textContent = newValue;
      flapTop.classList.remove('flip-top');
      flapBottom.classList.remove('flip-bottom');
      flapTopText.textContent = newValue;
      flapBottomText.textContent = newValue;
    }, 500);
  }

  function pad(n){ return String(n).padStart(2, '0'); }

  var timer;
  function updateCountdown(){
    var now = Date.now();
    var distance = LAUNCH_DATE - now;

    if(distance <= 0){
      clearInterval(timer);
      els.countdown.style.display = 'none';
      els.progressWrap.style.display = 'none';
      els.launched.style.display = 'block';
      return;
    }

    var days = Math.floor(distance / 86400000);
    var hours = Math.floor((distance % 86400000) / 3600000);
    var minutes = Math.floor((distance % 3600000) / 60000);
    var seconds = Math.floor((distance % 60000) / 1000);

    var d = pad(days), h = pad(hours), m = pad(minutes), s = pad(seconds);

    updateDigit(els.daysT, d[0], 'daysT');
    updateDigit(els.daysU, d[1], 'daysU');
    updateDigit(els.hoursT, h[0], 'hoursT');
    updateDigit(els.hoursU, h[1], 'hoursU');
    updateDigit(els.minT, m[0], 'minT');
    updateDigit(els.minU, m[1], 'minU');
    updateDigit(els.secT, s[0], 'secT');
    updateDigit(els.secU, s[1], 'secU');

    updateProgress(now);
  }

  function updateProgress(now){
    var total = LAUNCH_DATE - START_DATE;
    var done = Math.min(Math.max(now - START_DATE, 0), total);
    var pct = total > 0 ? Math.round((done / total) * 100) : 100;

    els.progressFill.style.width = pct + '%';
    els.progressPct.textContent = pct + '%';
    els.progressDate.textContent = 'target: ' + new Date(LAUNCH_DATE).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  }

  timer = setInterval(updateCountdown, 1000);
  updateCountdown();

  // ---------- Notify me (stored locally in this browser; no backend configured) ----------
  function showMsg(text, isErr){
    els.notifyMsg.textContent = text || '';
    els.notifyMsg.classList.toggle('err', !!isErr);
  }

  function notifyMe(){
    var email = els.email.value.trim();
    if(!email) return showMsg('Please enter your email.', true);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMsg('Please enter a valid email.', true);

    els.notifyBtn.disabled = true;
    els.notifyBtn.textContent = 'Saving…';
    showMsg('');

    try {
      var list = JSON.parse(localStorage.getItem('netless-notify') || '[]');
      if(list.indexOf(email) === -1) list.push(email);
      localStorage.setItem('netless-notify', JSON.stringify(list));
      showMsg("You're on the list! We'll notify you when Netless Code launches.");
      els.email.value = '';
    } catch(err){
      showMsg('Could not save your email on this device. Try again.', true);
    }

    els.notifyBtn.disabled = false;
    els.notifyBtn.textContent = 'Notify Me';
  }

  els.notifyBtn.addEventListener('click', notifyMe);
  els.email.addEventListener('keydown', function(e){ if(e.key === 'Enter') notifyMe(); });
})();