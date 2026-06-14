const canvas = document.getElementById('constellations');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const COUNT = 500;
const MAX_DIST = 150;

const dots = Array.from({length: COUNT}, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 0.4,
  vy: (Math.random() - 0.5) * 0.4,
  r: 1.8 + Math.random() * 1.2,
}));

let mouse = { x: -9999, y: -9999 };
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const d of dots) {
    d.x += d.vx; d.y += d.vy;
    if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
    if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
  }

  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < MAX_DIST) {
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = `rgba(160,120,255,${(1 - dist/MAX_DIST) * 0.45})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
    const mdx = dots[i].x - mouse.x, mdy = dots[i].y - mouse.y;
    const mdist = Math.sqrt(mdx*mdx + mdy*mdy);
    if (mdist < 150) {
      ctx.beginPath();
      ctx.moveTo(dots[i].x, dots[i].y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = `rgba(200,160,255,${(1 - mdist/150) * 0.7})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  for (const d of dots) {
    const mdx = d.x - mouse.x, mdy = d.y - mouse.y;
    const near = Math.sqrt(mdx*mdx + mdy*mdy) < 100;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = near ? 'rgba(220,200,255,0.9)' : 'rgba(200,180,255,0.4)';
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


