export function initGumGum(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const img = document.querySelector<HTMLElement>(".hero__img");
  const shout = document.querySelector<HTMLElement>(".hero__shout");
  if (!img || !shout) return;

  img.style.touchAction = "none";
  img.style.cursor = "grab";

  let dx = 0;
  let dy = 0;
  let vx = 0;
  let vy = 0;
  let startX = 0;
  let startY = 0;
  let dragging = false;
  let raf = 0;
  let shoutTimer = 0;

  function render(): void {
    const d = Math.min(Math.hypot(dx, dy), 200);
    const a = Math.atan2(dy, dx);
    img.style.transform = `translate(${dx / 2}px, ${dy / 2}px) rotate(${a}rad) scaleX(${1 + d / 128}) scaleY(${1 - d / 600}) rotate(${-a}rad)`;
  }

  function spring(): void {
    vx += -0.18 * dx;
    vx *= 0.72;
    dx += vx;
    vy += -0.18 * dy;
    vy *= 0.72;
    dy += vy;
    render();
    if (Math.abs(dx) < 0.3 && Math.abs(vx) < 0.3 && Math.abs(dy) < 0.3 && Math.abs(vy) < 0.3) {
      raf = 0;
      img.style.transform = "";
      return;
    }
    raf = requestAnimationFrame(spring);
  }

  img.addEventListener("pointerdown", (event) => {
    cancelAnimationFrame(raf);
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    img.setPointerCapture(event.pointerId);
    img.style.cursor = "grabbing";
  });

  img.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    let mx = event.clientX - startX;
    let my = event.clientY - startY;
    const raw = Math.hypot(mx, my);
    if (raw > 200) {
      mx = (mx / raw) * 200;
      my = (my / raw) * 200;
    }
    dx = mx;
    dy = my;
    render();
  });

  const release = (event: PointerEvent): void => {
    dragging = false;
    img.style.cursor = "grab";
    if (img.hasPointerCapture(event.pointerId)) img.releasePointerCapture(event.pointerId);
    if (Math.hypot(dx, dy) > 140) {
      shout.classList.add("is-shouting");
      clearTimeout(shoutTimer);
      shoutTimer = window.setTimeout(() => shout.classList.remove("is-shouting"), 900);
    }
    raf = requestAnimationFrame(spring);
  };

  img.addEventListener("pointerup", release);
  img.addEventListener("pointercancel", release);
}
