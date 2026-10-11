interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  restX: number;
  restY: number;
  phase: number;
}

let accent = "#f472b6";
let muted = "#a1a1ad";

export function init(stage: HTMLElement): void {
  stage.querySelector(".tile__fallback")?.remove();

  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  stage.append(canvas);

  const ctx = canvas.getContext("2d")!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let dots: Dot[] = [];
  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerActive = false;
  let lastMove = -Infinity;

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
    dots = [];
    let i = 0;
    for (let y = 12; y < height - 6; y += 24) {
      for (let x = 12; x < width - 6; x += 24) {
        dots.push({ x, y, vx: 0, vy: 0, restX: x, restY: y, phase: i++ * 0.7 });
      }
    }
  }

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
    pointerActive = true;
    lastMove = performance.now();
  });

  stage.addEventListener("pointerleave", () => {
    pointerActive = false;
  });

  let raf = 0;
  let visible = true;

  function frame(now: number) {
    const idle = !reduced && now - lastMove > 2000;

    ctx.clearRect(0, 0, width, height);

    for (const dot of dots) {
      let ox = 0;
      let oy = 0;
      if (idle) {
        ox = Math.sin((now / 1000) * 2 + dot.phase) * 3;
        oy = Math.cos((now / 1000) * 1.7 + dot.phase) * 3;
      }

      if (pointerActive) {
        const dx = pointerX - dot.restX;
        const dy = pointerY - dot.restY;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0) {
          const f = (1 - dist / 120) * 16;
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

      const dist = pointerActive ? Math.hypot(pointerX - dot.x, pointerY - dot.y) : Infinity;
      ctx.fillStyle = dist < 60 ? accent : muted;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function update() {
    if (visible && !document.hidden) start();
    else stop();
  }

  readColors();
  new MutationObserver(readColors).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  layout();
  new ResizeObserver(layout).observe(stage);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }).observe(stage);

  document.addEventListener("visibilitychange", update);
  update();
}
