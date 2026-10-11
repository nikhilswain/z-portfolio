interface Doodle { w: number; h: number; paths: string[]; at: number; }
interface Position { x: number; y: number; r: number; s: number; }
interface Particle { x: number; y: number; vx: number; vy: number; delay: number; life: number; }

const DOODLES_KEY = "zerro-doodles";
const FRIDGE_KEY = "zerro-fridge";
const SVG_NS = "http://www.w3.org/2000/svg";

export function initFridge(root: HTMLElement): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bin = root.querySelector<HTMLElement>(".fridge__bin")!;
  let dragging = false;
  let night = document.documentElement.dataset.theme === "dark";

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
    svg.setAttribute("viewBox", "0 0 100 100");
    const path = makePath("M 50 22 a 28 28 0 1 0 0.1 0 M 40 36 h 6 M 54 36 h 6 M 38 46 q 12 12 24 0");
    path.setAttribute("stroke-dasharray", "2 6");
    svg.append(path);
    const text = document.createElement("p");
    text.textContent = "nothing on the fridge yet";
    const link = document.createElement("a");
    link.href = "/#playground";
    link.textContent = "→ go draw";
    empty.append(svg, text, link);
    root.append(empty);
  }

  function setPos(el: HTMLElement, x: number, y: number, r: number, scale: number) {
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${r}deg) scale(${scale})`;
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

  function isArmed(clientX: number, clientY: number) {
    const rect = bin.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right &&
           clientY >= rect.top && clientY <= rect.bottom;
  }

  function remove(magnet: HTMLElement, doodle: Doodle) {
    doodles = doodles.filter((d) => d !== doodle);
    saveJSON(DOODLES_KEY, doodles);
    delete positions[String(doodle.at)];
    saveJSON(FRIDGE_KEY, positions);
    dragging = false;
    bin.hidden = true;
    bin.classList.remove("is-armed");
    magnet.classList.remove("is-doomed");
    root.style.overflow = "hidden";

    if (reduced) {
      const base = magnet.style.transform;
      magnet.animate(
        [{ transform: base, opacity: 1 }, { transform: `${base} scale(0)`, opacity: 0 }],
        { duration: 200, easing: "ease-out" },
      ).onfinish = () => {
        magnet.remove();
        if (doodles.length === 0) renderEmpty();
      };
      return;
    }

    snap(magnet, doodle, () => {
      magnet.remove();
      if (doodles.length === 0) renderEmpty();
    });
  }

  function snap(magnet: HTMLElement, doodle: Doodle, done: () => void) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = magnet.getBoundingClientRect();
    const cw = Math.max(1, Math.round(rect.width * dpr));
    const ch = Math.max(1, Math.round(rect.height * dpr));
    const color = getComputedStyle(magnet).color;

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
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 / scale; // non-scaling-stroke: keep the same 2.5px width after the meet scale
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const d of doodle.paths) ctx.stroke(new Path2D(d));

    const data = ctx.getImageData(0, 0, cw, ch).data;
    let particles: Particle[] = [];
    for (let y = 0; y < ch; y += 3) {
      for (let x = 0; x < cw; x += 3) {
        if (data[(y * cw + x) * 4 + 3] > 0) {
          particles.push({
            x, y,
            vx: 0.4 + Math.random() * 1.2,
            vy: -(0.3 + Math.random() * 1.1),
            delay: (x / cw) * 350,
            life: 500 + Math.random() * 300,
          });
        }
      }
    }
    if (particles.length === 0) {
      done();
      return;
    }
    if (particles.length > 900) {
      const step = particles.length / 900;
      const sampled: Particle[] = [];
      for (let i = 0; i < 900; i++) sampled.push(particles[Math.floor(i * step)]);
      particles = sampled;
    }

    magnet.style.visibility = "hidden";

    const layer = document.createElement("canvas");
    layer.style.position = "fixed";
    layer.style.left = "0";
    layer.style.top = "0";
    layer.style.width = `${window.innerWidth}px`;
    layer.style.height = `${window.innerHeight}px`;
    layer.style.pointerEvents = "none";
    layer.style.zIndex = "2147483647";
    layer.width = Math.max(1, Math.round(window.innerWidth * dpr));
    layer.height = Math.max(1, Math.round(window.innerHeight * dpr));
    const lctx = layer.getContext("2d")!;
    const offX = rect.left * dpr;
    const offY = rect.top * dpr;
    document.body.append(layer);

    const start = performance.now();
    const maxEnd = Math.max(...particles.map((p) => p.delay + p.life));
    const frame = (now: number) => {
      const t = now - start;
      lctx.clearRect(0, 0, layer.width, layer.height);
      for (const p of particles) {
        p.x += p.vx + (Math.random() - 0.5) * 0.6;
        p.y += p.vy + (Math.random() - 0.5) * 0.6;
        if (t < p.delay || t >= p.delay + p.life) continue;
        lctx.globalAlpha = 1 - (t - p.delay) / p.life;
        lctx.fillStyle = color;
        lctx.fillRect(offX + p.x, offY + p.y, 2, 2);
      }
      if (t < maxEnd) requestAnimationFrame(frame);
      else {
        layer.remove();
        done();
      }
    };
    requestAnimationFrame(frame);
  }

  function renderMagnet(doodle: Doodle, index: number) {
    const key = String(doodle.at);
    let pos = positions[key];
    if (!pos) {
      pos = { x: 0.1 + Math.random() * 0.7, y: 0.1 + Math.random() * 0.6, r: Math.random() * 24 - 12, s: 7 + Math.random() * 5 };
      positions[key] = pos;
      saveJSON(FRIDGE_KEY, positions);
    }

    const magnet = document.createElement("div");
    magnet.className = "magnet";
    magnet.tabIndex = 0;
    magnet.setAttribute("role", "img");
    magnet.setAttribute("aria-label", "Doodle — press Delete to remove");
    magnet.style.width = `${pos.s}rem`;
    magnet.style.height = `${pos.s}rem`;
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

    const halfW = magnet.offsetWidth / 2;
    const halfH = magnet.offsetHeight / 2;
    let x = Math.max(halfW, Math.min(root.clientWidth - halfW, pos.x * root.clientWidth));
    let y = Math.max(halfH, Math.min(root.clientHeight - halfH, pos.y * root.clientHeight));
    let r = pos.r;
    setPos(magnet, x, y, r, 1);

    function animateStroke(p: SVGPathElement, delay: number) {
      // Strokes use non-scaling-stroke, so dashes are measured in screen px: scale the path length to match.
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
      bin.hidden = false;
      root.style.overflow = "visible";
      const rect = root.getBoundingClientRect();
      offX = event.clientX - rect.left - x;
      offY = event.clientY - rect.top - y;
      samples = [{ x: event.clientX, y: event.clientY, t: performance.now() }];
      setPos(magnet, x, y, r, 1.06);
      event.preventDefault();
    });

    magnet.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const rect = root.getBoundingClientRect();
      x = event.clientX - rect.left - offX;
      y = event.clientY - rect.top - offY;
      const armed = isArmed(event.clientX, event.clientY);
      bin.classList.toggle("is-armed", armed);
      magnet.classList.toggle("is-doomed", armed);
      setPos(magnet, x, y, r, 1.06);
      samples.push({ x: event.clientX, y: event.clientY, t: performance.now() });
      if (samples.length > 5) samples.shift();
    });

    function release() {
      dragging = false;
      magnet.classList.remove("is-dragging");
      magnet.classList.remove("is-doomed");
      magnet.style.cursor = "grab";
      bob.style.animationPlayState = "running";
      bin.hidden = true;
      bin.classList.remove("is-armed");
      root.style.overflow = "hidden";

      const rect = root.getBoundingClientRect();
      x = Math.max(halfW, Math.min(rect.width - halfW, x));
      y = Math.max(halfH, Math.min(rect.height - halfH, y));
      setPos(magnet, x, y, r, 1);

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
        else if (y > rect.height - halfH) { y = rect.height - halfH; vy = -vy * 0.6; }
        r = Math.max(-20, Math.min(20, r + vx * 0.05));
        vx *= 0.92;
        vy *= 0.92;
        setPos(magnet, x, y, r, 1);
        if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) return savePosition(doodle, x, y, r);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    magnet.addEventListener("pointerup", (event) => {
      if (!dragging) return;
      if (isArmed(event.clientX, event.clientY)) remove(magnet, doodle);
      else release();
    });
    magnet.addEventListener("pointercancel", () => {
      if (dragging) release();
    });

    magnet.addEventListener("keydown", (event) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        remove(magnet, doodle);
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
        if (event.key === "ArrowDown") y = Math.min(rect.height - halfH, y + stepY);
        setPos(magnet, x, y, r, 1);
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

  new MutationObserver(() => {
    night = document.documentElement.dataset.theme === "dark";
    root.querySelectorAll(".magnet__bob").forEach((el) => applyBob(el as HTMLElement));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
