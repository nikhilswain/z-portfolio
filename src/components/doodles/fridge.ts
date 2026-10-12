interface Doodle { w: number; h: number; paths: string[]; at: number; }
interface Position { x: number; y: number; r: number; s: number; }
interface FloorCube { x: number; y: number; restX: number; restY: number; z: number; a: number; dir: number; vy: number; }
interface SnapCube { x: number; y: number; vx: number; vy: number; size: number; a: number; spin: number; delay: number; life: number; floorY: number; bounced: boolean; }

const DOODLES_KEY = "zerro-doodles";
const FRIDGE_KEY = "zerro-fridge";
const SVG_NS = "http://www.w3.org/2000/svg";

function drawCube(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, z: number, ink: string, accent: string): void {
  const far = z < 0.35;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  if (z > 0.6) {
    ctx.shadowBlur = 6 * z;
    ctx.shadowColor = accent;
  } else if (far) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = accent;
  }
  ctx.globalAlpha = far ? 0.35 : 1;
  ctx.fillStyle = ink;
  ctx.fillRect(-s / 2, -s / 2, s, s);
  if (!far) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(-s / 2, -s / 2, s, s);
  }
  ctx.globalAlpha = far ? 0.35 * 0.85 : 0.85;
  ctx.fillStyle = accent;
  const inner = s * 0.45;
  ctx.fillRect(-inner / 2, -inner / 2, inner, inner);
  ctx.restore();
}

export function initFridge(root: HTMLElement): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const zone = root.querySelector<HTMLElement>(".zone")!;
  const zoneLabel = zone.querySelector<HTMLElement>(".zone__label")!;
  let dragging = false;
  let night = document.documentElement.dataset.theme === "dark";
  const magnets: { el: HTMLElement; pos: Position; refit: () => void }[] = [];

  function remPx() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  }
  function renderSize(s: number) {
    return Math.min(Math.max(5 * remPx(), s * root.clientWidth), 12 * remPx());
  }

  function readJSON<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
  function saveJSON(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  let doodles = readJSON<Doodle[]>(DOODLES_KEY, []);
  if (!Array.isArray(doodles)) doodles = [];
  const stored = readJSON<Record<string, Position>>(FRIDGE_KEY, {});
  const positions: Record<string, Position> = stored && typeof stored === "object" ? stored : {};

  function makePath(d: string): SVGPathElement {
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "currentColor");
    p.setAttribute("stroke-width", "2.5");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    p.setAttribute("vector-effect", "non-scaling-stroke");
    return p;
  }

  function renderEmpty() {
    const empty = document.createElement("div");
    empty.className = "fridge__empty";
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 170 60");
    svg.classList.add("fridge__scribble");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M 10 40 C 30 10, 50 10, 45 35 S 30 55, 55 40 S 85 10, 80 35 S 65 55, 90 40 S 120 10, 115 35 S 100 55, 125 40 C 140 30, 150 35, 160 38");
    path.setAttribute("pathLength", "1");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2.5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    const text = document.createElement("p");
    text.textContent = "nothing on the fridge yet";
    const link = document.createElement("a");
    link.href = "/#playground";
    link.textContent = "→ go draw";
    empty.append(svg, text, link);
    root.append(empty);
  }

  function setPos(el: HTMLElement, x: number, y: number, r: number) {
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${r}deg)`;
    el.dataset.rot = String(r);
  }
  function applyBob(el: HTMLElement) {
    if (reduced) return;
    const name = night ? "fridge-float" : "fridge-flutter";
    const dur = (4 + Math.random() * 2).toFixed(2);
    const delay = (-Math.random() * 3).toFixed(2);
    el.style.animation = `${name} ${dur}s ease-in-out ${delay}s infinite alternate`;
  }
  function savePosition(doodle: Doodle, x: number, y: number, r: number) {
    const pos = positions[String(doodle.at)];
    pos.x = x / root.clientWidth;
    pos.y = y / root.clientHeight;
    pos.r = r;
    saveJSON(FRIDGE_KEY, positions);
  }

  const zoneCanvas = zone.querySelector<HTMLCanvasElement>(".zone__dust")!;
  const zoneDpr = Math.min(window.devicePixelRatio || 1, 2);
  let zoneRaf = 0;
  let zoneW = 0;
  let zoneH = 0;
  let extraH = 0;
  let zoneLeft = 0;
  let zoneTop = 0;
  let zoneLeanX = 0;
  let zoneLeanY = 0;
  let zoneArmed = false;
  let hopAcc = 0;
  let accent = "";
  let cubes: FloorCube[] = [];

  function spawnCubes(count: number) {
    const arr: FloorCube[] = [];
    for (let i = 0; i < count; i++) {
      const z = Math.random();
      const restY = extraH + zoneH * (0.3 + 0.62 * z);
      const restX = zoneW / 2 + (Math.random() + Math.random() - 1) * zoneW * (0.15 + 0.35 * z);
      arr.push({ x: restX, y: restY, restX, restY, z, a: Math.random() * Math.PI * 2, dir: Math.random() < 0.5 ? -1 : 1, vy: 0 });
    }
    return arr.sort((a, b) => a.z - b.z);
  }

  function drawFloor(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, zoneW, zoneH + extraH);
    const ink = night ? "#2b0a10" : "#2a0d12";
    for (const p of cubes) drawCube(ctx, p.x, p.y, 4 + p.z * 10, p.a, p.z, ink, accent);
  }

  function stepFloor(dt: number) {
    hopAcc += dt;
    if (hopAcc >= 1.5) {
      hopAcc -= 1.5;
      const c = cubes[Math.floor(Math.random() * cubes.length)];
      c.vy = -1.5 - Math.random() * 1.5;
    }
    for (const p of cubes) {
      p.a += (0.002 + p.z * 0.004) * p.dir * (zoneArmed ? 8 : 1);
      if (zoneArmed && Math.abs(p.x - zoneLeanX) < 120) {
        p.x += (zoneLeanX - p.x) * 0.06 * p.z;
        p.y += (zoneLeanY - p.y) * 0.06 * p.z;
      } else {
        p.vy += 0.4;
        p.y += p.vy;
        p.x += (p.restX - p.x) * 0.06;
        if (p.y >= p.restY) { p.y = p.restY; p.vy = 0; }
      }
    }
  }

  function startFloor() {
    const rect = zone.getBoundingClientRect();
    zoneW = rect.width;
    zoneH = rect.height;
    zoneLeft = rect.left;
    zoneTop = rect.top;
    extraH = 10 * remPx();
    accent = getComputedStyle(document.documentElement).getPropertyValue("--blog-callout-caution").trim();
    zoneCanvas.width = Math.max(1, Math.round(zoneW * zoneDpr));
    zoneCanvas.height = Math.max(1, Math.round((zoneH + extraH) * zoneDpr));
    zoneCanvas.style.width = `${zoneW}px`;
    zoneCanvas.style.height = `${zoneH + extraH}px`;
    const ctx = zoneCanvas.getContext("2d")!;
    ctx.setTransform(zoneDpr, 0, 0, zoneDpr, 0, 0);
    zoneArmed = false;
    zoneLeanX = zoneW / 2;
    zoneLeanY = extraH + zoneH / 2;
    hopAcc = 0;
    cubes = spawnCubes(120);
    if (reduced) {
      drawFloor(ctx);
      return;
    }
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stepFloor(dt);
      drawFloor(ctx);
      zoneRaf = requestAnimationFrame(frame);
    };
    zoneRaf = requestAnimationFrame(frame);
  }

  function stopFloor() {
    if (zoneRaf) cancelAnimationFrame(zoneRaf);
    zoneRaf = 0;
    const ctx = zoneCanvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, zoneW, zoneH + extraH);
  }

  function isArmed(clientX: number, clientY: number) {
    const rect = zone.getBoundingClientRect();
    return clientX >= rect.left - 24 && clientX <= rect.right + 24 &&
           clientY >= rect.top - 24 && clientY <= rect.bottom + 24;
  }

  function removeDoodle(magnet: HTMLElement, doodle: Doodle) {
    dragging = false;
    magnet.classList.remove("is-doomed");
    zone.classList.remove("is-armed");
    zone.classList.remove("is-open");
    stopFloor();
    zoneLabel.textContent = "drop to remove";
    root.style.overflow = "hidden";

    const storedDoodles = readJSON<Doodle[]>(DOODLES_KEY, []);
    doodles = Array.isArray(storedDoodles) ? storedDoodles.filter((d) => d.at !== doodle.at) : [];
    saveJSON(DOODLES_KEY, doodles);
    delete positions[String(doodle.at)];
    saveJSON(FRIDGE_KEY, positions);
    const idx = magnets.findIndex((m) => m.el === magnet);
    if (idx >= 0) magnets.splice(idx, 1);

    if (doodles.length === 0) renderEmpty();

    if (reduced) {
      fadeRemove(magnet);
      return;
    }
    snap(magnet, doodle, () => magnet.remove());
  }

  function fadeRemove(magnet: HTMLElement) {
    magnet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: "ease-out" }).onfinish = () => {
      magnet.remove();
    };
  }

  function snap(magnet: HTMLElement, doodle: Doodle, done: () => void) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = magnet.getBoundingClientRect();
    const cw = Math.max(1, Math.round(rect.width * dpr));
    const ch = Math.max(1, Math.round(rect.height * dpr));
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--blog-callout-caution").trim();
    const ink = night ? "#2b0a10" : "#2a0d12";

    const off = document.createElement("canvas");
    off.width = cw;
    off.height = ch;
    const ctx = off.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const scale = Math.min(rect.width / doodle.w, rect.height / doodle.h);
    ctx.translate(rect.width / 2, rect.height / 2);
    ctx.rotate((Number(magnet.dataset.rot || 0) * Math.PI) / 180);
    ctx.translate(-rect.width / 2, -rect.height / 2);
    ctx.translate((rect.width - doodle.w * scale) / 2, (rect.height - doodle.h * scale) / 2);
    ctx.scale(scale, scale);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5 / scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const d of doodle.paths) ctx.stroke(new Path2D(d));

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const zr = zone.getBoundingClientRect();
    const floorY = rect.bottom > zr.top && rect.top < zr.bottom ? window.innerHeight - 1.5 * remPx() : rect.bottom + 80;

    const data = ctx.getImageData(0, 0, cw, ch).data;
    let particles: SnapCube[] = [];
    for (let y = 0; y < ch; y += 3) {
      for (let x = 0; x < cw; x += 3) {
        if (data[(y * cw + x) * 4 + 3] > 0) {
          const px = rect.left + x / dpr;
          const py = rect.top + y / dpr;
          const dx = px - cx;
          const dy = py - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const mag = 1 + Math.random() * 2;
          particles.push({
            x: px,
            y: py,
            vx: (dx / dist) * mag,
            vy: (dy / dist) * mag - 0.6,
            size: 4 + Math.random() * 4,
            a: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.4,
            delay: (x / cw) * 350,
            life: 600,
            floorY,
            bounced: false,
          });
        }
      }
    }
    if (particles.length === 0) {
      done();
      return;
    }
    if (particles.length > 220) {
      const step = particles.length / 220;
      const sampled: SnapCube[] = [];
      for (let i = 0; i < 220; i++) sampled.push(particles[Math.floor(i * step)]);
      particles = sampled;
    }

    magnet.style.visibility = "hidden";

    const layer = document.createElement("canvas");
    layer.style.position = "fixed";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.zIndex = "2147483647";
    layer.style.width = `${window.innerWidth}px`;
    layer.style.height = `${window.innerHeight}px`;
    layer.width = Math.max(1, Math.round(window.innerWidth * dpr));
    layer.height = Math.max(1, Math.round(window.innerHeight * dpr));
    const lctx = layer.getContext("2d")!;
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    document.body.append(layer);

    const start = performance.now();
    const maxEnd = Math.max(...particles.map((p) => p.delay + p.life));
    const frame = (now: number) => {
      const t = now - start;
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        const life = t - p.delay;
        if (life < 0 || life >= p.life) continue;
        p.vy += 0.25;
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.spin;
        if (p.y >= p.floorY) {
          if (!p.bounced) {
            p.y = p.floorY;
            p.vy = -p.vy * 0.3;
            p.bounced = true;
          } else {
            p.y = p.floorY;
            p.vy = 0;
          }
        }
        lctx.globalAlpha = 1 - life / p.life;
        drawCube(lctx, p.x, p.y, p.size, p.a, 0.5, ink, accent);
      }
      lctx.globalAlpha = 1;
      if (t < maxEnd) requestAnimationFrame(frame);
      else {
        layer.remove();
        done();
      }
    };
    requestAnimationFrame(frame);
  }

  function growFridge() {
    const rem = remPx();
    const cols = root.clientWidth < 640 ? 2 : 4;
    const rows = Math.ceil(doodles.length / cols);
    let total = 0;
    for (const m of magnets) total += parseFloat(m.el.style.width) || 0;
    const rowHeight = magnets.length ? (total / magnets.length) * 1.15 : 0;
    const base = parseFloat(getComputedStyle(root).minHeight) || 0;
    root.style.minHeight = `${Math.max(base, rows * rowHeight + 6 * rem)}px`;
  }

  function renderMagnet(doodle: Doodle, index: number) {
    const key = String(doodle.at);
    const cols = root.clientWidth < 640 ? 2 : 4;
    let pos = positions[key];
    if (!pos) {
      const rows = Math.ceil(doodles.length / cols);
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = Math.max(0.05, Math.min(0.95, (col + 0.5) / cols + (Math.random() * 0.16 - 0.08)));
      const maxY = Math.min(0.95, 1 - (4.5 * remPx()) / root.clientHeight);
      const y = Math.max(0.05, Math.min(maxY, (row + 0.5) / rows + (Math.random() * 0.1 - 0.05)));
      pos = { x, y, r: Math.random() * 24 - 12, s: 0.22 + Math.random() * 0.12 };
      positions[key] = pos;
      saveJSON(FRIDGE_KEY, positions);
    } else if (pos.s > 1) {
      pos.s = Math.min(0.34, (pos.s * 16) / root.clientWidth);
      saveJSON(FRIDGE_KEY, positions);
    }

    const magnet = document.createElement("div");
    magnet.className = "magnet";
    magnet.tabIndex = 0;
    magnet.setAttribute("role", "img");
    magnet.setAttribute("aria-label", "Doodle — press Delete to remove");
    magnet.style.zIndex = String(index + 1);

    const bob = document.createElement("div");
    bob.className = "magnet__bob";
    applyBob(bob);

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${doodle.w} ${doodle.h}`);
    for (const d of doodle.paths) svg.append(makePath(d));
    bob.append(svg);
    magnet.append(bob);
    root.append(magnet);

    let halfW = 0;
    let halfH = 0;
    let x = 0;
    let y = 0;
    let r = pos.r;

    const entry = {
      el: magnet,
      pos,
      refit() {
        const size = renderSize(pos.s);
        magnet.style.width = `${size}px`;
        magnet.style.height = `${size}px`;
        halfW = size / 2;
        halfH = size / 2;
        x = Math.max(halfW, Math.min(root.clientWidth - halfW, pos.x * root.clientWidth));
        y = Math.max(halfH, Math.min(root.clientHeight - halfH - 4.5 * remPx(), pos.y * root.clientHeight));
        setPos(magnet, x, y, r);
      },
    };
    magnets.push(entry);
    entry.refit();

    function animateStroke(p: SVGPathElement, delay: number) {
      const len = p.getTotalLength() * Math.min(svg.clientWidth / doodle.w, svg.clientHeight / doodle.h);
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
      const anim = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 700, delay, easing: "ease-out", fill: "backwards" });
      anim.onfinish = anim.oncancel = () => {
        p.style.strokeDasharray = "";
        p.style.strokeDashoffset = "";
      };
    }

    if (!reduced) {
      for (const p of svg.querySelectorAll<SVGPathElement>("path")) animateStroke(p, index * 250);
    }

    magnet.addEventListener("pointerenter", () => {
      if (reduced || dragging) return;
      for (const p of svg.querySelectorAll<SVGPathElement>("path")) animateStroke(p, 0);
    });

    let samples: { x: number; y: number; t: number }[] = [];
    let offX = 0;
    let offY = 0;

    magnet.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      magnet.setPointerCapture(event.pointerId);
      dragging = true;
      magnet.classList.add("is-dragging");
      magnet.style.cursor = "grabbing";
      bob.style.animationPlayState = "paused";
      magnet.style.zIndex = "99";
      zone.classList.add("is-open");
      startFloor();
      root.style.overflow = "visible";
      const rect = root.getBoundingClientRect();
      const box = magnet.getBoundingClientRect();
      x = box.left + box.width / 2 - rect.left;
      y = box.top + box.height / 2 - rect.top;
      offX = event.clientX - rect.left - x;
      offY = event.clientY - rect.top - y;
      samples = [{ x: event.clientX, y: event.clientY, t: performance.now() }];
      setPos(magnet, x, y, r);
      event.preventDefault();
    });

    magnet.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const rect = root.getBoundingClientRect();
      x = event.clientX - rect.left - offX;
      y = event.clientY - rect.top - offY;
      const armed = isArmed(event.clientX, event.clientY);
      zoneArmed = armed;
      zoneLeanX = event.clientX - zoneLeft;
      zoneLeanY = event.clientY - zoneTop + extraH;
      zone.classList.toggle("is-armed", armed);
      magnet.classList.toggle("is-doomed", armed);
      zoneLabel.textContent = armed ? "release to remove" : "drop to remove";
      setPos(magnet, x, y, r);
      samples.push({ x: event.clientX, y: event.clientY, t: performance.now() });
      if (samples.length > 5) samples.shift();
    });

    function release() {
      dragging = false;
      magnet.classList.remove("is-dragging");
      magnet.classList.remove("is-doomed");
      magnet.style.cursor = "grab";
      bob.style.animationPlayState = "running";
      zone.classList.remove("is-armed");
      zone.classList.remove("is-open");
      stopFloor();
      zoneLabel.textContent = "drop to remove";
      root.style.overflow = "hidden";

      const rect = root.getBoundingClientRect();
      const floor = 4.5 * remPx();
      x = Math.max(halfW, Math.min(rect.width - halfW, x));
      y = Math.max(halfH, Math.min(rect.height - halfH - floor, y));
      setPos(magnet, x, y, r);

      let vx = 0;
      let vy = 0;
      if (!reduced && samples.length > 1) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          vx = ((last.x - first.x) / dt) * 16.7;
          vy = ((last.y - first.y) / dt) * 16.7;
        }
      }

      if (reduced || (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05)) {
        savePosition(doodle, x, y, r);
        return;
      }

      const step = () => {
        const rect = root.getBoundingClientRect();
        x += vx;
        y += vy;
        if (x < halfW) { x = halfW; vx = -vx * 0.6; }
        else if (x > rect.width - halfW) { x = rect.width - halfW; vx = -vx * 0.6; }
        if (y < halfH) { y = halfH; vy = -vy * 0.6; }
        else if (y > rect.height - halfH - floor) { y = rect.height - halfH - floor; vy = -vy * 0.6; }
        r = Math.max(-20, Math.min(20, r + vx * 0.05));
        vx *= 0.92;
        vy *= 0.92;
        setPos(magnet, x, y, r);
        if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) return savePosition(doodle, x, y, r);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    magnet.addEventListener("pointerup", (event) => {
      if (!dragging) return;
      if (isArmed(event.clientX, event.clientY)) removeDoodle(magnet, doodle);
      else release();
    });
    magnet.addEventListener("pointercancel", () => {
      if (dragging) release();
    });

    magnet.addEventListener("keydown", (event) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        removeDoodle(magnet, doodle);
        event.preventDefault();
        return;
      }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        const rect = root.getBoundingClientRect();
        const stepX = 0.02 * rect.width;
        const stepY = 0.02 * rect.height;
        if (event.key === "ArrowLeft") x = Math.max(halfW, x - stepX);
        if (event.key === "ArrowRight") x = Math.min(rect.width - halfW, x + stepX);
        if (event.key === "ArrowUp") y = Math.max(halfH, y - stepY);
        if (event.key === "ArrowDown") y = Math.min(rect.height - halfH - 4.5 * remPx(), y + stepY);
        setPos(magnet, x, y, r);
        savePosition(doodle, x, y, r);
        event.preventDefault();
      }
    });
  }

  if (doodles.length === 0) {
    renderEmpty();
    return;
  }
  doodles.forEach(renderMagnet);
  growFridge();

  new ResizeObserver(() => {
    growFridge();
    magnets.forEach((m) => m.refit());
  }).observe(root);

  new MutationObserver(() => {
    night = document.documentElement.dataset.theme === "dark";
    root.querySelectorAll(".magnet__bob").forEach((el) => applyBob(el as HTMLElement));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
