const preferenceKey = 'veijay-background-motion';
const maxTrail = 56;
const maxSparks = 8;
const maxWaves = 5;
const trailLife = .57;
const sparkLife = .38;
const waveLife = .8;
const colors = {
  violet: '168, 127, 255',
  blue: '106, 159, 255',
  cyan: '115, 228, 255',
};

interface Point {
  x: number;
  y: number;
}

interface TrailPoint extends Point {
  born: number;
  width: number;
}

interface Spark extends Point {
  born: number;
  dx: number;
  dy: number;
}

interface Wave extends Point {
  born: number;
  gradient: CanvasGradient;
}

function readPreference(): boolean | undefined {
  try {
    const stored = window.localStorage.getItem(preferenceKey);
    if (stored === 'on' || stored === 'off') return stored === 'on';
  } catch {
    // The control still works for this page when storage is unavailable.
  }
}

function makeGlow(color: string) {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 96;
  const ctx = sprite.getContext('2d');
  if (!ctx) return;

  const center = sprite.width / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, `rgba(${color}, 1)`);
  gradient.addColorStop(.27, `rgba(${color}, .62)`);
  gradient.addColorStop(.58, `rgba(${color}, .16)`);
  gradient.addColorStop(1, `rgba(${color}, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, sprite.width, sprite.height);
  return sprite;
}

function startBackground() {
  const canvasElement = document.querySelector<HTMLCanvasElement>('canvas[data-interactive-background]');
  const toggleButton = document.querySelector<HTMLButtonElement>('button[data-background-toggle]');
  const hint = document.querySelector<HTMLElement>('[data-background-hint]');
  if (!canvasElement || !toggleButton || typeof window.requestAnimationFrame !== 'function') return;

  const context = canvasElement.getContext('2d');
  if (!context) return;
  const canvas = canvasElement;
  const toggle = toggleButton;
  const ctx = context;
  const controller = new AbortController();
  const { signal } = controller;
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const violetGlow = makeGlow(colors.violet);
  const cyanGlow = makeGlow(colors.cyan);
  const target = { x: 0, y: 0, inside: false };
  const pointer = { x: 0, y: 0, opacity: 0, speed: 0, tracking: false };
  const trail: TrailPoint[] = [];
  const sparks: Spark[] = [];
  const waves: Wave[] = [];
  const ribbons = [
    { height: .25, phase: .8, tilt: -.13, color: colors.violet },
    { height: .54, phase: 2.9, tilt: .24, color: colors.cyan },
    { height: .78, phase: 4.5, tilt: -.16, color: colors.blue },
  ];
  let preference = readPreference();
  let enabled = preference ?? !motion?.matches;
  let width = 1;
  let height = 1;
  let frame = 0;
  let lastFrame = 0;
  let time = 0;
  let lastSpark = -sparkLife;
  let gradients: CanvasGradient[] = [];

  function drawGlow(sprite: HTMLCanvasElement | undefined, x: number, y: number, radius: number, opacity: number) {
    if (!sprite) return;
    ctx.globalAlpha = opacity;
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
  }

  function drawRibbons() {
    const amplitude = Math.min(height * .16, 116);

    for (const [index, ribbon] of ribbons.entries()) {
      const phase = ribbon.phase + time * .24;
      let previousX = 0;
      let previousY = 0;
      ctx.beginPath();

      for (let step = 0; step <= 34; step++) {
        const u = step / 34;
        const x = u * width;
        const center = height * (ribbon.height + ribbon.tilt * (u - .5))
          + Math.sin(u * 6.2 + phase) * amplitude
          + Math.cos(u * 11 - phase) * amplitude * .18;
        const dx = x - pointer.x;
        const dy = center - pointer.y;
        const falloff = Math.max(0, 1 - (dx * dx + dy * dy) / (210 * 210));
        const y = center - dy * falloff * falloff * pointer.opacity * .48;

        if (step === 0) ctx.moveTo(x, y);
        else ctx.quadraticCurveTo(previousX, previousY, (previousX + x) * .5, (previousY + y) * .5);
        previousX = x;
        previousY = y;
      }

      ctx.lineTo(previousX, previousY);
      ctx.strokeStyle = gradients[index];
      ctx.lineWidth = 17;
      ctx.globalAlpha = .07;
      ctx.stroke();
      ctx.lineWidth = 5;
      ctx.globalAlpha = .15;
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.globalAlpha = .34;
      ctx.stroke();
    }
  }

  function traceCurve(points: Point[]) {
    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const next = points[index];
      ctx.quadraticCurveTo(previous.x, previous.y, (previous.x + next.x) * .5, (previous.y + next.y) * .5);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  function drawTrail() {
    if (trail.length < 2) return;

    const first = trail[0];
    const headIndex = trail.length - 1;
    const head = trail[headIndex];
    const remaining = Math.max(0, 1 - (time - head.born) / trailLife);
    const left: Point[] = [];
    const right: Point[] = [];

    for (const [index, point] of trail.entries()) {
      const before = trail[Math.max(0, index - 1)];
      const after = trail[Math.min(headIndex, index + 1)];
      const dx = after.x - before.x;
      const dy = after.y - before.y;
      const length = Math.hypot(dx, dy);
      const ageFade = Math.max(0, 1 - (time - point.born) / trailLife);
      const taper = Math.min(1, index / 4) * (index === headIndex ? .52 : 1);
      const radius = point.width * ageFade ** 1.35 * taper;
      const nx = length > .01 ? -dy / length * radius : 0;
      const ny = length > .01 ? dx / length * radius : 0;
      left.push({ x: point.x + nx, y: point.y + ny });
      right.push({ x: point.x - nx, y: point.y - ny });
    }

    // On a loop, orient the color toward the incoming part of the path.
    const anchor = Math.hypot(head.x - first.x, head.y - first.y) < 18
      ? trail[Math.max(0, headIndex - 8)]
      : first;
    const gradient = ctx.createLinearGradient(anchor.x, anchor.y, head.x + .01, head.y);
    gradient.addColorStop(0, `rgba(${colors.violet}, .02)`);
    gradient.addColorStop(.28, `rgba(${colors.violet}, .68)`);
    gradient.addColorStop(.65, `rgba(${colors.blue}, .86)`);
    gradient.addColorStop(1, 'rgba(170, 245, 255, .98)');
    const intensity = remaining * (.74 + .26 * Math.min(1, pointer.speed / 1150));

    right.reverse();
    ctx.beginPath();
    ctx.moveTo(left[0].x, left[0].y);
    traceCurve(left);
    ctx.lineTo(right[0].x, right[0].y);
    traceCurve(right);
    ctx.closePath();

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 9;
    ctx.globalAlpha = intensity * .11;
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.globalAlpha = intensity * .25;
    ctx.stroke();
    ctx.fillStyle = gradient;
    ctx.globalAlpha = intensity * .8;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    traceCurve(trail);
    ctx.lineWidth = .85;
    ctx.globalAlpha = intensity * .64;
    ctx.stroke();
  }

  function drawSparks() {
    ctx.fillStyle = '#c4edff';
    for (const spark of sparks) {
      const age = time - spark.born;
      const remaining = Math.max(0, 1 - age / sparkLife);
      const x = spark.x + spark.dx * age;
      const y = spark.y + spark.dy * age;
      const size = .6 + remaining * 1.7;
      ctx.globalAlpha = remaining * remaining * .65;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 1.45);
      ctx.lineTo(x + size * .65, y);
      ctx.lineTo(x, y + size * 1.45);
      ctx.lineTo(x - size * .65, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawWaves() {
    for (const { x, y, born, gradient } of waves) {
      const progress = (time - born) / waveLife;
      const strength = (1 - progress) ** 2;
      const radius = 9 + 116 * (1 - (1 - progress) ** 3);
      drawGlow(violetGlow, x, y, radius * .95, strength * .16);
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * .88, -.26, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.globalAlpha = strength * .12;
      ctx.stroke();
      ctx.lineWidth = .8 + strength;
      ctx.globalAlpha = strength * .88;
      ctx.stroke();

      const echo = Math.max(0, (progress - .12) / .88);
      if (echo > 0) {
        const echoRadius = 9 + 100 * (1 - (1 - echo) ** 3);
        ctx.beginPath();
        ctx.ellipse(x, y, echoRadius, echoRadius * .88, -.26, 0, Math.PI * 2);
        ctx.lineWidth = .8;
        ctx.globalAlpha = strength * .34;
        ctx.stroke();
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const centerX = width * .72 + Math.sin(time * .27) * Math.min(width * .055, 32);
    const centerY = height * .42 + Math.cos(time * .21) * 12;
    const radius = Math.min(width * .39, height * .48, 390);
    drawGlow(violetGlow, centerX, centerY, radius, .25);
    drawGlow(cyanGlow, centerX + radius * .22, centerY + radius * .16, radius * .73, .14);
    drawRibbons();

    if (pointer.opacity > .01) {
      const energy = Math.min(1, pointer.speed / 1150);
      drawGlow(violetGlow, pointer.x, pointer.y, 151, (.09 + .14 * energy) * pointer.opacity);
      drawGlow(cyanGlow, pointer.x, pointer.y, 75, (.04 + .14 * energy) * pointer.opacity);
    }
    drawTrail();
    drawSparks();
    drawWaves();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function resize() {
    width = Math.max(1, canvas.clientWidth || window.innerWidth);
    height = Math.max(1, canvas.clientHeight || window.innerHeight);
    const scale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2_500_000 / (width * height)));
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    gradients = ribbons.map(({ color }) => {
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, `rgba(${color}, .04)`);
      gradient.addColorStop(.24, `rgba(${color}, .34)`);
      gradient.addColorStop(.67, `rgba(${color}, .61)`);
      gradient.addColorStop(1, `rgba(${color}, .06)`);
      return gradient;
    });
    draw();
  }

  function samplePointer(dt: number) {
    const opacityEase = 1 - Math.exp(-dt * 14);
    pointer.opacity += ((target.inside ? 1 : 0) - pointer.opacity) * opacityEase;
    if (!target.inside) {
      pointer.speed *= 1 - opacityEase;
      return;
    }

    if (!pointer.tracking) {
      pointer.x = target.x;
      pointer.y = target.y;
      pointer.speed = 0;
      pointer.tracking = true;
      trail.length = 0;
    }

    const follow = 1 - Math.exp(-dt * 32);
    const dx = (target.x - pointer.x) * follow;
    const dy = (target.y - pointer.y) * follow;
    pointer.x += dx;
    pointer.y += dy;
    pointer.speed += (Math.hypot(dx, dy) / dt - pointer.speed) * opacityEase;

    const last = trail[trail.length - 1];
    if (last && Math.hypot(pointer.x - last.x, pointer.y - last.y) < 2.4) return;
    const energy = Math.min(1, pointer.speed / 1150);
    trail.push({ x: pointer.x, y: pointer.y, born: time, width: 1.55 + energy * 4.75 });
    if (trail.length > maxTrail) trail.shift();

    if (energy > .22 && time - lastSpark > .073) {
      lastSpark = time;
      const side = sparks.length % 2 ? -1 : 1;
      const distance = Math.hypot(dx, dy) || 1;
      sparks.push({
        x: pointer.x,
        y: pointer.y,
        dx: (-dx - dy * side * .65) / distance * 36,
        dy: (-dy + dx * side * .65) / distance * 36 - 10,
        born: time,
      });
      if (sparks.length > maxSparks) sparks.shift();
    }
  }

  function tick(now: number) {
    frame = 0;
    if (!enabled || document.hidden) return;

    const dt = lastFrame ? Math.min(.045, Math.max(.001, (now - lastFrame) / 1000)) : 1 / 60;
    lastFrame = now;
    time += dt;
    while (trail.length && time - trail[0].born >= trailLife) trail.shift();
    while (sparks.length && time - sparks[0].born >= sparkLife) sparks.shift();
    while (waves.length && time - waves[0].born >= waveLife) waves.shift();
    samplePointer(dt);
    draw();

    frame = window.requestAnimationFrame(tick);
  }

  function leave() {
    target.inside = false;
    pointer.tracking = false;
  }

  function sync() {
    enabled = preference ?? !motion?.matches;
    toggle.setAttribute('aria-pressed', String(enabled));
    if (hint) hint.hidden = !enabled;

    if (!enabled || document.hidden) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      leave();
      pointer.opacity = 0;
      trail.length = 0;
      sparks.length = 0;
      waves.length = 0;
      if (!enabled) {
        time = 0;
        lastSpark = -sparkLife;
      }
      if (!document.hidden) draw();
    } else if (!frame) {
      frame = window.requestAnimationFrame(tick);
    }
  }

  function move(event: PointerEvent) {
    if (!enabled || document.hidden || !event.isPrimary) return;
    target.x = event.clientX;
    target.y = event.clientY;
    target.inside = true;
  }

  function click(event: MouseEvent) {
    if (!enabled || document.hidden || event.button !== 0 || event.detail === 0) return;
    if (event.composedPath().some((target) => target instanceof Element && target.matches(
      'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [contenteditable]',
    ))) return;

    const x = event.clientX;
    const y = event.clientY;
    const gradient = ctx.createLinearGradient(x - 95, y + 92, x + 95, y - 92);
    gradient.addColorStop(0, '#ae8eff');
    gradient.addColorStop(.53, '#b5c4ff');
    gradient.addColorStop(1, '#adf5ff');
    waves.push({ x, y, born: time, gradient });
    if (waves.length > maxWaves) waves.shift();
  }

  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    preference = !enabled;
    try {
      window.localStorage.setItem(preferenceKey, preference ? 'on' : 'off');
    } catch {
      // Keep the in-memory preference for the current page.
    }
    sync();
  }, { signal });

  const passive = { signal, passive: true };
  window.addEventListener('pointermove', move, passive);
  window.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') move(event);
  }, passive);
  window.addEventListener('pointerup', (event) => {
    if (event.isPrimary && event.pointerType !== 'mouse') leave();
  }, passive);
  window.addEventListener('pointercancel', (event) => {
    if (event.isPrimary) leave();
  }, passive);
  window.addEventListener('pointerout', (event) => {
    if (event.isPrimary && !event.relatedTarget) leave();
  }, passive);
  window.addEventListener('pointerleave', leave, passive);
  window.addEventListener('blur', leave, { signal });
  window.addEventListener('click', click, passive);
  window.addEventListener('resize', resize, passive);
  document.addEventListener('visibilitychange', sync, { signal });
  motion?.addEventListener?.('change', sync, { signal });

  resize();
  sync();

  return () => {
    controller.abort();
    window.cancelAnimationFrame(frame);
  };
}

if (typeof window !== 'undefined') {
  const lifetime = new AbortController();
  let stop = startBackground();
  window.addEventListener('pagehide', (event) => {
    stop?.();
    stop = undefined;
    if (!event.persisted) lifetime.abort();
  }, { signal: lifetime.signal });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && !stop) stop = startBackground();
  }, { signal: lifetime.signal });
  import.meta.hot?.dispose(() => {
    stop?.();
    lifetime.abort();
  });
}
