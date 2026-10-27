const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initParticles() {
  if (REDUCED) return;
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const HEART_COUNT    = 14;
  const SPARKLE_COUNT  = 22;

  const hearts   = [];
  const sparkles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < HEART_COUNT; i++) {
    hearts.push({
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * window.innerHeight,
      size:    5 + Math.random() * 7,
      speed:   0.18 + Math.random() * 0.35,
      drift:   (Math.random() - 0.5) * 0.28,
      opacity: 0.04 + Math.random() * 0.1,
    });
  }

  for (let i = 0; i < SPARKLE_COUNT; i++) {
    sparkles.push({
      x:        Math.random() * window.innerWidth,
      y:        Math.random() * window.innerHeight,
      size:     1 + Math.random() * 2.2,
      speed:    0.12 + Math.random() * 0.28,
      drift:    (Math.random() - 0.5) * 0.2,
      opacity:  0.06 + Math.random() * 0.18,
      twinkle:  Math.random() * Math.PI * 2,
      twinkleSpeed: 0.015 + Math.random() * 0.03,
    });
  }

  function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.3);
    ctx.bezierCurveTo( size * 0.6, -size,  size,  size * 0.2,  0,  size * 0.8);
    ctx.bezierCurveTo(-size,  size * 0.2, -size * 0.6, -size,  0, -size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSparkle(ctx, x, y, size, twinkle) {
    const glow = 0.5 + 0.5 * Math.sin(twinkle);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(twinkle * 0.5);
    ctx.beginPath();
    for (let arm = 0; arm < 4; arm++) {
      const angle = (arm / 4) * Math.PI * 2;
      const ox = Math.cos(angle) * size * (1 + glow * 0.4);
      const oy = Math.sin(angle) * size * (1 + glow * 0.4);
      const ix = Math.cos(angle + Math.PI / 4) * size * 0.3;
      const iy = Math.sin(angle + Math.PI / 4) * size * 0.3;
      if (arm === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const h of hearts) {
      h.y -= h.speed;
      h.x += h.drift;
      if (h.y < -20) { h.y = canvas.height + 20; h.x = Math.random() * canvas.width; }
      ctx.fillStyle = `rgba(255,107,138,${h.opacity})`;
      drawHeart(ctx, h.x, h.y, h.size);
    }

    for (const s of sparkles) {
      s.y -= s.speed;
      s.x += s.drift;
      s.twinkle += s.twinkleSpeed;
      if (s.y < -20) { s.y = canvas.height + 20; s.x = Math.random() * canvas.width; }
      const pulse = 0.5 + 0.5 * Math.sin(s.twinkle);
      const alpha = s.opacity * (0.6 + 0.4 * pulse);
      // Alternate between rose and gold sparkles
      const color = s.size > 1.8 ? `rgba(255,184,107,${alpha})` : `rgba(255,107,138,${alpha})`;
      ctx.fillStyle = color;
      drawSparkle(ctx, s.x, s.y, s.size, s.twinkle);
    }

    requestAnimationFrame(tick);
  }
  tick();
}
