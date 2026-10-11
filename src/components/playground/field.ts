interface Dot { x: number; y: number; vx: number; vy: number; restX: number; restY: number; phase: number; speed: number; star: boolean; }
interface Point { x: number; y: number; t: number; }
interface Doodle { w: number; h: number; paths: string[]; at: number; }

const STORAGE_KEY = "zerro-doodles";

let accent = "#f472b6";
let muted = "#a1a1ad";
let night = true;

export function init(field: HTMLElement): void {
  field.querySelector(".field__fallback")?.remove();

  const controls = field.parentElement!;
  const hint = controls.querySelector<HTMLElement>(".field__hint")!;
  const touch = controls.querySelector<HTMLElement>(".field__touch")!;
  const replayBtn = controls.querySelector<HTMLButtonElement>("[data-field-replay]")!;
  const clearBtn = controls.querySelector<HTMLButtonElement>("[data-field-clear]")!;
  const drawBtn = controls.querySelector<HTMLButtonElement>("[data-field-draw]")!;
  const pinEl = controls.querySelector<HTMLElement>(".field__pin")!;
  const wallEl = controls.querySelector<HTMLElement>(".field__wall")!;
  const pinBtn = controls.querySelector<HTMLButtonElement>("[data-field-pin]")!;
  const canvas = document.createElement("canvas");
  field.append(canvas);
  const ctx = canvas.getContext("2d")!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let dots: Dot[] = [];
  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerActive = false;
  let drawMode = false;
  let raf = 0;
  let visible = true;
  let replaying = false;
  let replayStart = 0;
  let replayScale = 1;
  let replayTotal = 0;
  let timeline: { points: Point[]; start: number }[] = [];
  const strokes: Point[][] = [];
  let current: Point[] | null = null;
  let strokeStart = 0;

  function readColors() {
    const styles = getComputedStyle(document.documentElement);
    accent = styles.getPropertyValue("--blog-accent").trim();
    muted = styles.getPropertyValue("--blog-fg-muted").trim();
    night = document.documentElement.dataset.theme === "dark";
  }

  function readDoodles(): Doodle[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveDoodles(doodles: Doodle[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doodles));
    } catch {
      // storage may be unavailable
    }
  }

  function updateDoodleUI() {
    pinEl.hidden = strokes.length === 0;
    wallEl.hidden = readDoodles().length === 0;
  }

  function layout() {
    width = field.clientWidth;
    height = field.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    for (let y = 13; y < height; y += 26) {
      for (let x = 13; x < width; x += 26) {
        const phase = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 0.8;
        const star = Math.random() < 0.06;
        dots.push({ x, y, vx: 0, vy: 0, restX: x, restY: y, phase, speed, star });
      }
    }
  }

  function locate(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    pointerX = point.x;
    pointerY = point.y;
    pointerActive = true;
    return point;
  }

  function drawStroke(points: Point[], limit: number) {
    const visible = points.filter((p) => p.t <= limit);
    if (visible.length < 2) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(visible[0].x, visible[0].y);
    for (let i = 1; i < visible.length - 1; i++) {
      const midX = (visible[i].x + visible[i + 1].x) / 2;
      const midY = (visible[i].y + visible[i + 1].y) / 2;
      ctx.quadraticCurveTo(visible[i].x, visible[i].y, midX, midY);
    }
    ctx.lineTo(visible[visible.length - 1].x, visible[visible.length - 1].y);
    ctx.stroke();
  }

  function frame(now: number) {
    const t = now / 1000;
    ctx.clearRect(0, 0, width, height);
    for (const dot of dots) {
      let ox = 0;
      let oy = 0;
      if (!reduced && !night) {
        ox += Math.sin(t * 0.3 * dot.speed + dot.phase) * 2;
        oy += Math.cos(t * 0.25 * dot.speed + dot.phase) * 2;
      }
      if (pointerActive) {
        const dx = dot.restX - pointerX;
        const dy = dot.restY - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < 140 && dist > 0) {
          const f = (1 - dist / 140) * 18;
          ox += (dx / dist) * f;
          oy += (dy / dist) * f;
        }
      }
      dot.vx += (dot.restX + ox - dot.x) * 0.08;
      dot.vy += (dot.restY + oy - dot.y) * 0.08;
      dot.vx *= 0.82;
      dot.vy *= 0.82;
      dot.x += dot.vx;
      dot.y += dot.vy;

      let alpha = 0.7;
      if (!reduced && night) {
        alpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * dot.speed + dot.phase));
        if (dot.star) alpha = Math.max(alpha, 0.6);
      }
      const d = pointerActive ? Math.hypot(pointerX - dot.x, pointerY - dot.y) : Infinity;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = d < 70 ? accent : muted;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.star && night ? 2.2 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (replaying) {
      const elapsed = (now - replayStart) / replayScale;
      for (const item of timeline) drawStroke(item.points, elapsed - item.start);
      if (elapsed >= replayTotal) replaying = false;
    } else {
      for (const stroke of strokes) drawStroke(stroke, Infinity);
      if (current) drawStroke(current, Infinity);
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function update() {
    if (visible && !document.hidden) start();
    else stop();
  }

  function startReplay() {
    if (replaying || strokes.length === 0) return;
    timeline = [];
    let cursor = 0;
    for (const stroke of strokes) {
      const first = stroke[0].t;
      const last = stroke[stroke.length - 1].t;
      timeline.push({ points: stroke, start: cursor });
      cursor += last - first + 120;
    }
    replayTotal = cursor;
    replayScale = Math.min(1, 3000 / Math.max(replayTotal, 1));
    replayStart = performance.now();
    replaying = true;
    update();
  }

  canvas.addEventListener("pointerdown", (event) => {
    const p = locate(event);
    if (event.pointerType === "touch" && !drawMode) return;
    canvas.setPointerCapture(event.pointerId);
    strokeStart = performance.now();
    current = [{ x: p.x, y: p.y, t: 0 }];
  });
  canvas.addEventListener("pointermove", (event) => {
    const p = locate(event);
    if (!current) return;
    const last = current[current.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 1.5) return;
    current.push({ x: p.x, y: p.y, t: performance.now() - strokeStart });
  });
  canvas.addEventListener("pointerup", () => {
    if (current) {
      strokes.push(current);
      current = null;
      updateDoodleUI();
    }
  });
  canvas.addEventListener("pointercancel", () => {
    current = null;
  });
  canvas.addEventListener("pointerleave", () => {
    pointerActive = false;
  });
  replayBtn.addEventListener("click", startReplay);
  clearBtn.addEventListener("click", () => {
    strokes.length = 0;
    replaying = false;
    updateDoodleUI();
  });
  pinBtn.addEventListener("click", () => {
    if (strokes.length === 0) return;
    const points = strokes.flat();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    const longest = Math.max(maxX - minX, maxY - minY);
    if (longest === 0) return;
    const scale = 100 / longest;
    const w = Math.round((maxX - minX) * scale * 10) / 10;
    const h = Math.round((maxY - minY) * scale * 10) / 10;
    const paths = strokes.map((stroke) => {
      let d = "";
      let px = 0;
      let py = 0;
      let has = false;
      for (const p of stroke) {
        const x = Math.round((p.x - minX) * scale * 10) / 10;
        const y = Math.round((p.y - minY) * scale * 10) / 10;
        if (has && Math.hypot(x - px, y - py) < 1.5) continue;
        d += `${has ? "L" : "M"}${x} ${y} `;
        px = x;
        py = y;
        has = true;
      }
      return d.trim();
    });
    const doodles = readDoodles();
    doodles.push({ w, h, paths, at: Date.now() });
    saveDoodles(doodles.slice(-12));
    strokes.length = 0;
    replaying = false;
    pinBtn.textContent = "pinned ✓";
    setTimeout(() => {
      pinBtn.textContent = "pin";
    }, 1500);
    updateDoodleUI();
  });
  drawBtn.addEventListener("click", () => {
    drawMode = !drawMode;
    drawBtn.textContent = drawMode ? "draw: on" : "draw: off";
    drawBtn.setAttribute("aria-pressed", String(drawMode));
    canvas.style.touchAction = drawMode ? "none" : "pan-y";
  });
  if (window.matchMedia("(pointer: coarse)").matches) {
    touch.hidden = false;
    hint.textContent = "touch to disturb";
  }
  readColors();
  new MutationObserver(readColors).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  layout();
  new ResizeObserver(layout).observe(field);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }).observe(field);
  document.addEventListener("visibilitychange", update);
  updateDoodleUI();
  update();
}
