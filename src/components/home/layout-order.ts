const STORAGE_KEY = "zerro-home-order";
const DEFAULT_ORDER = ["work", "experience", "playground", "writing", "off-the-clock"];

export function initLayoutOrder(): void {
  const wrapper = document.querySelector<HTMLElement>("[data-sections]");
  if (!wrapper) return;

  const note = document.querySelector<HTMLElement>(".layout-note");
  const reset = note?.querySelector<HTMLButtonElement>("[data-layout-reset]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  const sections = (): HTMLElement[] =>
    Array.from(wrapper.querySelectorAll<HTMLElement>("[data-section]"));

  const orderIds = (): string[] => sections().map((s) => s.dataset.section ?? "");

  function transition(move: () => void): void {
    if (reduced) return move();
    if (document.startViewTransition) document.startViewTransition(move);
    else move();
  }

  function save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orderIds()));
    } catch {}
  }

  function syncNote(): void {
    if (note) note.hidden = orderIds().join(",") === DEFAULT_ORDER.join(",");
  }

  function sectionUnder(y: number, except: HTMLElement): HTMLElement | null {
    for (const section of sections()) {
      if (section === except) continue;
      const rect = section.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) return section;
    }
    return null;
  }

  function place(section: HTMLElement, target: HTMLElement, before: boolean): void {
    wrapper.insertBefore(section, before ? target : target.nextSibling);
  }

  for (const section of sections()) {
    section.style.viewTransitionName = `section-${section.dataset.section}`;
  }

  for (const button of wrapper.querySelectorAll<HTMLButtonElement>("[data-move]")) {
    if (fine) {
      button.addEventListener("pointerdown", (event) => {
        const section = button.closest<HTMLElement>("[data-section]");
        if (!section) return;
        button.setPointerCapture(event.pointerId);
        const onMove = (e: PointerEvent): void => {
          const target = sectionUnder(e.clientY, section);
          if (!target) return;
          const rect = target.getBoundingClientRect();
          transition(() => place(section, target, e.clientY < rect.top + rect.height / 2));
        };
        const onUp = (e: PointerEvent): void => {
          button.removeEventListener("pointermove", onMove);
          button.removeEventListener("pointerup", onUp);
          button.removeEventListener("pointercancel", onUp);
          if (button.hasPointerCapture(e.pointerId)) button.releasePointerCapture(e.pointerId);
          save();
          syncNote();
        };
        button.addEventListener("pointermove", onMove);
        button.addEventListener("pointerup", onUp);
        button.addEventListener("pointercancel", onUp);
      });
    }

    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      const section = button.closest<HTMLElement>("[data-section]");
      if (!section) return;
      const siblings = sections();
      const direction = event.key === "ArrowUp" ? -1 : 1;
      const target = siblings[siblings.indexOf(section) + direction];
      if (!target) return;
      // View transitions run the update asynchronously, so persist from inside it.
      transition(() => {
        place(section, target, direction === -1);
        save();
        syncNote();
      });
      button.focus();
    });
  }

  reset?.addEventListener("click", () => {
    transition(() => {
      const byId = new Map(sections().map((s) => [s.dataset.section, s]));
      for (const id of DEFAULT_ORDER) {
        const section = byId.get(id);
        if (section) wrapper.append(section);
      }
      syncNote();
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  });

  syncNote();
}
