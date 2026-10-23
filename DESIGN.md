# DESIGN.md: "For Faith" (a love surprise, built in code)

> Hand this file to Claude Code as the source of truth. Build exactly what it describes, mobile-first.

## 1. Goal
A private, romantic, scroll-driven web experience for **Faith**, sent as a single link. She opens it on her phone, taps once to begin (music starts), scrolls through the story of how it began, sees her photos, reads a letter from John, and ends on an interactive heart that reveals one final question.

Tone: warm, sincere, a little playful. Not cheesy, not corporate. Feels hand-made.

## 2. Story arc (screens)
| # | Screen | What happens |
|---|--------|--------------|
| 0 | **Gate** | Dark screen, soft glow. Text: "Faith, I made something for you." Button: **Open**. Tap starts music (browsers block autoplay, so the tap is required). Optional passcode (see 8). |
| 1 | **A group chat** | Typed-out text: a WhatsApp group, a number, a first "hi". Small chat-bubble animation, bubbles pop in one by one. |
| 2 | **Then it became us** | Her photos fade/slide in one at a time as she scrolls, each with a short caption in John's voice. |
| 3 | **You said it first** | A quiet, full-screen moment acknowledging when she said she loves him. Slow fade, one line of text, nothing else. |
| 4 | **The letter** | Letter card, text types out line by line (user can tap to skip to the full text). |
| 5 | **Finale** | A big pulsing heart. Tap it: hearts burst, then the final question fades in with two buttons. |

## 3. Tech stack
- **Vite + vanilla JS** (no framework needed), plain CSS with custom properties.
- **GSAP + ScrollTrigger** for scroll animation (install via npm, don't use a CDN).
- **canvas-confetti** (or a small custom canvas) for the heart burst.
- Deploy: **Vercel** (or Netlify). Unlisted link, `noindex` meta tag.
- No backend, no analytics, no trackers. It's private.

```
faith-surprise/
├── CLAUDE.md
├── DESIGN.md
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.svg            (small heart)
│   ├── audio/song.mp3         (John supplies his own file)
│   └── photos/                (01.jpg ... 10.jpg, John supplies)
└── src/
    ├── main.js                (boot, gate, music control)
    ├── story.js               (scroll scenes with GSAP)
    ├── typewriter.js          (typing effect, skippable)
    ├── finale.js              (heart interaction and burst)
    ├── content.js             (ALL text lives here, easy to edit)
    └── styles.css
```

## 4. Content (edit in `src/content.js`)
All words live in one file so John can change them without touching logic.

```js
export const content = {
  name: "Faith",
  gate: { line: "Faith, I made something for you.", button: "Open" },
  chat: {
    title: "It started in a group chat",
    bubbles: [
      { from: "me",  text: "Hi Faith 👋" },
      { from: "her", text: "[her first reply, John fills in]" },
      { from: "me",  text: "[a line that shows how it began]" }
    ]
  },
  photos: [
    // { src: "/photos/01.jpg", caption: "[John writes a short caption]" },
  ],
  loveMoment: "[One line about the day she told you she loves you.]",
  letter: [
    "Faith,",
    "[Paragraph 1: how you met and what you noticed first]",
    "[Paragraph 2: what she means to you now]",
    "[Paragraph 3: what you hope for]",
    "[Sign-off], John"
  ],
  finale: {
    prompt: "Tap the heart",
    question: "[Final question, e.g. 'Will you be mine?']",
    yes: "Yes 💛",
    notYet: "Let me think"   // this button should playfully dodge the cursor/finger
  },
  songNote: "Our song"
};
```

**Do not paste copyrighted song lyrics into the page.** The song is only the audio file plus an optional "Our song" label.

## 5. Visual design
**Mood:** candlelit, soft, intimate. Dark warm background with glowing accents.

**Palette (CSS variables, swap the accent if Faith has a favourite colour):**
```css
:root {
  --bg: #120d14;          /* deep plum-black */
  --bg-soft: #1c1420;
  --text: #f6ece6;        /* warm off-white */
  --muted: #b9a7a9;
  --accent: #ff6b8a;      /* rose */
  --accent-2: #ffb86b;    /* warm gold */
  --glow: rgba(255,107,138,.35);
}
```

**Type:**
- Headings and letter: a romantic serif, e.g. **Cormorant Garamond** or **Playfair Display** (self-host via `@fontsource`).
- UI and captions: **Inter** (self-hosted).
- Letter body: 20 to 22px mobile, line-height 1.7.

**Layout rules:**
- Mobile-first, design at 390px wide, scale up gracefully.
- Each scene is `min-height: 100svh`, content centered, generous whitespace.
- Photos: rounded corners (20px), soft shadow, subtle rose glow, max-width 88vw, never stretched (`object-fit: cover`).
- Background: slow-drifting floating particles/hearts on a fixed canvas layer, very low opacity (must not distract from text).
- Respect `env(safe-area-inset-*)` for phone notches.

## 6. Motion and interaction
- Scroll-linked fades and slight upward drifts (GSAP ScrollTrigger), 0.8 to 1.2s, ease `power2.out`.
- Chat bubbles stagger in 600ms apart.
- Photos alternate slight tilt (-2deg / +2deg) and straighten as they enter.
- Typewriter: ~35ms per character, a **tap anywhere finishes the line instantly**.
- Finale heart: gentle heartbeat pulse (scale 1 to 1.08, 1.2s loop). On tap: haptic (`navigator.vibrate(40)` if supported), heart-shaped confetti burst, heart morphs into the final question.
- "Let me think" button moves away on `pointerenter`/touch, with a cap of 5 dodges, then it turns into "Okay, yes 💛" (playful, never mean).
- **`prefers-reduced-motion`:** disable parallax, particles and shakes; keep simple fades.

## 7. Music
- `<audio id="song" loop preload="auto" src="/audio/song.mp3">`.
- Start only inside the Open button's click handler (autoplay policy).
- Fade in volume 0 to 0.7 over 3s.
- Small floating mute/unmute button (bottom-right, 44x44px minimum).
- Pause the audio when the tab is hidden (`visibilitychange`).
- If the file is missing, fail silently (no console spam, no broken UI).

## 8. Privacy and delivery
- `<meta name="robots" content="noindex,nofollow">`.
- Hard-to-guess link (deploy to a random project name, e.g. `for-faith-xxxxx.vercel.app`).
- Optional gate passcode: a simple hint-based input (e.g. "the month we met"). Compare a lowercase hash client-side. This is a courtesy lock, not real security.
- Compress photos before commit (target < 400KB each, max 1600px long edge, `.webp` preferred with `.jpg` fallback).
- Lazy-load every photo below the first screen.

## 9. Performance and quality bar
- Lighthouse mobile: Performance 90+, Accessibility 95+.
- Total payload excluding audio < 3MB.
- Tested on: Android Chrome, iOS Safari (check `100svh`, audio unlock, safe areas).
- Text contrast AA minimum; all buttons keyboard-focusable with a visible focus ring.
- No horizontal scroll at any width from 320px up.

## 10. Build order for Claude Code
1. Scaffold Vite project, install `gsap`, `canvas-confetti`, `@fontsource/cormorant-garamond`, `@fontsource/inter`.
2. `styles.css` with the variables, base type and scene layout.
3. Gate screen and music start/mute control.
4. Chat scene, then photo scene (use 3 placeholder images until real ones arrive).
5. Love-moment and letter scenes with the typewriter.
6. Finale heart, confetti, final question.
7. Particles layer, reduced-motion handling, polish.
8. Optimize images, run Lighthouse, deploy.

## 11. Acceptance checklist
- [ ] Tap on Open starts music and begins the story on a phone.
- [ ] Every text comes from `content.js` (no hardcoded copy in JS).
- [ ] Photos load in order with captions and never distort.
- [ ] Letter can be skipped to full text by tapping.
- [ ] Finale reveals the question; both buttons work; "Let me think" dodges max 5 times.
- [ ] Works with sound off, reduced motion on, and on slow 4G.
- [ ] Link is unlisted, with `noindex`.

## 12. REVISION (overrides sections 2 and 4 where they conflict)
- **No long chat thread.** Chat scenes use at most 3 bubbles each, from `content.js`. Never render a full conversation.
- **Scene order:** Gate > Start (1 Sept, 3 bubbles) > Playful (2 bubbles) > Photos > Hard day (19 Oct, 3 bubbles) > "I am safe around you" (one quiet screen) > Letter > Finale.
- **The hard day scene is intentional.** Use a slower, softer tone: dimmer background, no confetti, no particles, bubbles appear one at a time with a longer pause (900ms), then the "after" line fades in. It must feel honest, not heavy.
- Chapter 1 is NOT a WhatsApp group. It begins with a direct message on 1 September.
- Keep the total story under ~3 minutes of scrolling.
- **Finale text:** render `finale.question` large first, then fade in `finale.questionSub` underneath (about 1.5s later), then show the Yes / Let me think buttons.
