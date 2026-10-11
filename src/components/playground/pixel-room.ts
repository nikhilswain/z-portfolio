const W = 128;
const H = 96;
const TILE = 8;

const FRAMES: string[][] = [
  [
    "..aaaa..",
    ".aaaaaa.",
    ".bbbaaa.",
    ".bbbbbb.",
    ".bb..bb.",
    ".bb..bb.",
    "..m..m..",
    "..m..m..",
  ],
  [
    "..aaaa..",
    ".aaaaaa.",
    ".bbbaaa.",
    ".bbbbbb.",
    ".bb..bb.",
    ".bb..bb.",
    ".m..m...",
    ".m...m..",
  ],
];

let accent = "#f472b6";
let fg = "#e2e2e8";
let muted = "#a1a1ad";
let border = "#26262f";
let surface = "#13131a";
let bg = "#0a0a0f";

export function init(stage: HTMLElement): void {
  stage.querySelector(".tile__fallback")?.remove();

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.imageRendering = "pixelated";
  canvas.tabIndex = 0;
  canvas.setAttribute("aria-label", "Pixel room: use the arrow keys to walk");
  stage.append(canvas);

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  let px = 64;
  let py = 56;
  let facing = 1;
  let animT = 0;
  let focused = false;
  let target: { x: number; y: number } | null = null;

  const keys = new Set<string>();
  const speed = 40;

  function readColors() {
    const styles = getComputedStyle(document.documentElement);
    accent = styles.getPropertyValue("--blog-accent").trim();
    fg = styles.getPropertyValue("--blog-fg").trim();
    muted = styles.getPropertyValue("--blog-fg-muted").trim();
    border = styles.getPropertyValue("--blog-border").trim();
    surface = styles.getPropertyValue("--blog-surface").trim();
    bg = styles.getPropertyValue("--blog-bg").trim();
  }

  function solid(x: number, y: number): boolean {
    if (x < TILE || y < TILE || x > W - TILE * 2 || y > H - TILE * 2) return true;
    if (x < 104 && x + TILE > 96 && y < 32 && y + TILE > 24) return true;
    return false;
  }

  function move(dx: number, dy: number) {
    if (!solid(px + dx, py)) px += dx;
    if (!solid(px, py + dy)) py += dy;
  }

  function drawSprite(x: number, y: number, frame: number, dir: number) {
    const rows = FRAMES[frame % FRAMES.length];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const key = rows[r][c] as "a" | "b" | "m" | ".";
        if (key === ".") continue;
        ctx.fillStyle = key === "a" ? accent : key === "b" ? fg : muted;
        ctx.fillRect(Math.round(x) + (dir === -1 ? 7 - c : c), Math.round(y) + r, 1, 1);
      }
    }
  }

  function draw(walking: boolean) {
    for (let ty = 0; ty < H / TILE; ty++) {
      for (let tx = 0; tx < W / TILE; tx++) {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? surface : bg;
        ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
      }
    }

    ctx.fillStyle = border;
    for (let i = 0; i < W; i += TILE) {
      ctx.fillRect(i, 0, TILE, TILE);
      ctx.fillRect(i, H - TILE, TILE, TILE);
    }
    for (let i = TILE; i < H - TILE; i += TILE) {
      ctx.fillRect(0, i, TILE, TILE);
      ctx.fillRect(W - TILE, i, TILE, TILE);
    }

    ctx.fillStyle = accent;
    ctx.fillRect(96, 24, TILE, TILE);
    ctx.fillStyle = bg;
    ctx.fillRect(99, 26, 2, 1);
    ctx.fillRect(99, 28, 2, 3);

    drawSprite(px, py, walking ? Math.floor(animT / 0.15) : 0, facing);

    const nearSign =
      Math.abs(Math.floor(px / TILE) - 12) + Math.abs(Math.floor(py / TILE) - 3) === 1;
    if (nearSign) {
      const text = "This, but bigger: DMap";
      ctx.font = "8px 'Departure Mono', monospace";
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = bg;
      ctx.fillRect(3, 3, tw + 12, 14);
      ctx.strokeStyle = border;
      ctx.strokeRect(3.5, 3.5, tw + 11, 13);
      ctx.fillStyle = fg;
      ctx.textBaseline = "top";
      ctx.fillText(text, 9, 7);
    }

    if (!focused) {
      ctx.font = "8px 'Departure Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = muted;
      ctx.fillText("click to play", W / 2, H / 2 - 4);
      ctx.textAlign = "left";
    }
  }

  let prev = performance.now();
  let raf = 0;
  let visible = true;

  function frame(now: number) {
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;

    let walking = false;

    if (target) {
      const dx = target.x - px;
      const dy = target.y - py;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) {
        target = null;
      } else {
        const step = speed * dt;
        move((dx / dist) * step, (dy / dist) * step);
        if (dx !== 0) facing = dx < 0 ? -1 : 1;
        walking = true;
      }
    } else {
      const kx =
        (keys.has("arrowright") || keys.has("d") ? 1 : 0) -
        (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
      const ky =
        (keys.has("arrowdown") || keys.has("s") ? 1 : 0) -
        (keys.has("arrowup") || keys.has("w") ? 1 : 0);
      if (kx !== 0 || ky !== 0) {
        const mag = Math.hypot(kx, ky);
        move((kx / mag) * speed * dt, (ky / mag) * speed * dt);
        if (kx !== 0) facing = kx < 0 ? -1 : 1;
        walking = true;
      }
    }

    if (walking) animT += dt;

    ctx.clearRect(0, 0, W, H);
    draw(walking);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    prev = performance.now();
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

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }).observe(stage);

  document.addEventListener("visibilitychange", update);

  canvas.addEventListener("pointerdown", (event) => {
    focused = true;
    canvas.focus();
    const rect = canvas.getBoundingClientRect();
    const lx = ((event.clientX - rect.left) * W) / rect.width - TILE / 2;
    const ly = ((event.clientY - rect.top) * H) / rect.height - TILE / 2;
    target = {
      x: Math.max(TILE, Math.min(W - TILE * 2, lx)),
      y: Math.max(TILE, Math.min(H - TILE * 2, ly)),
    };
  });

  canvas.addEventListener("focus", () => {
    focused = true;
  });

  canvas.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const move =
      key === "arrowup" ||
      key === "arrowdown" ||
      key === "arrowleft" ||
      key === "arrowright" ||
      key === "w" ||
      key === "a" ||
      key === "s" ||
      key === "d";
    if (!move) return;
    event.preventDefault();
    keys.add(key);
  });

  canvas.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  update();
}
