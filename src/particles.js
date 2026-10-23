const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initParticles() {
  if (REDUCED) return;
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const hearts = [];
  const COUNT = 18;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < COUNT; i++) {
    hearts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 6 + Math.random() * 8,
      speed: 0.2 + Math.random() * 0.4,
      drift: (Math.random() - 0.5) * 0.3,
      opacity: 0.05 + Math.random() * 0.12,
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

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const h of hearts) {
      h.y -= h.speed;
      h.x += h.drift;
      if (h.y < -20) { h.y = canvas.height + 20; h.x = Math.random() * canvas.width; }
      ctx.fillStyle = `rgba(255,107,138,${h.opacity})`;
      drawHeart(ctx, h.x, h.y, h.size);
    }
    requestAnimationFrame(tick);
  }
  tick();
}
