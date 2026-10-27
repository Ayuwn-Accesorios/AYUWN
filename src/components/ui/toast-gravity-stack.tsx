"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export type SedimentSeverity = "error" | "warning" | "info";

export interface SedimentToastInput {
  severity?: SedimentSeverity;
  title: string;
  message?: string;
  duration?: number;
}

export interface SedimentStackHandle {
  push: (toast: SedimentToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

type ToastRec = {
  id: string;
  severity: SedimentSeverity;
  title: string;
  message?: string;
  duration: number;
};

type Body = {
  id: string;
  el: HTMLDivElement;
  x: number;
  y: number;
  a: number;
  vx: number;
  vy: number;
  om: number;
  hw: number;
  hh: number;
  r: number;
  lxs: number[];
  bound: number;
  invMass: number;
  invI: number;
  baseInvMass: number;
  baseInvI: number;
  born: number;
  dead: boolean;
  dragging: boolean;
  dragPX: number;
  dragX0: number;
  dragLastX: number;
  dragLastT: number;
  dragVX: number;
  spring: boolean;
  anchorX: number;
  hovered: boolean;
  asleep: boolean;
  calm: number;
  age: number;
};

type TimerEntry = {
  handle: number | null;
  deadline: number;
  remaining: number;
};

const FLOOR_INSET = 6;

const RAIL: Record<SedimentSeverity, string> = {
  error: "var(--error, #ea001d)",
  warning: "var(--warning, #f5a623)",
  info: "var(--success, #10b981)",
};

const ICONS: Record<SedimentSeverity, ReactNode> = {
  error: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 2.7 19a1.5 1.5 0 0 0 1.3 2.3h16a1.5 1.5 0 0 0 1.3-2.3L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 17.4h.01" />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  ),
};

function CardInner({ toast, onDismiss }: { toast: ToastRec; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-2.5 py-2 pl-3 pr-1.5">
      <span className="mt-0.5 shrink-0 text-ink/70">
        {ICONS[toast.severity]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold leading-tight text-ink">
          {toast.title}
        </p>
        {toast.message ? (
          <p className="mt-0.5 truncate text-[11px] leading-tight text-ink/60">
            {toast.message}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label={`Dismiss: ${toast.title}`}
        onClick={onDismiss}
        className="shrink-0 cursor-pointer rounded-sm p-1 text-ink/40 transition-colors duration-150 hover:bg-ink/10 hover:text-ink"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ReducedCard({ toast, exiting, onDismiss, onEnter, onLeave }: { toast: ToastRec; exiting: boolean; onDismiss: () => void; onEnter: () => void; onLeave: () => void; }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      role={toast.severity === "error" ? "alert" : "status"}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={`pointer-events-auto w-full rounded-2xl border border-ink/10 bg-white shadow-md transition-opacity duration-150 ${
        shown && !exiting ? "opacity-100" : "opacity-0"
      }`}
      style={{ borderLeftWidth: 4, borderLeftColor: RAIL[toast.severity] }}
    >
      <CardInner toast={toast} onDismiss={onDismiss} />
    </div>
  );
}

export const SedimentStack = forwardRef<
  SedimentStackHandle,
  {
    duration?: number;
    gravity?: number;
    restitution?: number;
    initial?: SedimentToastInput[];
    className?: string;
    "aria-label"?: string;
  }
>(function SedimentStack(
  {
    duration = 6000,
    gravity = 1800,
    restitution = 0.15,
    initial,
    className = "h-96",
    "aria-label": ariaLabel = "Notifications",
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodiesRef = useRef<Map<string, Body>>(new Map());
  const timersRef = useRef<Map<string, TimerEntry>>(new Map());
  const removalsRef = useRef<Set<number>>(new Set());
  const dismissedRef = useRef<Set<string>>(new Set());
  const wakeRef = useRef<() => void>(() => {});
  const kickRef = useRef<() => void>(() => {});
  const shadowRef = useRef("0 10px 24px -10px rgba(30,16,51,0.2)");
  const restShadowRef = useRef("0 4px 12px -4px rgba(30,16,51,0.12)");
  const seqRef = useRef(0);
  const bornRef = useRef(0);
  const spawnSlotRef = useRef(0);

  const [toasts, setToasts] = useState<ToastRec[]>(() =>
    (initial ?? []).map((t, i) => ({
      id: `sed-init-${i}`,
      severity: t.severity ?? "info",
      title: t.title,
      message: t.message,
      duration: t.duration ?? duration,
    })),
  );
  const [exiting, setExiting] = useState<ReadonlySet<string>>(new Set());
  const [reduced, setReduced] = useState(false);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const recomputeDepth = useCallback(() => {
    const alive: Body[] = [];
    for (const b of bodiesRef.current.values()) if (!b.dead) alive.push(b);
    alive.sort((a, b) => a.born - b.born);
    const n = alive.length;
    for (let i = 0; i < n; i++) {
      alive[i].el.style.opacity = Math.max(0.55, 1 - (n - 1 - i) * 0.06).toFixed(2);
    }
  }, []);

  const pauseTimer = useCallback((id: string) => {
    const entry = timersRef.current.get(id);
    if (!entry || entry.handle === null) return;
    clearTimeout(entry.handle);
    entry.handle = null;
    entry.remaining = Math.max(0, entry.deadline - Date.now());
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      const entry = timersRef.current.get(id);
      if (entry) {
        if (entry.handle !== null) clearTimeout(entry.handle);
        timersRef.current.delete(id);
      }
      if (dismissedRef.current.has(id)) return;
      dismissedRef.current.add(id);
      const body = bodiesRef.current.get(id);
      if (body && !body.dead) {
        body.dead = true;
        body.dragging = false;
        body.el.style.opacity = "0";
      }
      setExiting((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      const handle = window.setTimeout(() => {
        removalsRef.current.delete(handle);
        dismissedRef.current.delete(id);
        bodiesRef.current.delete(id);
        setToasts((prev) => prev.filter((t) => t.id !== id));
        setExiting((prev) => {
          if (!prev.has(id)) return prev;
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        recomputeDepth();
        wakeRef.current();
      }, 180);
      removalsRef.current.add(handle);
      wakeRef.current();
    },
    [recomputeDepth],
  );

  const resumeTimer = useCallback(
    (id: string) => {
      const entry = timersRef.current.get(id);
      if (!entry || entry.handle !== null) return;
      const ms = Math.max(400, entry.remaining);
      entry.deadline = Date.now() + ms;
      entry.handle = window.setTimeout(() => dismiss(id), ms);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    for (const t of toasts) {
      if (t.duration <= 0 || timers.has(t.id) || dismissedRef.current.has(t.id)) continue;
      timers.set(t.id, {
        handle: window.setTimeout(() => dismiss(t.id), t.duration),
        deadline: Date.now() + t.duration,
        remaining: t.duration,
      });
    }
  }, [toasts, dismiss]);

  useEffect(() => {
    const timers = timersRef.current;
    const removals = removalsRef.current;
    return () => {
      for (const entry of timers.values()) {
        if (entry.handle !== null) clearTimeout(entry.handle);
      }
      timers.clear();
      for (const handle of removals) clearTimeout(handle);
      removals.clear();
    };
  }, []);

  const push = useCallback(
    (input: SedimentToastInput) => {
      const id = `sed-${++seqRef.current}`;
      setToasts((prev) => [
        ...prev,
        {
          id,
          severity: input.severity ?? "info",
          title: input.title,
          message: input.message,
          duration: input.duration ?? duration,
        },
      ]);
      return id;
    },
    [duration],
  );

  const clear = useCallback(() => {
    for (const t of toastsRef.current) dismiss(t.id);
  }, [dismiss]);

  useImperativeHandle(ref, () => ({ push, dismiss, clear }), [push, dismiss, clear]);

  const attach = useCallback(
    (t: ToastRec, el: HTMLDivElement | null) => {
      const bodies = bodiesRef.current;
      const existing = bodies.get(t.id);
      if (!el) {
        if (existing && existing.dead) bodies.delete(t.id);
        return;
      }
      if (existing) {
        const isNewNode = existing.el !== el;
        existing.el = el;
        if (isNewNode) wakeRef.current();
        return;
      }
      const root = containerRef.current;
      const cw = root ? root.clientWidth : 0;
      const w = el.offsetWidth || 288;
      const h = el.offsetHeight || 60;
      const hw = w / 2;
      const hh = h / 2;
      const r = hh;
      const span = Math.max(0, hw - r);
      const count = Math.max(2, Math.ceil((span * 2) / (r * 1.2)) + 1);
      const lxs: number[] = [];
      for (let i = 0; i < count; i++) lxs.push(-span + (span * 2 * i) / (count - 1));
      const mass = t.severity === "error" ? 3 : t.severity === "warning" ? 2 : 1;
      const inertia = (mass * (w * w + h * h)) / 12;
      
      const SLOT_COUNT = 4;
      const slotLeft = hw + 8;
      const slotRight = cw - hw - 8;
      const slotSpan = slotRight - slotLeft;
      let x: number;
      if (cw > w + 40 && slotSpan > 0) {
        const n = Math.min(SLOT_COUNT, Math.max(1, Math.floor(slotSpan / 40) + 1));
        const slot = spawnSlotRef.current % n;
        spawnSlotRef.current++;
        const frac = n === 1 ? 0.5 : slot / (n - 1);
        const jitter = (Math.random() - 0.5) * Math.min(28, slotSpan / n);
        x = Math.min(slotRight, Math.max(slotLeft, slotLeft + frac * slotSpan + jitter));
      } else {
        x = Math.max(hw + 2, cw - hw - 2);
      }
      const body: Body = {
        id: t.id,
        el,
        x,
        y: -hh - 6,
        a: (Math.random() - 0.5) * ((8 * Math.PI) / 180),
        vx: (Math.random() - 0.5) * 40,
        vy: 0,
        om: 0,
        hw,
        hh,
        r,
        lxs,
        bound: Math.hypot(hw, hh) + 2,
        invMass: 1 / mass,
        invI: 1 / inertia,
        baseInvMass: 1 / mass,
        baseInvI: 1 / inertia,
        born: ++bornRef.current,
        dead: false,
        dragging: false,
        dragPX: 0,
        dragX0: 0,
        dragLastX: 0,
        dragLastT: 0,
        dragVX: 0,
        spring: false,
        anchorX: 0,
        hovered: false,
        asleep: false,
        calm: 0,
        age: 0,
      };
      el.style.transform = `translate3d(${(body.x - hw).toFixed(2)}px, ${(body.y - hh).toFixed(2)}px, 0) rotate(${body.a.toFixed(4)}rad)`;
      el.style.boxShadow = restShadowRef.current;
      bodies.set(t.id, body);
      recomputeDepth();
      wakeRef.current();
    },
    [recomputeDepth],
  );

  useEffect(() => {
    if (reduced) return;
    const root = containerRef.current;
    if (!root) return;

    let W = root.clientWidth;
    let H = root.clientHeight;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let active = 0;

    const FIXED = 1 / 120;
    const MU = 1.2;
    const SPRING_K = 180;
    const SPRING_C = 2 * 0.9 * Math.sqrt(SPRING_K);

    const pa: number[] = new Array(64).fill(0);
    const pb: number[] = new Array(64).fill(0);

    const worldPts = (b: Body, out: number[]) => {
      const cos = Math.cos(b.a);
      const sin = Math.sin(b.a);
      for (let i = 0; i < b.lxs.length; i++) {
        const lx = b.lxs[i];
        out[i * 2] = b.x + lx * cos;
        out[i * 2 + 1] = b.y + lx * sin;
      }
    };

    const applyContact = (
      A: Body,
      B: Body | null,
      px: number,
      py: number,
      nx: number,
      ny: number,
      pen: number,
    ) => {
      const rax = px - A.x;
      const ray = py - A.y;
      let rbx = 0;
      let rby = 0;
      let invMB = 0;
      let invIB = 0;
      let vbx = 0;
      let vby = 0;
      let wb = 0;
      if (B) {
        rbx = px - B.x;
        rby = py - B.y;
        invMB = B.invMass;
        invIB = B.invI;
        vbx = B.vx;
        vby = B.vy;
        wb = B.om;
      }
      const invSum = A.invMass + invMB;
      if (invSum > 0 && pen > 0.5) {
        const corr = ((pen - 0.5) / invSum) * 0.3;
        A.x -= corr * A.invMass * nx;
        A.y -= corr * A.invMass * ny;
        if (B) {
          B.x += corr * B.invMass * nx;
          B.y += corr * B.invMass * ny;
        }
      }
      const rvx = vbx - wb * rby - (A.vx - A.om * ray);
      const rvy = vby + wb * rbx - (A.vy + A.om * rax);
      const vn = rvx * nx + rvy * ny;
      if (vn >= 0) return;
      const raXn = rax * ny - ray * nx;
      const rbXn = rbx * ny - rby * nx;
      const kn = invSum + raXn * raXn * A.invI + rbXn * rbXn * invIB;
      if (kn <= 0) return;
      const e = vn < -80 ? restitution : 0;
      const j = (-(1 + e) * vn) / kn;
      A.vx -= j * nx * A.invMass;
      A.vy -= j * ny * A.invMass;
      A.om -= j * raXn * A.invI;
      if (B) {
        B.vx += j * nx * B.invMass;
        B.vy += j * ny * B.invMass;
        B.om += j * rbXn * B.invI;
      }
      let tx = rvx - vn * nx;
      let ty = rvy - vn * ny;
      const tl = Math.hypot(tx, ty);
      if (tl > 1e-6) {
        tx /= tl;
        ty /= tl;
        const raXt = rax * ty - ray * tx;
        const rbXt = rbx * ty - rby * tx;
        const kt = invSum + raXt * raXt * A.invI + rbXt * rbXt * invIB;
        if (kt > 0) {
          let jt = -(rvx * tx + rvy * ty) / kt;
          const maxF = MU * j;
          if (jt > maxF) jt = maxF;
          else if (jt < -maxF) jt = -maxF;
          A.vx -= jt * tx * A.invMass;
          A.vy -= jt * ty * A.invMass;
          A.om -= jt * raXt * A.invI;
          if (B) {
            B.vx += jt * tx * B.invMass;
            B.vy += jt * ty * B.invMass;
            B.om += jt * rbXt * B.invI;
          }
        }
      }
    };

    const step = (dt: number, bodies: Body[]) => {
      for (const b of bodies) {
        if (b.invMass === 0) continue;
        b.vy += gravity * dt;
        b.age += dt;
        if (b.spring) {
          b.vx += (-SPRING_K * (b.x - b.anchorX) - SPRING_C * b.vx) * dt;
          if (Math.abs(b.x - b.anchorX) < 0.5 && Math.abs(b.vx) < 3) b.spring = false;
        }
      }
      for (let iter = 0; iter < 3; iter++) {
        for (let i = 0; i < bodies.length; i++) {
          const A = bodies[i];
          worldPts(A, pa);
          for (let ci = 0; ci < A.lxs.length; ci++) {
            const cxw = pa[ci * 2];
            const cyw = pa[ci * 2 + 1];
            const overFloor = cyw + A.r - H;
            if (overFloor > 0) applyContact(A, null, cxw, H, 0, 1, overFloor);
            const overLeft = A.r - cxw;
            if (overLeft > 0) applyContact(A, null, 0, cyw, -1, 0, overLeft);
            const overRight = cxw + A.r - W;
            if (overRight > 0) applyContact(A, null, W, cyw, 1, 0, overRight);
          }
          for (let jn = i + 1; jn < bodies.length; jn++) {
            const B = bodies[jn];
            if (A.asleep && B.asleep) continue;
            const dx = B.x - A.x;
            const dy = B.y - A.y;
            const rr = A.bound + B.bound;
            if (dx * dx + dy * dy > rr * rr) continue;
            if (A.asleep !== B.asleep) {
              const mover = A.asleep ? B : A;
              const frozen = A.asleep ? A : B;
              if (!frozen.dragging && Math.hypot(mover.vx, mover.vy) > 60) {
                frozen.asleep = false;
                frozen.calm = 0;
                frozen.age = 0;
                frozen.invMass = frozen.baseInvMass;
                frozen.invI = frozen.baseInvI;
              }
            }
            worldPts(B, pb);
            const rsum = A.r + B.r;
            for (let pi = 0; pi < A.lxs.length; pi++) {
              for (let qi = 0; qi < B.lxs.length; qi++) {
                const ddx = pb[qi * 2] - pa[pi * 2];
                const ddy = pb[qi * 2 + 1] - pa[pi * 2 + 1];
                const d2 = ddx * ddx + ddy * ddy;
                if (d2 >= rsum * rsum) continue;
                const d = Math.sqrt(d2);
                let nx = 0;
                let ny = -1;
                if (d > 1e-6) {
                  nx = ddx / d;
                  ny = ddy / d;
                }
                const pen = rsum - d;
                applyContact(
                  A,
                  B,
                  pa[pi * 2] + nx * (A.r - pen / 2),
                  pa[pi * 2 + 1] + ny * (A.r - pen / 2),
                  nx,
                  ny,
                  pen,
                );
              }
            }
          }
        }
      }
      for (const b of bodies) {
        if (b.invMass === 0) continue;
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 1400) {
          const s = 1400 / sp;
          b.vx *= s;
          b.vy *= s;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.a += b.om * dt;
        b.om *= Math.pow(0.92, dt * 60);
        if (Math.abs(b.vx) < 30 && Math.abs(b.vy) < 30) {
          b.vx *= 0.85;
          b.vy *= 0.85;
          b.om *= 0.85;
        }
      }
    };

    const loop = (now: number) => {
      raf = 0;
      const dtF = last === 0 ? 1 / 60 : Math.min(0.05, (now - last) / 1000);
      last = now;
      const bodies: Body[] = [];
      for (const b of bodiesRef.current.values()) if (!b.dead) bodies.push(b);

      if (W > 4 && H > 4 && bodies.length > 0) {
        active += dtF;
        acc = Math.min(acc + dtF, FIXED * 6);
        while (acc >= FIXED) {
          step(FIXED, bodies);
          acc -= FIXED;
        }
        for (const b of bodies) {
          const tx = b.x - b.hw;
          const ty = b.y - b.hh + (b.hovered ? -2 : 0);
          b.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${b.a.toFixed(4)}rad)`;
        }
      }

      const deadline = active > 4;
      let allAsleep = true;
      for (const b of bodies) {
        if (b.dragging) {
          allAsleep = false;
          continue;
        }
        if (b.asleep) continue;
        if (
          deadline ||
          b.age > 4 ||
          (!b.spring &&
            b.age > 2.5 &&
            Math.hypot(b.vx, b.vy) < 40 &&
            Math.abs(b.om) < 0.3)
        ) {
          b.spring = false;
          b.asleep = true;
          b.vx = 0;
          b.vy = 0;
          b.om = 0;
          b.invMass = 0;
          b.invI = 0;
          continue;
        }
        if (!b.spring && Math.hypot(b.vx, b.vy) < 8 && Math.abs(b.om) < 0.05) {
          b.calm++;
          if (b.calm >= 12) {
            b.asleep = true;
            b.vx = 0;
            b.vy = 0;
            b.om = 0;
            b.invMass = 0;
            b.invI = 0;
            continue;
          }
        } else {
          b.calm = 0;
        }
        allAsleep = false;
      }
      if (allAsleep) return;
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (raf === 0) {
        last = 0;
        active = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    
    const wake = () => {
      for (const b of bodiesRef.current.values()) {
        if (b.dead || b.dragging) continue;
        if (b.asleep) {
          b.asleep = false;
          b.invMass = b.baseInvMass;
          b.invI = b.baseInvI;
        }
        b.calm = 0;
        b.age = 0;
      }
      active = 0;
      kick();
    };
    wakeRef.current = wake;
    kickRef.current = kick;

    const ro = new ResizeObserver(() => {
      const rect = root.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      wake();
    });
    ro.observe(root);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      raf = -1;
      ro.disconnect();
      wakeRef.current = () => {};
      kickRef.current = () => {};
    };
  }, [reduced, gravity, restitution]);

  const hoverIn = useCallback(
    (id: string) => {
      pauseTimer(id);
      const b = bodiesRef.current.get(id);
      if (b && !b.dead) {
        b.hovered = true;
        b.el.style.boxShadow = shadowRef.current;
        kickRef.current();
      }
    },
    [pauseTimer],
  );

  const hoverOut = useCallback(
    (id: string) => {
      resumeTimer(id);
      const b = bodiesRef.current.get(id);
      if (b && !b.dead) {
        b.hovered = false;
        b.el.style.boxShadow = restShadowRef.current;
        kickRef.current();
      }
    },
    [resumeTimer],
  );

  const beginDrag = useCallback(
    (id: string, e: ReactPointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const b = bodiesRef.current.get(id);
      if (!b || b.dead) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      b.dragging = true;
      b.asleep = false;
      b.calm = 0;
      b.spring = false;
      b.dragPX = e.clientX;
      b.dragX0 = b.x;
      b.dragLastX = e.clientX;
      b.dragLastT = performance.now();
      b.dragVX = 0;
      b.invMass = 0;
      b.invI = 0;
      b.vx = 0;
      b.vy = 0;
      b.om = 0;
      kickRef.current();
    },
    [],
  );

  const moveDrag = useCallback(
    (id: string, e: ReactPointerEvent<HTMLDivElement>) => {
      const b = bodiesRef.current.get(id);
      if (!b || !b.dragging || b.dead) return;
      b.x = b.dragX0 + Math.max(-24, e.clientX - b.dragPX);
      const now = performance.now();
      const dt = (now - b.dragLastT) / 1000;
      if (dt > 0.001) b.dragVX = ((e.clientX - b.dragLastX) / dt) * 0.6;
      b.dragLastX = e.clientX;
      b.dragLastT = now;
      kickRef.current();
    },
    [],
  );

  const endDrag = useCallback(
    (id: string, cancelled: boolean) => {
      const b = bodiesRef.current.get(id);
      if (!b || !b.dragging) return;
      b.dragging = false;
      b.invMass = b.baseInvMass;
      b.invI = b.baseInvI;
      const dx = b.x - b.dragX0;
      if (!cancelled && dx > 80) {
        dismiss(id);
      } else {
        b.spring = true;
        b.anchorX = b.dragX0;
        b.vx = b.dragVX * 0.3;
      }
      wakeRef.current();
    },
    [dismiss],
  );

  if (reduced) {
    return (
      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        className={`relative overflow-y-auto pointer-events-none ${className}`}
      >
        <div className="flex flex-col gap-2 p-3 pointer-events-none">
          {[...toasts].reverse().map((t) => (
            <ReducedCard
              key={t.id}
              toast={t}
              exiting={exiting.has(t.id)}
              onDismiss={() => dismiss(t.id)}
              onEnter={() => pauseTimer(t.id)}
              onLeave={() => resumeTimer(t.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={`relative overflow-hidden pointer-events-none ${className}`}
    >
      <div
        ref={containerRef}
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: `calc(100% - ${FLOOR_INSET}px)` }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            ref={(el) => attach(t, el)}
            role={t.severity === "error" ? "alert" : "status"}
            onPointerDown={(e) => beginDrag(t.id, e)}
            onPointerMove={(e) => moveDrag(t.id, e)}
            onPointerUp={() => endDrag(t.id, false)}
            onPointerCancel={() => endDrag(t.id, true)}
            onPointerEnter={() => hoverIn(t.id)}
            onPointerLeave={() => hoverOut(t.id)}
            className="pointer-events-auto absolute left-0 top-0 w-72 max-w-[calc(100%-16px)] cursor-grab touch-pan-y select-none rounded-2xl border border-ink/10 bg-white shadow-md transition-opacity duration-150 will-change-transform"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: RAIL[t.severity],
              transform: "translate3d(-200%, -200%, 0)",
            }}
          >
            <CardInner toast={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default SedimentStack;