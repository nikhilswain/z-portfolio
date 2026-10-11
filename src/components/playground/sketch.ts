interface Point {
  x: number;
  y: number;
  t: number;
}

interface Stroke {
  points: Point[];
}

let accent = "#f472b6";
let muted = "#a1a1ad";

export function init(stage: HTMLElement): void {
  stage.querySelector(".tile__fallback")?.remove();

  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.touchAction = "none";
  stage.append(canvas);

  const ctx = canvas.getContext("2d")!;

  let width = 0;
  let height = 0;
  const strokes: Stroke[] = [];
  let current: Point[] | null = null;
  let strokeStart = 0;

  function readColors() {
    const styles = getComputedStyle(document.documentElement);
    accent = styles.getPropertyValue("--blog-accent").trim();
    muted = styles.getPropertyValue("--blog-fg-muted").trim();
  }

  function layout() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function drawStroke(points: Point[], limit: number) {
    const visible = points.filter((p) => p.t <= limit);
    if (visible.length === 0) return;
    ctx.lineWidth = 3;
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

  function redraw() {
    ctx.clearRect(0, 0, width, height);
    for (const stroke of strokes) drawStroke(stroke.points, Infinity);
    if (current) drawStroke(current, Infinity);
    if (strokes.length === 0 && !current) {
      ctx.fillStyle = muted;
      ctx.font = "14px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("draw here", width / 2, height / 2);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
  }

  function toLocal(event: PointerEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    current = [];
    strokeStart = performance.now();
    const p = toLocal(event);
    current.push({ x: p.x, y: p.y, t: 0 });
    redraw();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!current) return;
    const p = toLocal(event);
    const last = current[current.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 1.5) return;
    current.push({ x: p.x, y: p.y, t: performance.now() - strokeStart });
    redraw();
  });

  canvas.addEventListener("pointerup", () => {
    if (!current) return;
    strokes.push({ points: current });
    current = null;
  });

  canvas.addEventListener("pointercancel", () => {
    current = null;
  });

  function button(label: string): HTMLButtonElement {
    const element = document.createElement("button");
    element.type = "button";
    element.textContent = label;
    element.style.padding = "4px 10px";
    element.style.border = "1px solid var(--blog-border)";
    element.style.borderRadius = "var(--blog-radius-sm)";
    element.style.background = "var(--blog-bg)";
    element.style.color = "var(--blog-fg)";
    element.style.fontFamily = "var(--blog-font-mono)";
    element.style.fontSize = "var(--blog-text-meta)";
    element.style.cursor = "pointer";
    return element;
  }

  const controls = document.createElement("div");
  controls.style.position = "absolute";
  controls.style.right = "8px";
  controls.style.bottom = "8px";
  controls.style.display = "flex";
  controls.style.gap = "6px";
  stage.append(controls);

  const replay = button("Replay");
  const clear = button("Clear");
  controls.append(replay, clear);

  let replaying = false;
  let replayStart = 0;
  let replayScale = 1;
  let replayTotal = 0;
  let timeline: { points: Point[]; start: number }[] = [];
  let raf = 0;
  let visible = true;

  function startReplay() {
    if (replaying || strokes.length === 0) return;
    timeline = [];
    let cursor = 0;
    for (const stroke of strokes) {
      const first = stroke.points[0].t;
      const last = stroke.points[stroke.points.length - 1].t;
      timeline.push({ points: stroke.points, start: cursor });
      cursor += last - first + 120;
    }
    replayTotal = cursor;
    replayScale = Math.min(1, 3000 / Math.max(replayTotal, 1));
    replayStart = performance.now();
    replaying = true;
    resume();
  }

  function loop(now: number) {
    raf = 0;
    if (!replaying) return;
    const t = (now - replayStart) / replayScale;
    ctx.clearRect(0, 0, width, height);
    for (const item of timeline) drawStroke(item.points, t - item.start);
    if (t >= replayTotal) {
      replaying = false;
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function resume() {
    if (raf || !visible || document.hidden) return;
    raf = requestAnimationFrame(loop);
  }

  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  replay.addEventListener("click", startReplay);

  clear.addEventListener("click", () => {
    strokes.length = 0;
    redraw();
  });

  readColors();
  new MutationObserver(() => {
    readColors();
    redraw();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  layout();
  new ResizeObserver(layout).observe(stage);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (replaying) visible ? resume() : pause();
  }).observe(stage);

  document.addEventListener("visibilitychange", () => {
    if (replaying) document.hidden ? pause() : resume();
  });
}
