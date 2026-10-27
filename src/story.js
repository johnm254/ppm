import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content } from './content.js';
import { typewriter } from './typewriter.js';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PLACEHOLDERS = [
  { src: '/photos/placeholder-1.svg', caption: 'A moment with you' },
  { src: '/photos/placeholder-2.svg', caption: 'Something about this day' },
  { src: '/photos/placeholder-3.svg', caption: 'Us, somehow' },
];

// ── Chat scene with live typing indicators ────────────────
function buildChatScene(sectionEl, sceneData, isHardDay = false) {
  const dateEl    = sectionEl.querySelector('.scene-date');
  const bubblesEl = sectionEl.querySelector('.bubbles');
  const afterEl   = sectionEl.querySelector('.after-line');

  dateEl.textContent  = sceneData.title;
  afterEl.textContent = sceneData.after;

  gsap.set([dateEl, afterEl], { opacity: 0, y: 8 });

  if (REDUCED) {
    gsap.set([dateEl, afterEl], { opacity: 1, y: 0 });
    sceneData.bubbles.forEach(b => addBubble(bubblesEl, b));
    return;
  }

  const typingTime = isHardDay ? 1.1 : 0.65;
  const gap        = isHardDay ? 0.5  : 0.3;

  // Typing indicator element (reused)
  const typingEl = document.createElement('div');
  typingEl.className = 'typing-indicator';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  gsap.set(typingEl, { opacity: 0 });

  ScrollTrigger.create({
    trigger: sectionEl,
    start: 'top 72%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline();

      // Date label in
      tl.to(dateEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });

      sceneData.bubbles.forEach((b, i) => {
        const isMe = b.from === 'me';

        // Append typing indicator before this bubble appears
        tl.call(() => {
          typingEl.className = `typing-indicator typing-${isMe ? 'me' : 'her'}`;
          bubblesEl.appendChild(typingEl);
        }, null, `+=${i === 0 ? 0.15 : gap}`);

        tl.to(typingEl, { opacity: 1, duration: 0.2 });
        tl.to(typingEl, { opacity: 0, duration: 0.15 }, `+=${typingTime}`);

        // Build and animate the bubble
        tl.call(() => {
          typingEl.remove();
          const div = addBubble(bubblesEl, b, true);
          gsap.fromTo(div,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: isHardDay ? 0.9 : 0.6, ease: 'power2.out' }
          );
        }, null, '<+0.08');
      });

      tl.to(afterEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '+=0.45');
    },
  });
}

function addBubble(container, b, returnEl = false) {
  const div = document.createElement('div');
  div.className = `bubble bubble-${b.from === 'me' ? 'me' : 'her'}`;
  div.textContent = b.text;
  container.appendChild(div);
  return returnEl ? div : undefined;
}

// ── Photos ────────────────────────────────────────────────
function buildPhotosScene() {
  const stack  = document.querySelector('#scene-photos .photos-stack');
  const photos = content.photos.length > 0 ? content.photos : PLACEHOLDERS;
  let photoIndex = 0;

  photos.forEach(entry => {
    if (entry.divider) {
      const div = document.createElement('div');
      div.className = 'photo-divider';
      div.innerHTML = `
        <div class="photo-divider-lines"><span></span><i>♡</i><span></span></div>
        <p class="photo-divider-label">${entry.label}</p>`;
      stack.appendChild(div);
      if (!REDUCED) {
        gsap.fromTo(div, { opacity: 0 }, {
          opacity: 1, duration: 1.0, ease: 'power2.out',
          scrollTrigger: { trigger: div, start: 'top 88%', toggleActions: 'play none none none' }
        });
      } else {
        gsap.set(div, { opacity: 1 });
      }
      return;
    }

    const item = document.createElement('div');
    item.className = 'photo-item';

    const img = document.createElement('img');
    img.src      = entry.src;
    img.alt      = entry.caption || '';
    img.loading  = 'lazy';
    img.decoding = 'async';

    const frame = document.createElement('div');
    frame.className = 'photo-frame';
    frame.appendChild(img);
    if (entry.caption) {
      const cap = document.createElement('p');
      cap.className   = 'photo-caption';
      cap.textContent = entry.caption;
      frame.appendChild(cap);
    }
    item.appendChild(frame);
    stack.appendChild(item);

    if (REDUCED) {
      gsap.set(item, { opacity: 1, y: 0 });
    } else {
      const tilt = photoIndex % 2 === 0 ? -2 : 2;
      gsap.fromTo(item,
        { opacity: 0, y: 34, rotate: tilt },
        {
          opacity: 1, y: 0, rotate: 0,
          duration: 1.1, ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    }
    photoIndex++;
  });
}

// ── Safe scene — word by word ─────────────────────────────
function buildSafeScene() {
  const quoteEl = document.querySelector('#scene-safe .safe-quote');
  const afterEl = document.querySelector('#scene-safe .safe-after');
  afterEl.textContent = content.safe.after;

  const words = content.safe.her.split(' ');
  quoteEl.innerHTML = '';
  ['"', ...words.map((w, i) => i < words.length - 1 ? w : w + '"')]
    .forEach(token => {
      const span = document.createElement('span');
      span.className   = 'safe-word';
      span.textContent = token === '"' ? token : token + ' ';
      quoteEl.appendChild(span);
    });

  const wordSpans = quoteEl.querySelectorAll('.safe-word');
  gsap.set(wordSpans, { opacity: 0, y: 6 });
  gsap.set(afterEl,   { opacity: 0, y: 8 });

  if (REDUCED) {
    gsap.set(wordSpans, { opacity: 1, y: 0 });
    gsap.set(afterEl,   { opacity: 1, y: 0 });
    return;
  }

  ScrollTrigger.create({
    trigger: '#scene-safe',
    start: 'top 60%',
    once: true,
    onEnter: () => {
      gsap.to(wordSpans, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.22 });
      gsap.to(afterEl,   { opacity: 1, y: 0, duration: 0.8,  ease: 'power2.out', delay: wordSpans.length * 0.22 + 0.6 });
    },
  });
}

// ── Letter ────────────────────────────────────────────────
function buildLetterScene() {
  const bodyEl = document.querySelector('.letter-body');
  const skipEl = document.querySelector('.letter-skip');
  let tw, done = false;

  const onDone = () => {
    done = true;
    skipEl.classList.add('hidden');
    bodyEl.querySelectorAll('.letter-para').forEach(p => { p.style.opacity = '1'; p.style.transform = 'none'; });
  };

  ScrollTrigger.create({
    trigger: '#scene-letter',
    start: 'top 60%',
    once: true,
    onEnter: () => { if (!tw) tw = typewriter(bodyEl, content.letter, onDone); },
  });

  const doSkip = () => { if (!done) tw?.skip(); };
  document.querySelector('.letter-card').addEventListener('click', doSkip);
  skipEl.addEventListener('click', doSkip);
}

// ── Finale heart entrance ─────────────────────────────────
function buildFinaleHeart() {
  const heartWrap = document.getElementById('heart-wrap');
  if (REDUCED) { gsap.set(heartWrap, { opacity: 1 }); return; }
  gsap.fromTo(heartWrap,
    { opacity: 0, scale: 0.8 },
    {
      opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '#scene-finale', start: 'top 70%', toggleActions: 'play none none none' }
    }
  );
}

// ── Reading progress bar ──────────────────────────────────
function buildProgress() {
  const bar = document.getElementById('read-progress');
  if (!bar) return;
  ScrollTrigger.create({
    trigger: '#story',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: self => { bar.style.height = (self.progress * 100) + '%'; },
  });
}

// ── Entry point ───────────────────────────────────────────
export function buildStory() {
  buildChatScene(document.getElementById('scene-start'),   content.start,   false);
  buildChatScene(document.getElementById('scene-playful'), content.playful, false);
  buildPhotosScene();
  buildChatScene(document.getElementById('scene-hard'),    content.hardDay, true);
  buildSafeScene();
  buildLetterScene();
  buildFinaleHeart();
  buildProgress();
}
