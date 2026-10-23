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
  qEl.textContent     = content.finale.question;
  subEl.textContent   = content.finale.questionSub;
  btnYes.textContent  = content.finale.yes;
  btnNope.textContent = content.finale.notYet;

  // Heartbeat pulse
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

  function revealQuestion() {
    if (tapped) return;
    tapped = true;
    navigator.vibrate?.(40);
    burstConfetti(false);
    gsap.to(heartWrap, { opacity: 0, scale: 0.8, duration: 0.4, onComplete: () => {
      heartWrap.hidden = true;
      qSection.hidden = false;
      gsap.fromTo(qEl,       { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
      gsap.fromTo(subEl,     { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, delay: 1.5, ease: 'power2.out' });
      gsap.fromTo(buttonsEl, { opacity: 0 },         { opacity: 1, duration: 0.6, delay: 2.4 });
    }});
  }

  heart.addEventListener('click', revealQuestion);
  heart.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') revealQuestion(); });

  // ── Yes button ─────────────────────────────────────────────
  btnYes.addEventListener('click', () => {
    navigator.vibrate?.([30, 50, 30, 50, 60]);
    burstConfetti(true);

    // Short delay then show the yes screen
    setTimeout(showYesScreen, 900);
  });

  // ── Dodging "Let me think" — max 5 dodges ─────────────────
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
    const margin = 16;
    const bw = btnNope.offsetWidth;
    const bh = btnNope.offsetHeight;
    const newX = Math.max(margin, Math.random() * (window.innerWidth  - bw  - margin));
    const newY = Math.max(margin, Math.random() * (window.innerHeight - bh - margin));
    btnNope.style.position = 'fixed';
    btnNope.style.left = newX + 'px';
    btnNope.style.top  = newY + 'px';
    btnNope.style.zIndex = '300';
    if (!REDUCED) gsap.fromTo(btnNope, { scale: 0.9 }, { scale: 1, duration: 0.25, ease: 'back.out(1.7)' });
  }

  btnNope.addEventListener('pointerenter', dodge);
  btnNope.addEventListener('touchstart',   dodge, { passive: true });
  btnNope.addEventListener('click', () => { if (dodges >= MAX_DODGES) btnYes.click(); });
}

// ── Yes screen ─────────────────────────────────────────────
function showYesScreen() {
  const screen    = document.getElementById('yes-screen');
  const heartEl   = screen.querySelector('.yes-heart-shape');
  const namesEl   = screen.querySelector('.yes-names');
  const dateEl    = screen.querySelector('.yes-date');
  const msgEl     = screen.querySelector('.yes-msg');

  dateEl.textContent = content.finale.date;
  msgEl.textContent  = content.finale.yesMessage;

  screen.hidden = false;
  gsap.fromTo(screen, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' });

  if (REDUCED) {
    gsap.set([heartEl, namesEl, dateEl, msgEl], { opacity: 1 });
    gsap.set(heartEl, { rotate: 45, scale: 1 });
    return;
  }

  // Heart pops in
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

  // Second confetti wave after the screen settles
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.3 }, colors: ['#ffb86b','#ff6b8a','#fff'], zIndex: 700 });
  }, 2500);
}
