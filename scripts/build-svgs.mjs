// Generates the animated SVGs used by the profile README.
//   node scripts/build-svgs.mjs
// Everything is plain SVG + SMIL (no JS), so it animates inside GitHub's <img> sandbox.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(OUT, { recursive: true });

const THEMES = {
  dark:  { bg: "#0b0b0b", ink: "#efefef", mute: "#8a8a8a", faint: "#2a2a2a", border: "#1f1f1f" },
  light: { bg: "#ffffff", ink: "#121314", mute: "#5a6065", faint: "#e3e6ea", border: "#e3e6ea" },
};

/* ---------- deterministic noise ---------- */
function hash2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, y) => 0.5 * noise2(x, y) + 0.25 * noise2(x * 2.1, y * 2.1) + 0.125 * noise2(x * 4.3, y * 4.3);
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const f = (n, d = 2) => Number(n.toFixed(d)).toString();
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const SERIF = "Georgia, 'Times New Roman', 'Playfair Display', serif";

/* ====================================================================
   Astronaut with a straw hat. Drawn in a 100 x 150 box, feet at y=150,
   centred on x=50. `wave` adds the arm-waving animation.
   ==================================================================== */
function astronaut(t, { wave = true } = {}) {
  const s = `stroke="${t.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  const armWave = wave
    ? `<animateTransform attributeName="transform" type="rotate" values="0 72 78;-28 72 78;0 72 78;-28 72 78;0 72 78;0 72 78" keyTimes="0;0.12;0.24;0.36;0.48;1" dur="4.6s" repeatCount="indefinite"/>`
    : "";
  return `
  <g fill="${t.bg}" ${s}>
    <rect x="22" y="62" width="56" height="52" rx="10" fill="${t.faint}"/>
    <path d="M38 108 L36 142 Q36 148 42 148 L50 148 L50 108 Z"/>
    <path d="M62 108 L64 142 Q64 148 58 148 L50 148 L50 108 Z"/>
    <rect x="30" y="66" width="40" height="46" rx="12"/>
    <rect x="40" y="78" width="20" height="12" rx="3" fill="${t.ink}" stroke="none"/>
    <circle cx="44" cy="97" r="2" fill="${t.ink}" stroke="none"/>
    <circle cx="52" cy="97" r="2" fill="${t.ink}" stroke="none"/>
    <path d="M32 72 L20 100 Q18 106 24 108 L30 108"/>
    <g>
      ${armWave}
      <path d="M70 76 L84 56 L90 50"/>
      <circle cx="94" cy="46" r="6"/>
    </g>
    <circle cx="50" cy="44" r="24"/>
    <path d="M34 42 Q34 26 50 26 Q66 26 66 42 Q66 56 50 56 Q34 56 34 42 Z" fill="${t.ink}" stroke="none"/>
    <path d="M40 36 Q46 30 56 32" stroke="${t.bg}" stroke-width="2.5" fill="none" opacity="0.7"/>
    <path d="M12 26 Q50 14 88 26 Q50 36 12 26 Z" fill="url(#straw)"/>
    <path d="M30 24 Q32 6 50 6 Q68 6 70 24 Z" fill="url(#straw)"/>
    <path d="M30 24 Q50 29 70 24" stroke-width="4" fill="none"/>
  </g>`;
}

const strawPattern = (t) => `
  <pattern id="straw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <rect width="6" height="6" fill="${t.bg}"/>
    <line x1="0" y1="0" x2="0" y2="6" stroke="${t.ink}" stroke-width="1.6" opacity="0.55"/>
  </pattern>`;

/* Straw Hat jolly roger flag. Pole base at (0,0), pole goes up 104. */
function flag(t) {
  const s = `stroke="${t.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  const a = "M0 -104 Q25 -111 50 -104 T100 -104 L100 -42 Q75 -35 50 -42 T0 -42 Z";
  const b = "M0 -104 Q25 -97 50 -104 T100 -104 L100 -42 Q75 -49 50 -42 T0 -42 Z";
  return `
  <g ${s}>
    <line x1="0" y1="0" x2="0" y2="-108"/>
    <circle cx="0" cy="-108" r="2.5" fill="${t.ink}"/>
    <path d="${a}" fill="${t.bg}">
      <animate attributeName="d" values="${a};${b};${a}" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </path>
    <!-- jolly roger -->
    <g transform="translate(50,-74) scale(1.3)" stroke-width="1.8">
      <!-- crossbones -->
      <g stroke-width="3">
        <line x1="-18" y1="-11" x2="18" y2="13"/>
        <line x1="18" y1="-11" x2="-18" y2="13"/>
      </g>
      <g fill="${t.ink}" stroke="none">
        <circle cx="-19" cy="-12.5" r="2.2"/><circle cx="-16.5" cy="-9.5" r="2.2"/>
        <circle cx="19" cy="-12.5" r="2.2"/><circle cx="16.5" cy="-9.5" r="2.2"/>
        <circle cx="-19" cy="14.5" r="2.2"/><circle cx="-16.5" cy="11.5" r="2.2"/>
        <circle cx="19" cy="14.5" r="2.2"/><circle cx="16.5" cy="11.5" r="2.2"/>
      </g>
      <!-- skull -->
      <rect x="-6.5" y="5" width="13" height="7" rx="2" fill="${t.bg}"/>
      <circle cx="0" cy="-1" r="10.5" fill="${t.bg}"/>
      <g stroke-width="1.2">
        <line x1="-3.2" y1="7" x2="-3.2" y2="11.5"/>
        <line x1="0" y1="7.5" x2="0" y2="11.8"/>
        <line x1="3.2" y1="7" x2="3.2" y2="11.5"/>
      </g>
      <g fill="${t.ink}" stroke="none">
        <ellipse cx="-4.2" cy="-1" rx="2.8" ry="3.2"/>
        <ellipse cx="4.2" cy="-1" rx="2.8" ry="3.2"/>
        <path d="M-1.4 4.6 L0 2 L1.4 4.6 Z"/>
      </g>
      <!-- straw hat -->
      <path d="M-9.5 -9.5 Q-9 -19.5 0 -19.5 Q9 -19.5 9.5 -9.5 Z" fill="${t.bg}"/>
      <path d="M-17 -8.5 Q0 -12.5 17 -8.5 Q0 -4.5 -17 -8.5 Z" fill="${t.bg}"/>
      <path d="M-9.3 -11.5 Q0 -9.5 9.3 -11.5" stroke-width="2.6" fill="none"/>
    </g>
  </g>`;
}

function stars(t, n, W, H, avoid) {
  let out = "";
  let made = 0;
  while (made < n) {
    const x = rnd() * W, y = rnd() * H;
    if (avoid(x, y)) continue;
    const r = 0.6 + rnd() * 1.1;
    const o = 0.25 + rnd() * 0.6;
    const dur = 2 + rnd() * 4;
    const begin = -(rnd() * dur);
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${t.ink}" opacity="${f(o)}"><animate attributeName="opacity" values="${f(o)};${f(Math.min(1, o + 0.5))};${f(o * 0.3)};${f(o)}" dur="${f(dur)}s" begin="${f(begin)}s" repeatCount="indefinite"/></circle>\n`;
    made++;
  }
  return out;
}

/* Halftone moon. Dots carry light on dark, ink on light. */
function moon(t, cx, cy, R, mode) {
  const cell = 6.2;
  const L = [-0.55, -0.62, 0.56];
  const ln = Math.hypot(...L); L[0] /= ln; L[1] /= ln; L[2] /= ln;
  const craters = [
    [-0.42, -0.18, 0.2], [0.3, 0.38, 0.17], [0.52, -0.3, 0.12], [-0.1, 0.62, 0.11],
    [-0.65, 0.35, 0.1], [0.12, -0.52, 0.09], [0.72, 0.1, 0.08], [-0.25, 0.15, 0.07],
  ];
  let out = "";
  let row = 0;
  for (let gy = cy - R; gy <= cy + R; gy += cell, row++) {
    const rowOff = (row % 2) * cell * 0.5;
    for (let gx = cx - R - cell; gx <= cx + R + cell; gx += cell) {
      const x = gx + rowOff, y = gy;
      const nx = (x - cx) / R, ny = (y - cy) / R;
      const rr = nx * nx + ny * ny;
      if (rr > 1) continue;
      const nz = Math.sqrt(1 - rr);
      let b = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      b = 0.06 + 0.94 * Math.pow(b, 0.85);
      for (const [ux, uy, ur] of craters) {
        const d = Math.hypot(nx - ux, ny - uy) / ur;
        if (d < 1) b *= 0.5 + 0.5 * d * d;
        else if (d < 1.18) {
          const facing = Math.max(0, -(nx - ux) * L[0] - (ny - uy) * L[1]) * 2;
          b = Math.min(1, b + 0.18 * (1 - (d - 1) / 0.18) * (0.3 + 0.7 * facing));
        }
      }
      b *= 0.82 + 0.36 * fbm(nx * 5 + 3, ny * 5 + 7);
      b = Math.min(1, Math.max(0, b));
      const edge = Math.min(1, (1 - Math.sqrt(rr)) * 14);
      const v = mode === "light-dots" ? b : 1 - b;
      const r = (0.25 + 2.65 * v) * (0.6 + 0.4 * edge);
      if (r < 0.3) continue;
      out += `<circle cx="${f(x, 1)}" cy="${f(y, 1)}" r="${f(r, 2)}"/>`;
    }
    out += "\n";
  }
  return `<g fill="${t.ink}">\n${out}</g>`;
}

/* Typewriter: roles typed one after another, with a cursor that follows. */
function typewriter(t, roles, { x, y, fontSize = 22, charW = 13.2, type = 0.07, del = 0.035, hold = 1.7, gap = 0.5 }) {
  const events = []; // [time, roleIndex, width]
  let time = 0.8;
  for (let i = 0; i < roles.length; i++) {
    const n = roles[i].length;
    const start = time;
    for (let k = 1; k <= n; k++) events.push([start + k * type, i, k * charW]);
    time = start + n * type + hold;
    for (let k = 1; k <= n; k++) events.push([time + k * del, i, (n - k) * charW]);
    time = time + n * del + gap;
  }
  const cycle = time + 0.6;
  const kt = (s) => f(Math.min(1, s / cycle), 5);
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  let textNodes = "";
  roles.forEach((role, i) => {
    const mine = events.filter((e) => e[1] === i);
    const vals = ["0", ...mine.map((e) => f(e[2]))];
    const keys = ["0", ...mine.map((e) => kt(e[0]))];
    textNodes += `
    <clipPath id="tw${i}"><rect x="${x}" y="${y - fontSize}" width="0" height="${fontSize * 1.5}">
      <animate attributeName="width" calcMode="discrete" values="${vals.join(";")}" keyTimes="${keys.join(";")}" dur="${f(cycle)}s" repeatCount="indefinite"/>
    </rect></clipPath>
    <text x="${x}" y="${y}" clip-path="url(#tw${i})" font-family="${MONO}" font-size="${fontSize}" fill="${t.ink}" textLength="${f(role.length * charW)}" lengthAdjust="spacingAndGlyphs" xml:space="preserve">${esc(role)}</text>`;
  });
  const xs = ["0", ...events.map((e) => f(e[2]))];
  const keys = ["0", ...events.map((e) => kt(e[0]))];
  const cursor = `
    <rect x="${x}" y="${y - fontSize + 2}" width="${f(charW * 0.75)}" height="${fontSize + 2}" fill="${t.ink}">
      <animateTransform attributeName="transform" type="translate" calcMode="discrete" values="${xs.map((v) => v + " 0").join(";")}" keyTimes="${keys.join(";")}" dur="${f(cycle)}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>
    </rect>`;
  return { textNodes, cursor };
}

/* ====================================================================
   BANNER  1200 x 400
   ==================================================================== */
function banner(themeName) {
  const t = THEMES[themeName];
  const W = 1200, H = 400;
  const MX = 930, MY = 248, MR = 138;
  seed = 7;
  const avoid = (x, y) =>
    (x < 660 && y > 70 && y < 350) ||
    Math.hypot(x - MX, y - MY) < MR + 10 ||
    (x > MX - 60 && x < MX + 90 && y < MY - MR + 10);

  const roles = [
    "backend-focused full-stack engineer",
    "contributing to open source",
    "building backends that scale",
    "still searching for the One Piece",
  ];
  const tw = typewriter(t, roles, { x: 92, y: 258 });

  // Orbit: the rocket passes BEHIND the moon on the top half and IN FRONT on the bottom half.
  const orbit = `M ${MX - 230} ${MY} A 230 70 0 0 1 ${MX + 230} ${MY} A 230 70 0 0 1 ${MX - 230} ${MY}`;
  const rocketShape = `
    <g transform="rotate(90)">
      <path d="M0 -14 Q7 -4 7 6 L-7 6 Q-7 -4 0 -14 Z" fill="${t.bg}" stroke="${t.ink}" stroke-width="2"/>
      <path d="M-7 2 L-11 10 L-7 6 Z M7 2 L11 10 L7 6 Z" fill="${t.ink}"/>
      <circle cx="0" cy="-2" r="2.2" fill="${t.ink}"/>
      <path d="M-3 7 L0 15 L3 7 Z" fill="${t.ink}" opacity="0.8">
        <animate attributeName="d" values="M-3 7 L0 15 L3 7 Z;M-3 7 L0 21 L3 7 Z;M-3 7 L0 15 L3 7 Z" dur="0.3s" repeatCount="indefinite"/>
      </path>
    </g>`;
  // The path starts at the left of the moon and sweeps over the TOP first (far side, drawn
  // behind the moon, slightly smaller), then returns along the BOTTOM (near side, in front).
  const rocket = (phase) => `
    <g opacity="${phase === "back" ? 1 : 0}">
      <animate attributeName="opacity" calcMode="discrete" values="${phase === "back" ? "1;0" : "0;1"}" keyTimes="0;0.5" dur="16s" repeatCount="indefinite"/>
      <g>
        <animateMotion dur="16s" repeatCount="indefinite" rotate="auto" path="${orbit}" calcMode="linear"/>
        <g transform="scale(${phase === "back" ? 0.78 : 1.05})">${rocketShape}</g>
      </g>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Yugendhra E, backend developer. A halftone moon with an astronaut in a straw hat planting a flag.">
  <defs>
    ${strawPattern(t)}
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="${t.bg}"/>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${t.border}"/>

    ${stars(t, 90, W, H, avoid)}

    <g opacity="0">
      <animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;0.62;0.66;0.72;1" dur="11s" repeatCount="indefinite"/>
      <line x1="0" y1="0" x2="-60" y2="30" stroke="${t.ink}" stroke-width="1.5" stroke-linecap="round" opacity="0.8">
        <animateMotion dur="11s" repeatCount="indefinite" path="M 700 40 L 860 120" keyTimes="0;0.62;0.72;1" keyPoints="0;0;1;1" calcMode="linear"/>
      </line>
    </g>

    <ellipse cx="${MX}" cy="${MY}" rx="230" ry="70" fill="none" stroke="${t.ink}" stroke-width="1" stroke-dasharray="2 7" opacity="0.28"/>
    ${rocket("back")}

    ${moon(t, MX, MY, MR, themeName === "dark" ? "light-dots" : "ink-dots")}

    <g transform="translate(${MX + 30}, ${MY - MR + 6})">${flag(t)}</g>
    <g transform="translate(${MX - 52}, ${MY - MR + 4 - 84}) scale(0.56)">${astronaut(t, { wave: true })}</g>

    ${rocket("front")}

    <text x="92" y="128" font-family="${MONO}" font-size="15" fill="${t.mute}" letter-spacing="2">y9ndra  ·  CHENNAI, IN  ·  13.08°N 80.27°E</text>
    <text x="90" y="200" font-family="${SERIF}" font-size="66" fill="${t.ink}" letter-spacing="-1">Yugendhra E</text>
    <text x="64" y="258" font-family="${MONO}" font-size="22" fill="${t.mute}">&gt;</text>
    ${tw.textNodes}
    ${tw.cursor}

  </g>
</svg>`;
}

/* ====================================================================
   FLOATING ASTRONAUT  320 x 360  (sits beside the About section)
   ==================================================================== */
function floating(themeName) {
  const t = THEMES[themeName];
  const W = 320, H = 360;
  seed = 42;
  const avoid = (x, y) => Math.hypot(x - 160, y - 190) < 120;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="An astronaut wearing a straw hat, floating and waving.">
  <defs>${strawPattern(t)}</defs>
  ${stars(t, 60, W, H, avoid)}
  <path d="M 40 350 C 90 320, 60 260, 118 232" fill="none" stroke="${t.ink}" stroke-width="2" stroke-dasharray="4 6" opacity="0.5">
    <animate attributeName="d" values="M 40 350 C 90 320, 60 260, 118 232;M 40 350 C 70 300, 90 270, 118 222;M 40 350 C 90 320, 60 260, 118 232" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
  </path>
  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 -12;0 0" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    <g transform="translate(92, 60) rotate(-8 50 75) scale(1.3)">${astronaut(t, { wave: true })}</g>
  </g>
  <circle r="3" fill="${t.ink}" opacity="0.8">
    <animateMotion dur="9s" repeatCount="indefinite" path="M 160 190 m -135 0 a 135 42 0 1 0 270 0 a 135 42 0 1 0 -270 0"/>
  </circle>
</svg>`;
}

/* ====================================================================
   QUOTE  900 x 90  (closing line, serif like the name in the banner)
   ==================================================================== */
function quote(themeName) {
  const t = THEMES[themeName];
  const label = "I don't want to conquer anything. The greatest person is the one with the most freedom.";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="96" viewBox="0 0 900 96" role="img" aria-label="${label}">
  <text x="450" y="40" text-anchor="middle" font-family="${SERIF}" font-size="22" fill="${t.ink}">I don't want to conquer anything.</text>
  <text x="450" y="74" text-anchor="middle" font-family="${SERIF}" font-size="22" fill="${t.ink}">The greatest person is the one with the most <tspan font-weight="700" letter-spacing="1.5">FREEDOM</tspan>.</text>
</svg>`;
}

for (const name of Object.keys(THEMES)) {
  writeFileSync(join(OUT, `banner-${name}.svg`), banner(name));
  writeFileSync(join(OUT, `astronaut-${name}.svg`), floating(name));
  writeFileSync(join(OUT, `quote-${name}.svg`), quote(name));
}
console.log("wrote", OUT);
