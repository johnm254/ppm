import confetti from 'canvas-confetti';
import { gsap } from 'gsap';
import { content } from './content.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initFinale() {
  const heart      = document.getElementById('heart');
  const heartWrap  = document.getElementById('heart-wrap');
  const prompt     = document.getElementById('heart-prompt');
  const qSection   = document.getElementById('finale-question');
  const qEl        = document.getElementById('finale-q');
  const subEl      = document.getElementById('finale-sub');
  const buttonsEl  = document.getElementById('finale-buttons');
  const btnYes     = document.getElementById('btn-yes');
  const btnNope    = document.getElementById('btn-nope');

  prompt.textContent  = content.finale.prompt;
  subEl.textContent   = content.finale.questionSub;
  btnYes.textContent  = content.finale.yes;
  btnNope.textContent = content.finale.notYet;

  if (!REDUCED) {
    gsap.to(heart, {
      scale: 1.08, duration: 0.6, repeat: -1, yoyo: true, ease: 'power1.inOut',
    });
  }

  let tapped = false;

  function burstConfetti(big = false) {
    if (REDUCED) return;
    const defaults = { spread: big ? 110 : 80, startVelocity: big ? 45 : 35, ticks: big ? 120 : 80, zIndex: 600 };
    const heartShape = confetti.shapeFromPath({
      path: 'M0,-10 C10,-30 30,-10 0,15 C-30,-10 -10,-30 0,-10Z',
    });
    const colors = ['#ff6b8a', '#ffb86b', '#fff', '#ffd6e0'];
    confetti({ ...defaults, particleCount: big ? 100 : 60, origin: { y: 0.55 }, shapes: [heartShape], colors });
    confetti({ ...defaults, particleCount: big ? 60 : 40, angle: 60,  origin: { x: 0, y: 0.6 }, colors });
    confetti({ ...defaults, particleCount: big ? 60 : 40, angle: 120, origin: { x: 1, y: 0.6 }, colors });
  }

  function revealWordByWord(el, text, delay, stagger) {
    el.innerHTML = '';
    const words = text.split(' ');
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.style.cssText = 'display: inline; opacity: 0;';
      span.textContent = i < words.length - 1 ? word + ' ' : word;
      el.appendChild(span);
    });
    if (!REDUCED) {
      gsap.to(el.querySelectorAll('span'), {
        opacity: 1, duration: 0.55, ease: 'power2.out', stagger, delay,
      });
    } else {
      gsap.set(el.querySelectorAll('span'), { opacity: 1 });
    }
    return words.length * stagger + delay;
  }

  function revealQuestion() {
    if (tapped) return;
    tapped = true;
    navigator.vibrate?.(40);
    burstConfetti(false);
    gsap.to(heartWrap, { opacity: 0, scale: 0.8, duration: 0.4, onComplete: () => {
      heartWrap.hidden = true;
      qSection.hidden = false;
      const qDone = revealWordByWord(qEl, content.finale.question, 0.15, 0.1);
      gsap.fromTo(subEl,     { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, delay: qDone + 0.35, ease: 'power2.out' });
      gsap.fromTo(buttonsEl, { opacity: 0 },         { opacity: 1, duration: 0.6, delay: qDone + 1.25 });
    }});
  }

  heart.addEventListener('click', revealQuestion);
  heart.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') revealQuestion(); });

  // ── Yes button ─────────────────────────────────────────────
  btnYes.addEventListener('click', () => {
    navigator.vibrate?.([30, 50, 30, 50, 60]);
    burstConfetti(true);
    setTimeout(showYesScreen, 900);
  });

  // ── Dodging "Let me think" — smooth GSAP fly, max 5 dodges ─
  let dodges = 0;
  const MAX_DODGES = 5;

  function dodge() {
    if (dodges >= MAX_DODGES) return;
    dodges++;
    if (dodges >= MAX_DODGES) {
      btnNope.textContent = 'Okay, yes 💛';
      btnNope.removeEventListener('pointerenter', dodge);
      btnNope.removeEventListener('touchstart',   dodge);
      return;
    }
    const margin = 20;
    const bw = btnNope.offsetWidth;
    const bh = btnNope.offsetHeight;
    const newX = margin + Math.random() * (window.innerWidth  - bw - margin * 2);
    const newY = margin + Math.random() * (window.innerHeight - bh - margin * 2);

    if (dodges === 1) {
      const rect = btnNope.getBoundingClientRect();
      btnNope.style.position = 'fixed';
      btnNope.style.left = rect.left + 'px';
      btnNope.style.top  = rect.top  + 'px';
      btnNope.style.zIndex = '300';
    }

    if (!REDUCED) {
      gsap.to(btnNope, { left: newX, top: newY, duration: 0.45, ease: 'back.out(1.5)' });
      gsap.fromTo(btnNope, { scale: 1.12 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    } else {
      btnNope.style.left = newX + 'px';
      btnNope.style.top  = newY + 'px';
    }
  }

  btnNope.addEventListener('pointerenter', dodge);
  btnNope.addEventListener('touchstart',   dodge, { passive: true });
  btnNope.addEventListener('click', () => { if (dodges >= MAX_DODGES) btnYes.click(); });
}

// ── Yes screen ─────────────────────────────────────────────
function spawnFallingHearts(container) {
  if (REDUCED) return;
  for (let i = 0; i < 16; i++) {
    const h = document.createElement('span');
    h.className = 'falling-heart';
    h.textContent = Math.random() > 0.45 ? '♡' : '♥';
    h.style.cssText = [
      `left: ${2 + Math.random() * 96}%`,
      `font-size: ${11 + Math.floor(Math.random() * 16)}px`,
      `animation-duration: ${3.5 + Math.random() * 3.5}s`,
      `animation-delay: ${Math.random() * 3.5}s`,
      `color: ${Math.random() > 0.5 ? 'var(--accent)' : 'var(--accent-2)'}`,
    ].join(';');
    container.appendChild(h);
  }
}

function showYesScreen() {
  const screen  = document.getElementById('yes-screen');
  const heartEl = screen.querySelector('.yes-heart-shape');
  const namesEl = screen.querySelector('.yes-names');
  const dateEl  = screen.querySelector('.yes-date');
  const msgEl   = screen.querySelector('.yes-msg');

  dateEl.textContent = content.finale.date;
  msgEl.textContent  = content.finale.yesMessage;

  screen.hidden = false;
  spawnFallingHearts(screen);
  gsap.fromTo(screen, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' });

  if (REDUCED) {
    gsap.set([heartEl, namesEl, dateEl, msgEl], { opacity: 1 });
    gsap.set(heartEl, { rotate: 45, scale: 1 });
    return;
  }

  gsap.fromTo(heartEl,
    { rotate: 45, scale: 0 },
    { rotate: 45, scale: 1, duration: 0.7, delay: 0.3, ease: 'back.out(1.6)',
      onComplete: () => {
        gsap.to(heartEl, { scale: 1.06, duration: 0.7, repeat: -1, yoyo: true, ease: 'power1.inOut' });
      }
    }
  );
  gsap.fromTo(namesEl, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.9,  ease: 'power2.out' });
  gsap.fromTo(dateEl,  { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, delay: 1.5,  ease: 'power2.out' });
  gsap.fromTo(msgEl,   { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, delay: 2.1,  ease: 'power2.out' });

  setTimeout(() => {
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.3 }, colors: ['#ffb86b','#ff6b8a','#fff'], zIndex: 700 });
  }, 2500);
}
