import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

import { content } from './content.js';
import { buildStory } from './story.js';
import { initFinale } from './finale.js';
import { initParticles } from './particles.js';

// ── Gate text ─────────────────────────────────────────────
document.querySelector('.gate-line').textContent  = content.gate.line;
document.getElementById('open-btn').textContent   = content.gate.button;

// ── Fade in gate elements ─────────────────────────────────
const gateLine = document.querySelector('.gate-line');
const openBtn  = document.getElementById('open-btn');

requestAnimationFrame(() => {
  gateLine.style.transition = 'opacity 1.4s ease 0.3s, transform 1.4s ease 0.3s';
  gateLine.style.opacity    = '1';
  gateLine.style.transform  = 'translateY(0)';
  openBtn.style.transition  = 'opacity 1.2s ease 1.2s, transform 1.2s ease 1.2s, background 0.2s, color 0.2s, transform 0.1s';
  openBtn.style.opacity     = '1';
  openBtn.style.transform   = 'translateY(0)';
});

// ── Music ─────────────────────────────────────────────────
const audio       = document.getElementById('song');
const muteBtn     = document.getElementById('mute-btn');
const iconOn      = document.getElementById('icon-sound');
const iconOff     = document.getElementById('icon-mute');
const songNote    = document.getElementById('song-note');
const songNoteText = document.getElementById('song-note-text');
let audioReady = false;

function startMusic() {
  if (audioReady) return;
  const tryPlay = audio.play();
  if (tryPlay === undefined) { audioReady = true; return; }
  tryPlay.then(() => {
    audioReady = true;
    audio.volume = 0;
    fadeVolume(0, 0.7, 3000);
    muteBtn.hidden = false;
    // Show song note
    songNoteText.textContent = content.songNote;
    songNote.hidden = false;
    requestAnimationFrame(() => songNote.classList.add('visible'));
  }).catch(() => { /* file missing or blocked – stay silent */ });
}

function fadeVolume(from, to, ms) {
  const steps = 40;
  const step  = (to - from) / steps;
  let current = from;
  const interval = setInterval(() => {
    current += step;
    audio.volume = Math.min(Math.max(current, 0), 1);
    if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
      audio.volume = to;
      clearInterval(interval);
    }
  }, ms / steps);
}

muteBtn.addEventListener('click', () => {
  if (audio.muted) {
    audio.muted = false;
    iconOn.hidden  = false;
    iconOff.hidden = true;
    muteBtn.setAttribute('aria-label', 'Mute music');
  } else {
    audio.muted = true;
    iconOn.hidden  = true;
    iconOff.hidden = false;
    muteBtn.setAttribute('aria-label', 'Unmute music');
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio.pause();
  else if (audioReady && !audio.muted) audio.play().catch(() => {});
});

// ── Open button ───────────────────────────────────────────
document.getElementById('open-btn').addEventListener('click', () => {
  startMusic();

  const gate  = document.getElementById('gate');
  const story = document.getElementById('story');

  gate.style.transition = 'opacity 0.8s ease';
  gate.style.opacity    = '0';

  setTimeout(() => {
    gate.hidden  = true;
    story.hidden = false;
    story.style.opacity = '0';
    story.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => { story.style.opacity = '1'; });

    buildStory();
    initFinale();
    initParticles();
  }, 800);
});
