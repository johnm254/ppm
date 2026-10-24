import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

import { gsap } from 'gsap';
import { content } from './content.js';
import { buildStory } from './story.js';
import { initFinale } from './finale.js';
import { initParticles } from './particles.js';

// ── Gate text ─────────────────────────────────────────────
const gateLine = document.querySelector('.gate-line');
const openBtn  = document.getElementById('open-btn');
gateLine.textContent = content.gate.line;
openBtn.textContent  = content.gate.button;

// ── Music ─────────────────────────────────────────────────
const audio        = document.getElementById('song');
const muteBtn      = document.getElementById('mute-btn');
const iconOn       = document.getElementById('icon-sound');
const iconOff      = document.getElementById('icon-mute');
const songNote     = document.getElementById('song-note');
const songNoteText = document.getElementById('song-note-text');
let audioReady = false;

function startMusic() {
  if (audioReady) return;
  const tryPlay = audio.play();
  if (!tryPlay) { audioReady = true; return; }
  tryPlay.then(() => {
    audioReady = true;
    audio.volume = 0;
    fadeVolume(0, 0.7, 3000);
    muteBtn.hidden = false;
    songNoteText.textContent = content.songNote;
    songNote.hidden = false;
    requestAnimationFrame(() => songNote.classList.add('visible'));
  }).catch(() => {});
}

function fadeVolume(from, to, ms) {
  const steps = 40;
  const step  = (to - from) / steps;
  let current = from;
  const iv = setInterval(() => {
    current += step;
    audio.volume = Math.min(Math.max(current, 0), 1);
    if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
      audio.volume = to;
      clearInterval(iv);
    }
  }, ms / steps);
}

muteBtn.addEventListener('click', () => {
  audio.muted = !audio.muted;
  iconOn.hidden  =  audio.muted;
  iconOff.hidden = !audio.muted;
  muteBtn.setAttribute('aria-label', audio.muted ? 'Unmute music' : 'Mute music');
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio.pause();
  else if (audioReady && !audio.muted) audio.play().catch(() => {});
});

// ── Open button ───────────────────────────────────────────
openBtn.addEventListener('click', () => {
  startMusic();

  const gate      = document.getElementById('gate');
  const story     = document.getElementById('story');
  const scrollHint = document.getElementById('scroll-hint');
  const progress  = document.getElementById('read-progress');

  gsap.to(gate, {
    opacity: 0, duration: 0.7, ease: 'power2.in',
    onComplete: () => {
      gate.hidden  = true;
      story.hidden = false;
      scrollHint.hidden = false;
      progress.hidden   = false;

      gsap.fromTo(story, { opacity: 0 }, { opacity: 1, duration: 0.6 });
      gsap.fromTo(scrollHint, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.5 });

      buildStory();
      initFinale();
      initParticles();

      // Hide scroll hint on first scroll
      window.addEventListener('scroll', () => {
        gsap.to(scrollHint, { opacity: 0, duration: 0.4, onComplete: () => { scrollHint.hidden = true; } });
      }, { once: true, passive: true });
    }
  });
});
