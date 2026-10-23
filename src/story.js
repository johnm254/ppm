import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content } from './content.js';
import { typewriter } from './typewriter.js';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Placeholder images shown when photos array is empty
const PLACEHOLDERS = [
  { src: '/photos/placeholder-1.svg', caption: 'A moment with you' },
  { src: '/photos/placeholder-2.svg', caption: 'Something about this day' },
  { src: '/photos/placeholder-3.svg', caption: 'Us, somehow' },
];

function fadeIn(el, delay = 0, y = 16) {
  if (REDUCED) { gsap.set(el, { opacity: 1, y: 0 }); return; }
  gsap.fromTo(el,
    { opacity: 0, y },
    { opacity: 1, y: 0, duration: 0.9, delay, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    }
  );
}

function buildChatScene(sectionEl, sceneData, isHardDay = false) {
  const dateEl   = sectionEl.querySelector('.scene-date');
  const bubblesEl = sectionEl.querySelector('.bubbles');
  const afterEl  = sectionEl.querySelector('.after-line');

  dateEl.textContent  = sceneData.title;
  afterEl.textContent = sceneData.after;

  fadeIn(dateEl, 0, 8);

  const bubbleDelay = isHardDay ? 0.9 : 0.6;

  sceneData.bubbles.forEach((b, i) => {
    const div = document.createElement('div');
    div.className = `bubble bubble-${b.from === 'me' ? 'me' : 'her'}`;
    div.textContent = b.text;
    bubblesEl.appendChild(div);

    if (REDUCED) {
      gsap.set(div, { opacity: 1, y: 0 });
    } else {
      gsap.fromTo(div,
        { opacity: 0, y: 10 },
        {
          opacity: 1, y: 0,
          duration: isHardDay ? 1.1 : 0.7,
          delay: i * bubbleDelay,
          ease: 'power2.out',
          scrollTrigger: { trigger: bubblesEl, start: 'top 80%', toggleActions: 'play none none none' }
        }
      );
    }
  });

  fadeIn(afterEl, sceneData.bubbles.length * bubbleDelay + 0.3, 8);
}

function buildPhotosScene() {
  const stack = document.querySelector('#scene-photos .photos-stack');
  const photos = content.photos.length > 0 ? content.photos : PLACEHOLDERS;
  let photoIndex = 0;

  photos.forEach(entry => {
    if (entry.divider) {
      const div = document.createElement('div');
      div.className = 'photo-divider';
      div.innerHTML = `
        <div class="photo-divider-lines"><span></span><i>♡</i><span></span></div>
        <p class="photo-divider-label">${entry.label}</p>
      `;
      stack.appendChild(div);
      if (REDUCED) {
        gsap.set(div, { opacity: 1 });
      } else {
        gsap.fromTo(div, { opacity: 0 }, {
          opacity: 1, duration: 1.0, ease: 'power2.out',
          scrollTrigger: { trigger: div, start: 'top 88%', toggleActions: 'play none none none' }
        });
      }
      return;
    }

    const item = document.createElement('div');
    item.className = 'photo-item';

    const img = document.createElement('img');
    img.src     = entry.src;
    img.alt     = entry.caption || '';
    img.loading  = 'lazy';
    img.decoding = 'async';

    const cap = document.createElement('p');
    cap.className   = 'photo-caption';
    cap.textContent = entry.caption || '';

    item.appendChild(img);
    if (entry.caption) item.appendChild(cap);
    stack.appendChild(item);

    if (REDUCED) {
      gsap.set(item, { opacity: 1, y: 0 });
    } else {
      const tilt = photoIndex % 2 === 0 ? -2 : 2;
      gsap.fromTo(item,
        { opacity: 0, y: 30, rotate: tilt },
        {
          opacity: 1, y: 0, rotate: 0,
          duration: 1.0, ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    }
    photoIndex++;
  });
}

function buildSafeScene() {
  const quoteEl = document.querySelector('#scene-safe .safe-quote');
  const afterEl = document.querySelector('#scene-safe .safe-after');
  afterEl.textContent = content.safe.after;

  // Build word spans
  const words = content.safe.her.split(' ');
  quoteEl.innerHTML = '';
  ['“', ...words.map((w, i) => i < words.length - 1 ? w : w + '”')]
    .forEach(token => {
      const span = document.createElement('span');
      span.className = 'safe-word';
      span.textContent = token + (token === '“' ? '' : ' ');
      quoteEl.appendChild(span);
    });

  const wordSpans = quoteEl.querySelectorAll('.safe-word');
  gsap.set(wordSpans, { opacity: 0, y: 6 });
  gsap.set(afterEl, { opacity: 0, y: 8 });

  if (REDUCED) {
    gsap.set(wordSpans, { opacity: 1, y: 0 });
    gsap.set(afterEl,   { opacity: 1, y: 0 });
    return;
  }

  ScrollTrigger.create({
    trigger: '#scene-safe',
    start: 'top 60%',
    onEnter: () => {
      gsap.to(wordSpans, {
        opacity: 1, y: 0,
        duration: 0.65,
        ease: 'power2.out',
        stagger: 0.22,
      });
      gsap.to(afterEl, {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: wordSpans.length * 0.22 + 0.6,
      });
    },
  });
}

function buildLetterScene() {
  const bodyEl = document.querySelector('.letter-body');
  const skipEl = document.querySelector('.letter-skip');

  let tw;
  let done = false;

  const onDone = () => {
    done = true;
    skipEl.classList.add('hidden');
    // Animate each para visible (typewriter sets them manually)
    bodyEl.querySelectorAll('.letter-para').forEach(p => { p.style.opacity = '1'; p.style.transform = 'none'; });
  };

  // Start typewriter when letter scene scrolls into view
  ScrollTrigger.create({
    trigger: '#scene-letter',
    start: 'top 60%',
    onEnter: () => {
      if (!tw) tw = typewriter(bodyEl, content.letter, onDone);
    },
  });

  const doSkip = () => { if (!done) { tw?.skip(); } };
  document.querySelector('.letter-card').addEventListener('click', doSkip);
  skipEl.addEventListener('click', doSkip);
}

function buildFinaleHeart() {
  const heartWrap = document.getElementById('heart-wrap');
  if (REDUCED) {
    gsap.set(heartWrap, { opacity: 1 });
    return;
  }
  gsap.fromTo(heartWrap,
    { opacity: 0, scale: 0.8 },
    {
      opacity: 1, scale: 1, duration: 1.0, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '#scene-finale', start: 'top 70%', toggleActions: 'play none none none' }
    }
  );
}

export function buildStory() {
  buildChatScene(document.getElementById('scene-start'),   content.start,   false);
  buildChatScene(document.getElementById('scene-playful'), content.playful, false);
  buildPhotosScene();
  buildChatScene(document.getElementById('scene-hard'),    content.hardDay, true);
  buildSafeScene();
  buildLetterScene();
  buildFinaleHeart();
}
