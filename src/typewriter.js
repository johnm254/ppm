const CHAR_DELAY = 35;

export function typewriter(el, lines, onDone) {
  let cancelled = false;
  let resolveSkip;
  const skipPromise = new Promise(r => { resolveSkip = r; });

  async function run() {
    for (const line of lines) {
      if (cancelled) break;
      const para = document.createElement('p');
      para.className = 'letter-para';
      para.style.opacity = '1';
      para.style.transform = 'none';
      el.appendChild(para);

      for (const ch of line) {
        if (cancelled) { para.textContent = line; break; }
        await Promise.race([
          new Promise(r => setTimeout(r, CHAR_DELAY)),
          skipPromise,
        ]);
        if (!cancelled) para.textContent += ch;
      }
    }
    onDone?.();
  }

  run();

  return {
    skip() {
      cancelled = true;
      resolveSkip();
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
