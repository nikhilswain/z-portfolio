interface Ambient {
  r: number;
  theta: number;
  omega: number;
  size: number;
  accent: boolean;
  fx: number;
  fy: number;
}

interface Absorbed {
  r: number;
  theta: number;
  omega: number;
  size: number;
  accent: boolean;
  r0: number;
}

const BASE = 0.12;
const COUNT = 150;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let dpr = 1;
let W = 0;
let H = 0;
let ambient: Ambient[] = [];
let absorbed: Absorbed[] = [];
let raf = 0;
let running = false;
let k = 0;
let speed = 1;
let spread = 1;
let mode: "form" | "run" | "flyout" | "collapse" | "dot" = "run";
let phaseStart = 0;
let dotStart = 0;
let onCollapsed: (() => void) | null = null;
const colors = { muted: "", accent: "", strong: "" };

function remPx() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

function readColors() {
  const s = getComputedStyle(document.documentElement);
  colors.muted = s.getPropertyValue("--blog-fg-muted").trim() || "#888";
  colors.accent = s.getPropertyValue("--blog-accent").trim() || "#f0f";
  colors.strong = s.getPropertyValue("--blog-fg-strong").trim() || "#fff";
}

export function center() {
  return { x: window.innerWidth / 2, y: window.innerHeight - 4.5 * remPx() };
}

function resetAmbient(p: Ambient) {
  p.r = 14 + Math.random() ** 0.7 * 110;
  // Seed along two logarithmic spiral arms so the swarm reads as a galaxy, not a ball of noise.
  p.theta = (Math.random() < 0.5 ? 0 : Math.PI) + Math.log(p.r) * 1.6 + (Math.random() - 0.5) * 0.7;
  p.omega = BASE / Math.sqrt(p.r);
  p.size = 0.8 + Math.random();
  p.accent = Math.random() < 0.3;
  const a = Math.random() * Math.PI * 2;
  const rr = Math.random() * 220;
  p.fx = Math.cos(a) * rr;
  p.fy = Math.sin(a) * rr;
}

function size() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas!.width = Math.max(1, Math.round(W * dpr));
  canvas!.height = Math.max(1, Math.round(H * dpr));
}

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.className = "vortex";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "250";
  document.body.append(canvas);
  ctx = canvas.getContext("2d");
  size();
  readColors();
  for (let i = 0; i < COUNT; i++) {
    const p = {} as Ambient;
    resetAmbient(p);
    ambient.push(p);
  }
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.addEventListener("resize", () => {
    if (canvas) size();
  });
}

function start() {
  if (running) return;
  running = true;
  raf = requestAnimationFrame(frame);
}

function stop() {
  running = false;
  cancelAnimationFrame(raf);
  ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx!.clearRect(0, 0, W, H);
  mode = "run";
  absorbed = [];
}

function dot(x: number, y: number, size: number, color: string, alpha: number) {
  ctx!.globalAlpha = alpha;
  ctx!.strokeStyle = color;
  ctx!.lineWidth = size;
  ctx!.lineCap = "round";
  ctx!.beginPath();
  ctx!.moveTo(x, y);
  ctx!.lineTo(x, y);
  ctx!.stroke();
}

function trail(c: { x: number; y: number }, r: number, theta: number, omega: number, size: number, accent: boolean, alpha: number) {
  if (alpha <= 0) return;
  const dTheta = Math.min(0.45, omega * speed * 10);
  ctx!.globalAlpha = alpha;
  ctx!.strokeStyle = accent ? colors.accent : colors.muted;
  ctx!.lineWidth = size;
  ctx!.lineCap = "round";
  ctx!.beginPath();
  ctx!.arc(c.x, c.y, r, theta - dTheta, theta);
  ctx!.stroke();
}

function frame(now: number) {
  raf = requestAnimationFrame(frame);
  const c = center();
  ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx!.clearRect(0, 0, W, H);
  const globalAlpha = 0.35 + 0.65 * k;

  if (mode === "form") {
    const t = Math.min(1, (now - phaseStart) / 400);
    const e = t * t * (3 - 2 * t);
    for (const p of ambient) {
      p.theta += p.omega * speed;
      const r = p.r * spread;
      const ox = c.x + r * Math.cos(p.theta);
      const oy = c.y + r * Math.sin(p.theta);
      dot(c.x + p.fx + (ox - c.x - p.fx) * e, c.y + p.fy + (oy - c.y - p.fy) * e, p.size, p.accent ? colors.accent : colors.muted, globalAlpha * Math.max(0, 1 - p.r / 130));
    }
    if (t >= 1) mode = "run";
    return;
  }

  if (mode === "flyout") {
    const t = (now - phaseStart) / 250;
    const alpha = Math.max(0, 1 - t);
    for (const p of ambient) {
      p.r += 6;
      trail(c, p.r, p.theta, p.omega, p.size, p.accent, globalAlpha * alpha * Math.max(0, 1 - p.r / 130));
    }
    if (t >= 1) stop();
    return;
  }

  if (mode === "collapse") {
    const t = Math.min(1, (now - phaseStart) / 250);
    const s = 1 - t;
    for (const p of ambient) {
      const r = p.r * s;
      trail(c, r, p.theta, p.omega, p.size, p.accent, globalAlpha * s * Math.max(0, 1 - p.r / 130));
    }
    if (t >= 1) {
      mode = "dot";
      dotStart = now;
    }
    return;
  }

  if (mode === "dot") {
    const t = (now - dotStart) / 200;
    if (t >= 1) {
      stop();
      const done = onCollapsed;
      onCollapsed = null;
      done?.();
      return;
    }
    const s = t < 0.4 ? 1 + t / 0.4 : 2 * (1 - (t - 0.4) / 0.6);
    dot(c.x, c.y, 3 * s, colors.strong, 1 - t);
    return;
  }

  for (const p of ambient) {
    p.theta += p.omega * speed;
    p.r -= 0.15 * speed;
    if (p.r < 4) resetAmbient(p);
    trail(c, p.r * spread, p.theta, p.omega, p.size, p.accent, globalAlpha * Math.max(0, 1 - p.r / 130));
  }
  for (let i = absorbed.length - 1; i >= 0; i--) {
    const p = absorbed[i];
    p.theta += p.omega * speed;
    p.r -= 1.2 + p.r * 0.02;
    if (p.r <= 2) {
      absorbed.splice(i, 1);
      continue;
    }
    const fade = Math.max(0, Math.min(1, p.r / p.r0));
    trail(c, p.r, p.theta, p.omega, p.size, p.accent, globalAlpha * fade);
  }
  if (absorbed.length === 0 && onCollapsed) {
    mode = "collapse";
    phaseStart = now;
  }
}

export function open(): void {
  if (reduced) return;
  ensureCanvas();
  for (const p of ambient) resetAmbient(p);
  absorbed = [];
  k = 0;
  speed = 1;
  spread = 1;
  mode = "form";
  phaseStart = performance.now();
  onCollapsed = null;
  start();
}

export function setPointer(x: number, y: number): number {
  const c = center();
  const d = Math.hypot(x - c.x, y - c.y);
  const raw = Math.max(0, Math.min(1, (260 - d) / 200));
  k = raw * raw * (3 - 2 * raw);
  speed = 1 + 2.5 * k;
  spread = 1 - 0.35 * k;
  return k;
}

export function absorb(particles: { x: number; y: number }[], done: () => void): void {
  if (reduced || particles.length === 0) {
    done();
    return;
  }
  const c = center();
  for (const dp of particles) {
    const dx = dp.x - c.x;
    const dy = dp.y - c.y;
    const r = Math.hypot(dx, dy) || 1;
    absorbed.push({
      r,
      theta: Math.atan2(dy, dx),
      omega: (BASE / Math.sqrt(r)) * 2,
      size: 0.8 + Math.random(),
      accent: Math.random() < 0.3,
      r0: r,
    });
  }
  onCollapsed = done;
  mode = "run";
  start();
}

export function close(): void {
  if (reduced || !canvas) return;
  mode = "flyout";
  phaseStart = performance.now();
  onCollapsed = null;
  start();
}

export function dispose(): void {
  if (!canvas) return;
  stop();
  canvas.remove();
  canvas = null;
  ctx = null;
  ambient = [];
}
