const CHAR_DELAY = 35;
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function typewriter(el, lines, onDone) {
  let cancelled = false;
  let resolveSkip;
  const skipPromise = new Promise(r => { resolveSkip = r; });

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.setAttribute('aria-hidden', 'true');

  async function run() {
    for (const line of lines) {
      if (cancelled) break;
      const para = document.createElement('p');
      para.className = 'letter-para';
      para.style.opacity = '1';
      para.style.transform = 'none';

      const textNode = document.createTextNode('');
      para.appendChild(textNode);
      if (!REDUCED) para.appendChild(cursor);
      el.appendChild(para);

      for (const ch of line) {
        if (cancelled) { textNode.textContent = line; break; }
        await Promise.race([
          new Promise(r => setTimeout(r, CHAR_DELAY)),
          skipPromise,
        ]);
        if (!cancelled) textNode.textContent += ch;
      }
      if (!cancelled) {
        await Promise.race([
          new Promise(r => setTimeout(r, 180)),
          skipPromise,
        ]);
      }
    }
    cursor.remove();
    onDone?.();
  }

  run();

  return {
    skip() {
      cancelled = true;
      resolveSkip();
      cursor.remove();
      el.innerHTML = '';
      lines.forEach(line => {
        const p = document.createElement('p');
        p.className = 'letter-para';
        p.style.opacity = '1';
        p.textContent = line;
        el.appendChild(p);
      });
      onDone?.();
    }
  };
}
