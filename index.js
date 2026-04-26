// cursor ring
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  ring.style.opacity = '1';
});
document.addEventListener('mouseleave', () => ring.style.opacity = '0');

function lerp(a, b, t) { return a + (b - a) * t; }

(function loop() {
  cx = lerp(cx, mx, 0.12);
  cy = lerp(cy, my, 0.12);
  ring.style.left = cx + 'px';
  ring.style.top = cy + 'px';
  requestAnimationFrame(loop);
})();

// hex grid
const canvas = document.getElementById('hex-canvas');
const ctx = canvas.getContext('2d');

let mouse = { x: -9999, y: -9999 };
let hexes = [];
const HEX_SIZE = 47;
const GAP = 0.5;

function buildGrid() {
  hexes = [];
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  const hw = Math.sqrt(3) * HEX_SIZE + GAP;
  const hh = HEX_SIZE * 1.5 + GAP;
  const cols = Math.ceil(w / hw) + 2;
  const rows = Math.ceil(h / hh) + 2;
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const offset = (row % 2 === 0) ? 0 : hw / 2;
      hexes.push({
        cx: col * hw + offset,
        cy: row * hh,
        baseAlpha: 0.025 + Math.random() * 0.12
      });
    }
  }
}

function hexPath(cx, cy, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 3 * i - Math.PI / 6;
    const x = cx + size * Math.cos(a);
    const y = cy + size * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

let time = 0;
function draw(ts) {
  time = ts * 0.001;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const maxDist = 160;
  const innerSize = HEX_SIZE * 0.9 - GAP / 2;

  for (const h of hexes) {
    const dx = h.cx - mouse.x;
    const dy = h.cy - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const glow = Math.max(0, 1 - dist / maxDist) ** 2;
    const pulse = 0.005 * Math.sin(time * 0.3 + h.cx * 0.01 + h.cy * 0.01);
    const alpha = h.baseAlpha + pulse + glow * 0.25;

    hexPath(h.cx, h.cy, innerSize);
    ctx.strokeStyle = `rgba(191,93,159,${alpha.toFixed(4)})`;
    ctx.lineWidth = 0.5 + glow * 1.2;
    ctx.stroke();
  }

  if (mouse.x > 0) {
    const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 140);
    grd.addColorStop(0, 'rgba(191,93,159,0.01)');
    grd.addColorStop(1, 'rgba(191,93,159,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 140, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
window.addEventListener('touchmove', e => {
  e.preventDefault();
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
}, { passive: false });
window.addEventListener('resize', buildGrid);

buildGrid();
requestAnimationFrame(draw);


// typewrite effect
const titleEl = document.getElementById('title');
const text = 'ZeroG5';
let i = 0;
let typing = true;

function type() {
  if (typing) {
    if (i < text.length) {
      titleEl.textContent = text.slice(0, i + 1);
      i++;
      setTimeout(type, 120);
    } else {
      setTimeout(() => { typing = false; type(); }, 1500);
    }
  } else {
    if (i > 0) {
      titleEl.textContent = text.slice(0, i - 1);
      i--;
      setTimeout(type, 60);
    } else {
      typing = true;
      setTimeout(type, 400);
    }
  }
}

type();
