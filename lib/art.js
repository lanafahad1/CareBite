// Generated food illustrations. Each recipe has an `art` spec (vessel, base,
// items) and is drawn as a small table scene in CareBite's outlined
// illustration style. If a real photograph is listed in photos.js it is used instead.
//
// Output is deterministic: the same meal always gives the same SVG (seeded from
// the id, no Math.random or Date) and every number is rounded to one decimal,
// so server and browser render identical markup.

import { PHOTOS, HERO_PHOTO } from './photos.js';

const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const f = (n) => Math.round(n * 10) / 10;

// Soft botanical leaf used by botanical() and teamPortrait().
const leaf = (x, y, s, r, c1 = '#7DB57C', c2 = '#5E9A60') => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${f(s)})"><path d="M0 -9 C7 -6 7 6 0 9 C-7 6 -7 -6 0 -9Z" fill="${c1}"/><path d="M0 -8 L0 8" stroke="${c2}" stroke-width="1" fill="none"/></g>`;

// ---------------------------------------------------------------- outlined style
// Same look as the spot illustrations (lib/illustrations.ts): thick sage-deep
// outlines, flat fills, soft round shapes behind and small plus-sparkles.
const OL = '#3F5646';
const VSW = 2.6; // vessel outline
const ISW = 1.7; // item outline
// Stroke multiplier while a dish is drawn scaled down to make room for sides,
// so outlines keep their weight. Set per scene; rendering is synchronous.
let SWK = 1;
const sw = (w) => f(w * SWK);
const PAL = { white: '#FFFFFF', blush: '#FFF1F4', rose: '#FBE1E6', pink: '#F6C9D2', pinkDeep: '#EDB3C0', mint: '#E8F3E8', sage: '#D6E8D5', primary: '#526B59', plum: '#7A3E50', bg: '#FFF9F7', border: '#EDE5E5' };

// category → [table colour, big round shape, second shape, small shape]
const SCENE = {
  breakfast: [PAL.blush, PAL.rose, PAL.mint, PAL.sage],
  lunch: [PAL.mint, PAL.sage, PAL.blush, PAL.rose],
  dinner: [PAL.bg, PAL.rose, PAL.mint, PAL.blush],
  snack: [PAL.bg, PAL.mint, PAL.blush, PAL.rose],
};

// Food surfaces: flat fill plus a texture drawn by texture().
const BASES = {
  oats: { fill: '#EBDCC2', c: '#D2B98E', c2: '#F8EEDB', tex: 'flakes' },
  'tomato-sauce': { fill: '#EE9A86', c: '#D9705C', oil: '#F4C46A', tex: 'sauce' },
  'beans-brown': { fill: '#CDA582', c: '#A87C55', c2: '#BD936B', tex: 'beans' },
  yogurt: { fill: '#FFFDF9', c: '#EFE6DA', tex: 'swirl' },
  'tofu-scramble': { fill: '#F3DC93', c: '#E0BE5E', c2: '#FAEBB8', tex: 'curds' },
  quinoa: { fill: '#F0E3C8', c: '#D6BE90', c2: '#FFFDF6', tex: 'seeds' },
  'soup-orange': { fill: '#F4B98C', c: '#E89A62', oil: '#F8D77E', tex: 'soup' },
  greens: { fill: '#C6E0B8', c: '#A9CF98', tex: 'leaves' },
  'rice-brown': { fill: '#E4D2B2', c: '#BFA272', c2: '#F8EFDE', spice: '#9C6B3E', tex: 'rice' },
  noodles: { fill: '#F6EBCF', c: '#DCC28C', c2: '#FBF3DE', tex: 'strands' },
  herbs: { fill: '#CBE5BC', c: '#A9D198', tex: 'leaves' },
  chili: { fill: '#D68A74', c: '#B9634D', chunk: '#A8644C', oil: '#EDB25A', tex: 'stew' },
  curry: { fill: '#EFC572', c: '#DDA344', oil: '#F8DC8E', tex: 'soup' },
  'rice-spiced': { fill: '#F1D38F', c: '#D3A54E', c2: '#FDF1D2', spice: '#C9553E', tex: 'rice' },
  pasta: { fill: '#EFD9AA', c: '#D3B272', c2: '#F8E8C4', tex: 'strands' },
  couscous: { fill: '#F2E0B4', c: '#D8BA7A', c2: '#FBF0D2', tex: 'grains' },
  bulgur: { fill: '#E6D0A2', c: '#C4A266', c2: '#F3E4C2', tex: 'grains' },
  chia: { fill: '#EEE8E2', c: '#5B5452', tex: 'specks' },
  'smoothie-tan': { fill: '#EED8BC', c: '#DEC29E', tex: 'bubbles' },
  jareesh: { fill: '#F1E7D4', c: '#D6C29C', c2: '#FBF5EA', pool: '#F4D27C', tex: 'porridge' },
  saleeg: { fill: '#FAF4E8', c: '#E3D3B0', c2: '#FFFFFF', tex: 'creamy' },
  'stew-red': { fill: '#DE977B', c: '#C4704F', chunk: '#B77A5A', oil: '#F0BE62', tex: 'stew' },
  porridge: { fill: '#EEE1CA', c: '#D7C29E', c2: '#F8F0E2', pool: '#F4D27C', tex: 'porridge' },
  'rice-yellow': { fill: '#F6E3B4', c: '#DDB565', c2: '#FFF9EA', spice: '#E9A23B', tex: 'rice' },
  laban: { fill: '#FCFBF7', c: '#A9B48C', tex: 'specks' }, // cardamom
  // a flatbread (lahouh) served on a plate
  bread: { fill: '#F0D7A4', c: '#D9B477', c2: '#E5C185', tex: 'bread' },
  none: null,
};
// Hot dishes get rising steam.
const HOT_BASES = new Set(['tomato-sauce', 'beans-brown', 'tofu-scramble', 'soup-orange', 'rice-brown', 'chili', 'curry', 'rice-spiced', 'pasta', 'couscous', 'bulgur', 'jareesh', 'saleeg', 'stew-red', 'porridge', 'rice-yellow']);
const HOT_ITEMS = new Set(['salmon', 'chicken-breast', 'fish-white', 'fish-red', 'egg-fried', 'stuffed-pepper']);
const COLD_ID = /salad|parfait|overnight|pudding|smoothie|hummus/;

// ---------------------------------------------------------------- path helpers
const P = (x, y) => `${f(x)} ${f(y)}`;
const circ = (x, y, a) => `M${P(x - a, y)}a${f(a)} ${f(a)} 0 1 0 ${f(2 * a)} 0a${f(a)} ${f(a)} 0 1 0 ${f(-2 * a)} 0`;
const ell = (x, y, a, b, rot) => { const c = Math.cos(rot); const s = Math.sin(rot); const d = f(rot * 180 / Math.PI); return `M${P(x - c * a, y - s * a)}A${f(a)} ${f(b)} ${d} 1 0 ${P(x + c * a, y + s * a)}A${f(a)} ${f(b)} ${d} 1 0 ${P(x - c * a, y - s * a)}`; };
const grain = (x, y, a, L) => { const c = Math.cos(a) * L / 2; const s = Math.sin(a) * L / 2; return `M${P(x - c, y - s)}q${f(c + s * .6)} ${f(s - c * .6)} ${f(2 * c)} ${f(2 * s)}`; };
const arcAt = (cx, cy, rx, ry, a0, a1) => `M${P(cx + Math.cos(a0) * rx, cy + Math.sin(a0) * ry)}A${f(rx)} ${f(ry)} 0 0 1 ${P(cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry)}`;
const quad = (x, y, a, rot) => { let d = ''; for (let i = 0; i < 4; i++) { const t = rot + i * Math.PI / 2 + Math.PI / 4; d += `${i ? 'L' : 'M'}${P(x + Math.cos(t) * a, y + Math.sin(t) * a)}`; } return `${d}Z`; };
const path = (d, attrs) => (d ? `<path d="${d}" ${attrs}/>` : '');

/** Points inside an ellipse at least `md` apart (fewer when it is full). */
function spread(r, n, cx, cy, rx, ry, md, k = .8) {
  const out = [];
  for (let t = 0; out.length < n && t < n * 30; t++) {
    const a = r() * Math.PI * 2; const d = Math.sqrt(r()) * k;
    const x = cx + Math.cos(a) * d * rx; const y = cy + Math.sin(a) * d * ry;
    if (out.every(([px, py]) => Math.hypot(px - x, py - y) >= md)) out.push([x, y]);
  }
  return out;
}

// ---------------------------------------------------------------- item shapes (local units, centred on 0,0)
// Each takes a variant number so repeated pieces can differ a little.
const n1 = (v) => f(v);
const ball = (r, fill, hi) => `<circle r="${r}" fill="${fill}"/>${hi ? `<circle cx="${n1(-r * .36)}" cy="${n1(-r * .36)}" r="${n1(r * .3)}" fill="${hi}" stroke="none"/>` : ''}`;
const ring = (r, skin, flesh, core) => `<circle r="${r}" fill="${skin}"/><circle r="${n1(r * .72)}" fill="${flesh}" stroke="none"/>${core ? `<circle r="${n1(r * .3)}" fill="${core}" stroke="none"/>` : ''}`;
const cube = (a, fill) => `<rect x="${n1(-a / 2)}" y="${n1(-a / 2)}" width="${a}" height="${a}" rx="${n1(a * .26)}" fill="${fill}"/>`;
const bean = (rx, ry, fill, hi) => `<ellipse rx="${rx}" ry="${ry}" fill="${fill}"/>${hi ? `<ellipse cx="${n1(-rx * .3)}" cy="${n1(-ry * .3)}" rx="${n1(rx * .3)}" ry="${n1(ry * .24)}" fill="${hi}" stroke="none"/>` : ''}`;
const stick = (w, l, fill) => `<rect x="${n1(-w / 2)}" y="${n1(-l / 2)}" width="${w}" height="${l}" rx="${n1(w / 2)}" fill="${fill}"/>`;
const leafShape = (len, fill) => `<path d="M${n1(-len / 2)} 0C${n1(-len * .2)} ${n1(-len * .36)} ${n1(len * .2)} ${n1(-len * .36)} ${n1(len / 2)} 0C${n1(len * .2)} ${n1(len * .36)} ${n1(-len * .2)} ${n1(len * .36)} ${n1(-len / 2)} 0ZM${n1(-len * .34)} 0H${n1(len * .18)}" fill="${fill}"/>`;
// leaf with side veins (for leaves of 12 units and longer)
const leafV = (len, fill, vein) => `${leafShape(len, fill)}<path d="M${n1(-len * .14)} 0l${n1(len * .12)} ${n1(-len * .15)}M${n1(-len * .14)} 0l${n1(len * .12)} ${n1(len * .15)}M${n1(len * .06)} 0l${n1(len * .1)} ${n1(-len * .11)}M${n1(len * .06)} 0l${n1(len * .1)} ${n1(len * .11)}" stroke="${vein}" stroke-width="1"/>`;
const crescent = (w, fill, hi) => `<path d="M${-w} 2C${n1(-w * .7)} ${n1(-w * .8)} ${n1(w * .7)} ${n1(-w * .8)} ${w} 2C${n1(w * .5)} ${n1(-w * .24)} ${n1(-w * .5)} ${n1(-w * .24)} ${-w} 2Z" fill="${fill}"/>${hi ? `<path d="M${n1(-w * .5)} -1.6Q0 ${n1(-w * .5)} ${n1(w * .5)} -1.6" stroke="${hi}" stroke-width="1.2"/>` : ''}`;
const halfDisc = (r, rind, flesh, pith) => `<path d="M${-r} 0A${r} ${r} 0 0 1 ${r} 0Z" fill="${rind}"/><path d="M${n1(-r * .74)} -.8A${n1(r * .74)} ${n1(r * .74)} 0 0 1 ${n1(r * .74)} -.8Z" fill="${pith}" stroke="none"/><path d="M${n1(-r * .62)} -1.2A${n1(r * .62)} ${n1(r * .62)} 0 0 1 ${n1(r * .62)} -1.2Z" fill="${flesh}" stroke="none"/><path d="M0-1V${n1(-r * .56)}M0-1L${n1(-r * .44)} ${n1(-r * .36)}M0-1L${n1(r * .44)} ${n1(-r * .36)}" stroke="${pith}" stroke-width="1.1"/>`;
const FILLET = 'M-24 3C-24-10-6-14 12-11C24-9 27 4 20 9C10 16-24 17-24 3Z';
const wedge = (d, fill) => `<path d="${d}" fill="${fill}"/>`;
const dots = (d, c, w = 1.4) => `<path d="${d}" stroke="${c}" stroke-width="${w}"/>`;

const ITEMS = {
  blueberry: () => `${ball(4.2, '#7385BB', '#AAB7DE')}<path d="M1 1.6h1.6" stroke="#4E5F95" stroke-width="1"/>`,
  strawberry: () => `<path d="M0 7C-7 3-7-4-3-5.6C-1-6.2 1-6.2 3-5.6C7-4 7 3 0 7Z" fill="#EC7B88"/><path d="M-4-5.4L0-8.4L4-5.4" fill="#86BB7A" stroke-width="1.2"/>${dots('M-2.6-2v.1M2.2-1v.1M0 3v.1M-2.6 1.6v.1M2.6 2.4v.1M0-.4v.1', '#FBE3A0')}`,
  raspberry: () => `${ball(4.6, '#E47790')}${dots('M-2-1.6v.1M2-2v.1M0 1.8v.1M-2.6 1.6v.1M2.6 1.2v.1M0-3v.1', '#F4AABA')}`,
  mint: () => leafV(12, '#A3D09A', '#6FA868'),
  herb: () => leafShape(9, '#93C68A'),
  basil: () => leafV(13, '#7DB878', '#5A9656'),
  spinach: () => leafV(16, '#7DB474', '#5A9452'),
  'egg-fried': () => `<path d="M-12-3C-12-11-4-13 2-11C9-13 14-7 12-1C14 6 8 12 1 10C-6 13-13 7-12-3Z" fill="#FFFFFF"/><circle r="5" fill="#F6C453"/><path d="M-2.6-1.6A3 3 0 0 1 .4-3" stroke="#FCE7A6" stroke-width="1.4"/>${dots('M-8 4v.1M6 6v.1M7-6v.1M-5-8v.1', OL, 1.3)}`,
  'egg-half': () => `<ellipse rx="9" ry="7" fill="#FFFFFF"/><circle r="4.4" fill="#F6C453"/><path d="M-2.4-1.2A2.6 2.6 0 0 1 0-2.6" stroke="#FCE7A6" stroke-width="1.2"/>${dots('M-6 3v.1M5-4v.1', '#C9553E', 1.3)}`,
  'egg-muffin': () => `<circle r="12" fill="#F2D27A"/><path d="M0-12V-9M8.5-8.5L6.4-6.4M12 0H9M8.5 8.5L6.4 6.4M0 12V9M-8.5 8.5L-6.4 6.4M-12 0H-9M-8.5-8.5L-6.4-6.4" stroke="#D9B256" stroke-width="1"/><circle r="8.4" fill="#F7E2A4" stroke-width="1.2"/>${dots('M-4-3v.1M4 3v.1M-2 5v.1M1-1v.1', '#6FA868', 2.6)}${dots('M3-4v.1M-5 2v.1', '#E7705F', 2.6)}`,
  'tomato-dice': () => `${cube(6, '#EC7E6B')}<path d="M-1.6-1.4h1.8" stroke="#F8B8AA" stroke-width="1.2"/>`,
  'tomato-cherry': (v) => `${ball(5.6, '#EA6F60', '#F6A595')}${v % 2 ? '' : '<path d="M-2.2-.6L0 .6L2.2-.6M0 .6V-2" stroke="#5E9A60" stroke-width="1.2"/>'}`,
  'tomato-slice': () => `${ring(8.6, '#E5675A', '#F3A08F')}<path d="M0-5V5M-4.4-2.4L4.4 2.4M-4.4 2.4L4.4-2.4" stroke="#E5675A" stroke-width="1.1"/>${dots('M-1.4-3.4v.1M2.6-2v.1M2.4 2.4v.1M-1.4 3.4v.1M-3.2 0v.1', '#FBE3A0', 1.3)}`,
  'pepper-red': () => crescent(7, '#E8665A', '#F4A59B'),
  'pepper-green': () => crescent(7, '#8CBC66', '#C3DE9F'),
  'pepper-strip': () => `${stick(4.6, 24, '#EA6E62')}<path d="M-.6-8V6" stroke="#F5A9A0" stroke-width="1.1"/>`,
  cucumber: () => `${ring(6.4, '#76AA70', '#DDEEC8', '#C4E0A9')}${dots('M-2.6 0v.1M2.6 0v.1M0-2.6v.1M0 2.6v.1', '#9CC583', 1.3)}`,
  'cucumber-stick': () => `${stick(6, 26, '#DDEEC8')}<path d="M2-11V11" stroke="#76AA70" stroke-width="2"/>${dots('M-1-6v.1M-1 0v.1M-1 6v.1', '#A9CF8E', 1.3)}`,
  chickpea: () => `${ball(4, '#EBCB93', '#F6E3BE')}<path d="M-.6-2.8Q1.8 0 0 2.8" stroke="#D2A866" stroke-width=".9"/>`,
  'chickpea-roasted': () => `${ball(4.2, '#DBA060', '#E9BF88')}<path d="M-.6-2.8Q1.8 0 0 2.8" stroke="#B9783A" stroke-width=".9"/>`,
  'bean-black': () => `${bean(3.8, 2.4, '#5A5366')}<path d="M-1 .2h2" stroke="#E9E4EE" stroke-width="1"/>`,
  'bean-red': () => bean(4, 2.6, '#B4545A', '#CF8186'),
  'bean-white': () => bean(4, 2.6, '#F7F0E2', '#FFFFFF'),
  edamame: () => `<path d="M-7 0C-7-3.6 7-3.6 7 0C7 3.6-7 3.6-7 0Z" fill="#A6CF78"/><path d="M-3.4-.2v.1M0-.2v.1M3.4-.2v.1" stroke="#CDE6A8" stroke-width="2.2"/>`,
  feta: () => `${cube(7, '#FFFEFB')}${dots('M-1.6-1.4v.1M1.8.6v.1M-.6 2v.1', '#E6DCC8', 1.2)}`,
  'onion-ring': () => `<circle r="5.4" stroke="#C08CB4" stroke-width="2.2"/><circle r="2.8" stroke="#D9B4CF" stroke-width="1.2"/>`,
  avocado: () => `<path d="M-11 3C-7-7 7-7 11 3C7 .6-7 .6-11 3Z" fill="#BAD690"/><path d="M-9 1.4C-5-5 5-5 9 1.4" stroke="#6C8E48" stroke-width="1.6"/><path d="M-4-1.6Q0-3 4-1.6" stroke="#DCEBBE" stroke-width="1.2"/>`,
  'avocado-mash': () => `<path d="M-16-2C-16-12 12-14 16-4C19 6 10 13 0 13C-10 13-16 7-16-2Z" fill="#BFDA98"/><path d="M-10-2Q-4-6 2-3M-4 6Q3 3 9 6" stroke="#A2C574" stroke-width="1.4"/>${dots('M-6-6v.1M6 1v.1M-2 9v.1', '#D2463D', 1.8)}`,
  toast: () => `<path d="M-20-12C-20-22-10-24-6-20C-2-25 8-25 10-20C17-23 21-16 20-10V18C20 20 19 21 17 21H-17C-19 21-20 20-20 18Z" fill="#D9A56A"/><path d="M-15.6-9C-15.6-16.6-8.4-18-5-15C-2-18.6 6-18.6 7.6-15C13-17 16.6-12 15.6-7.6V15.6H-15.6Z" fill="#F2D7A6" stroke="none"/>${dots('M-9-8v.1M4-11v.1M10 0v.1M-3 3v.1M-11 10v.1M6 11v.1M-5-2v.1M11 13v.1', '#DDB27A', 2)}`,
  pita: () => `${wedge('M-8 6L14-4A17 17 0 0 1 9 12Z', '#ECCC98')}<path d="M-3 5L11-1.6A13 13 0 0 1 8 8.6" stroke="#DDB377" stroke-width="1.1"/>${dots('M8 3v.1M11 7v.1', '#C99A5C', 1.8)}`,
  'pita-chip': () => `${wedge('M-5 4L0-6L5 4Z', '#E9C68C')}${dots('M0 0v.1M-2 2.6v.1', '#C99A5C', 1.5)}`,
  chicken: (v) => (v % 2
    ? `<path d="M5-2.6L10-3.4C10.6-5.4 13.6-5 13.2-2.6C14.8-1.6 14 1.6 11.8 1.2L5 2Z" fill="#FFF8EE"/><path d="M-11 0C-11-7 0-8 6-3.4L6 2.6C0 7.6-11 7-11 0Z" fill="#E7A27C"/><path d="M-6.4-2.4q4-2.4 8.4-.6M-7.4 2q5-2.2 10.4 0" stroke="#BC6A45" stroke-width="1.6"/>`
    : `<path d="M-10 2C-11-6-3-9 4-8C10-7 12-1 9 4C6 9-8 9-10 2Z" fill="#E7A27C"/><path d="M-5.4-3.4q5-2.6 10-1M-6.6 1.6q6-2.6 12.4 0" stroke="#BC6A45" stroke-width="1.7"/><ellipse cx="3" cy="-5.4" rx="2.4" ry="1" fill="#F4C4A2" stroke="none"/>`),
  'chicken-breast': () => `<path d="${FILLET}" fill="#EBC99B"/><path d="M-16-6L-19 8M-6-9L-9 10M4-9.6L1 10.8M13-7.6L10 9.4" stroke="#B97E4C" stroke-width="2.2"/><path d="M-12-8.6C-6-11 4-12 11-10" stroke="#F6E0BE" stroke-width="1.4"/>${dots('M-11 2v.1M7 4v.1M17 0v.1', '#6FA868', 2)}`,
  tuna: () => `<path d="M-6 0C-5-5 5-5 6 0C4 4.4-4 4.4-6 0Z" fill="#E8C3AE"/><path d="M-2.6-1.6q2 1.6 0 3.4M1.4-2q2 2 0 4" stroke="#D3A48A" stroke-width="1"/>`,
  salmon: () => `<path d="${FILLET}" fill="#F4A688"/><path d="M-16-6.6q-3 7 0 14.6M-7-8.6q-3 8.4 0 17.6M2-9.4q-3 9 0 18.4M11-8q-3 7.4 0 15" stroke="#FCDACB" stroke-width="1.6"/><path d="M-21 7C-12 14 8 13 19 8" stroke="#D9785C" stroke-width="2"/>${dots('M-12 1v.1M6-2v.1M15 2v.1', OL, 1.4)}`,
  'fish-white': () => `<path d="${FILLET}" fill="#FAF4EA"/><path d="M-22-2C-18-10-2-13 12-10" stroke="#E7C98E" stroke-width="3"/><path d="M-13-2.6q3.4 4.4 0 9M-4-4q3.4 5 0 10.6M5-4q3.4 4.4 0 9.4" stroke="#E7DCC6" stroke-width="1.4"/>${dots('M-16 6v.1M12 1v.1', '#6FA868', 2)}`,
  'fish-red': () => `<path d="${FILLET}" fill="#E8957A"/><path d="M-21-3C-16-10-2-13 13-10" stroke="#C9553E" stroke-width="2.2"/><path d="M-10 0v.1M2 4v.1M12-2v.1" stroke="#7DB57C" stroke-width="2.8"/>${dots('M-15 5v.1M-3-4v.1M8 7v.1M17 3v.1', '#B8432F', 1.6)}`,
  shrimp: () => `<path d="M5-5A7 7 0 1 1-5 4.6" stroke-width="7.2"/><path d="M5-5A7 7 0 1 1-5 4.6" stroke="#F6AB8D" stroke-width="3.8"/><path d="M-5 4.6L-9.4 6.6L-7 2.4Z" fill="#F08A6C" stroke-width="1.1"/><path d="M7.4 1.4L4.6.6M3.6 6.4L2 4.2M-1.6 7L-.8 4.6" stroke="#E07A5C" stroke-width="1"/>`,
  mango: () => `${cube(7, '#F8C866')}<path d="M-2-1.6h2" stroke="#FCE3A4" stroke-width="1.2"/>`,
  lemon: () => halfDisc(9, '#EFD24E', '#FBEB9C', '#FFFBE6'),
  lime: () => halfDisc(9, '#93C35E', '#CFE8A2', '#F1F9E4'),
  walnut: () => `<path d="M-6 0C-6-5.4-1.4-6 0-3.4C1.4-6 6-5.4 6 0C6 4.8 1.4 6 0 3.4C-1.4 6-6 4.8-6 0Z" fill="#C49A70"/><path d="M0-3.4V3.4" stroke-width="1"/><path d="M-4-1.6q1.6 1.4 0 3.2M4-1.6q-1.6 1.4 0 3.2" stroke="#9E7650" stroke-width="1"/>`,
  almond: () => `<path d="M0-5C3.6-2.2 3-4 3 0C3 3.6 1.4 5 0 5C-1.4 5-3 3.6-3 0C-3-4-3.6-2.2 0-5Z" fill="#D8AA7C"/><path d="M0-2.6V2.4" stroke="#B98656" stroke-width="1"/>`,
  peanut: () => `<path d="M-6.4 0A3.6 3.6 0 0 1-1.2-3.2A1.6 1.6 0 0 0 1.2-3.2A3.6 3.6 0 1 1 1.2 3.2A1.6 1.6 0 0 0-1.2 3.2A3.6 3.6 0 0 1-6.4 0Z" fill="#DDB57F"/>${dots('M-3.6-1v.1M-3.2 1.4v.1M3.4-1v.1M3.6 1.4v.1', '#BF925A', 1.2)}`,
  banana: () => `${ring(5.4, '#F2DE8E', '#FAF0C6', '#E8D38E')}${dots('M-1.2-.6v.1M1.2-.6v.1M0 1.2v.1', '#B89A4E', 1.1)}`,
  'apple-slice': () => `${crescent(11, '#E7787A')}<path d="M-9 1.6C-6-4.6 6-4.6 9 1.6C5-.4-5-.4-9 1.6Z" fill="#FBF0D8" stroke="none"/>${dots('M-1.4-1.4v.1M1.6-1.4v.1', '#7A4A34', 1.6)}`,
  'nut-butter': () => `<circle r="14" fill="#FFFFFF"/><circle r="10" fill="#CFA270" stroke-width="1.4"/><path d="M-5 0Q-2-4 4-1M-3 4Q1 2 5 4" stroke="#B5844F" stroke-width="1.4"/><path d="M-5-5Q-2-7 1-6.6" stroke="#E6C49A" stroke-width="1.4"/>`,
  date: (v) => `<ellipse rx="9" ry="4.6" fill="#7A3E50"/><path d="${v % 2 ? 'M-5.4-1.6q2.6-1.4 5.4-.4M-2 1.8q3 .8 6-.8' : 'M-4.6-1q3-1.8 6-.6M-5 2q2.6.6 5-.4M3 1.4l3-1'}" stroke="#B26B7E" stroke-width="1.1"/><ellipse cx="-4" cy="-2.2" rx="2.2" ry=".9" fill="#A35A70" stroke="none"/>`,
  popcorn: () => `<path d="M-5 3A3.8 3.8 0 0 1-4-4A4.4 4.4 0 0 1 4-4A3.8 3.8 0 0 1 5 3A4 4 0 0 1-5 3Z" fill="#FCF4DC"/><path d="M-1.4-3.4q1.6 2 0 3.6M2.4-1.6q-1 1.8.6 3.4" stroke="#EAD39A" stroke-width="1"/>`,
  tofu: () => `${cube(9, '#F7EDD6')}<path d="M-3-1.6l2.4-2.4M-1 2.6l4-4" stroke="#E2C996" stroke-width="1.4"/>`,
  broccoli: () => `<rect x="-1.7" y="0" width="3.4" height="7" rx="1.7" fill="#B4D695"/><path d="M-7 1A3.6 3.6 0 0 1-5-5A4 4 0 0 1 3-6.4A3.8 3.8 0 0 1 7 1Z" fill="#76B370"/>${dots('M-4-2v.1M0-4v.1M3-1v.1M-1-.6v.1M4.4-4v.1', '#5A944F', 1.6)}`,
  'snow-pea': () => `<path d="M-9 0C-4-4.6 4-4.6 9 0C4 2.6-4 2.6-9 0Z" fill="#A4D07A"/><path d="M-4-.6v.1M0-1v.1M4-.6v.1" stroke="#CBE5A6" stroke-width="2"/>`,
  carrot: () => `${stick(3.6, 11, '#F4AC68')}<path d="M-.4-3V2" stroke="#F9D0A2" stroke-width="1"/>`,
  'carrot-stick': () => `${stick(5, 28, '#F4AC68')}<path d="M-1-10V8" stroke="#F9D0A2" stroke-width="1.1"/><path d="M-2.5-4h1.6M1 3h1.5" stroke="#DB8B48" stroke-width="1"/>`,
  'sweet-potato': () => `${cube(7.6, '#F2AD6C')}<path d="M-3.8 2.2V-1.6Q-3.8-3.8-1.6-3.8H2" stroke="#C9774A" stroke-width="1.3"/>`,
  corn: () => `${cube(4, '#F7DA78')}`,
  zucchini: () => `${ring(6.2, '#6A9A56', '#E2EFC9')}${dots('M-2.2-.8v.1M2.2-.8v.1M0 2.2v.1', '#B7D49A', 1.4)}`,
  eggplant: () => `${ring(6.2, '#9A72A2', '#F4E6CC')}${dots('M-2.2-.8v.1M2.2-.8v.1M0 2.2v.1', '#D8C2A0', 1.4)}`,
  mushroom: () => `<path d="M-7 0C-7-6 7-6 7 0ZM-2.4 0V4.6H2.4V0" fill="#E0D1C0"/><path d="M-4-.8l1-2.6M0-.8v-3M4-.8l-1-2.6" stroke="#B8A38C" stroke-width="1"/>`,
  'red-cabbage': () => `<path d="M-6 1Q0-4 6 1" stroke="#AE78B4" stroke-width="2.4"/>`,
  radish: () => `${ring(5.6, '#E6879F', '#FFF7F8')}<circle r="1.6" stroke="#F5C6D2" stroke-width="1"/>`,
  olive: () => `${bean(4.4, 3.4, '#5E5868')}<circle r="1.4" fill="#9890A3" stroke="none"/>`,
  asparagus: () => `${stick(3.6, 36, '#8FC074')}<ellipse cy="-18" rx="3" ry="5" fill="#679C50"/><path d="M-2-6l-2.4-2.4M2 4l2.4-2.4M-2 12l-2.4-2.4" stroke-width="1.2"/>`,
  'green-bean': () => `${stick(3.4, 28, '#77B160')}<path d="M0-10V10" stroke="#9FCB86" stroke-width="1"/>`,
  'quinoa-mound': () => `<circle r="22" fill="#F2E7CF"/><path d="M-10-8v.1M4-12v.1M10 2v.1M-2 4v.1M-12 6v.1M6 12v.1M14-8v.1M-4-2v.1M-6 13v.1M15 7v.1M-15-2v.1M1-6v.1" stroke="#D8C090" stroke-width="2.2"/><path d="M-6-11v.1M8-4v.1M-8 2v.1M2 9v.1M-14 11v.1" stroke="#FFFFFF" stroke-width="2"/>`,
  'rice-side': () => `<circle r="19" fill="#FAF5EA"/><path d="M-9-6q1.5-1.4 3 0M3-10q1.5-1.4 3 0M8 1q1.5-1.4 3 0M-3 3q1.5-1.4 3 0M-12 6q1.5-1.4 3 0M4 10q1.5-1.4 3 0M-5 12q1.5-1.4 3 0M10-5q1.5-1.4 3 0M-13-3q1.5-1.4 3 0M-4-13q1.5-1.4 3 0M12 7q1.5-1.4 3 0" stroke="#DFCFAE" stroke-width="1.6"/>`,
  'yogurt-dollop': () => `<circle r="8" fill="#FFFDF9"/><path d="M-4 0A4 4 0 1 1 1.6 3" stroke="#E8DDCF" stroke-width="1.4"/>`,
  'hummus-bowl': () => `<circle r="24" fill="#FFFFFF"/><circle r="18.6" fill="#EFDAB4" stroke-width="1.4"/><path d="M-11-2C-8-11 8-11 11-2C13 6 3 11-4 8" stroke="#DCBD88" stroke-width="2.4"/><path d="M-7 3C-2-1 4 0 7 4" stroke="#E6C35A" stroke-width="2"/><path d="M3-3v.1M-3 1v.1M5 5v.1M-9 5v.1" stroke="#D9704F" stroke-width="2.2"/><circle cx="-1" cy="-4" r="2.6" fill="#EBCB93" stroke-width="1"/><circle cx="4" cy="-6" r="2.4" fill="#EBCB93" stroke-width="1"/><path d="M-15-12A19 19 0 0 1-4-20" stroke="#FBE1E6" stroke-width="2.4"/>`,
  wrap: () => `<circle r="15" fill="#EBD3A8"/><circle r="11.6" fill="#F9EFDA" stroke-width="1.2"/><path d="M-8-3C-3-7 5-6 7 0C4 5-3 7-7 3Z" fill="#9CC99A" stroke-width="1.2"/><circle cx="-1" cy="-1" r="3.4" fill="#EED3AC" stroke-width="1.2"/><circle cx="4" cy="3" r="2.6" fill="#EA6F60" stroke-width="1.2"/><path d="M-3 5l1.6-.4M-5-1h1.6" stroke="#F4AC68" stroke-width="1.6"/>${dots('M-10-9v.1M10-8v.1M-12 6v.1M9 10v.1', '#D2AD72', 1.8)}`,
  'stuffed-pepper': () => `<path d="M-14-8C-14-15 14-15 14-8L13 9C12 15-12 15-13 9Z" fill="#E8665A"/><path d="M-10-7C-10-11 10-11 10-7L9 6C8 10-8 10-9 6Z" fill="#C08A68" stroke-width="1.2"/><path d="M-6-4C-3-7 2-6 5-3C7 0 4 3 0 2C-4 3-8 0-6-4Z" fill="#FBF3DA" stroke-width="1"/>${dots('M-5 4v.1M3 5v.1M6-6v.1', '#6FA868', 2)}<path d="M-11-11.6Q-6-14 0-13.6" stroke="#F4A59B" stroke-width="1.3"/><path d="M0-14V-17" stroke-width="2"/>`,
  drizzle: () => `<path d="M-22 0C-11-12 0 10 12-3S22 4 26-2" stroke="#E6C860" stroke-width="2.2"/>`,
  dough: () => `${cube(8, '#F5E8CC')}<path d="M-2.4-2.4L2.4 2.4" stroke="#E0CBA2" stroke-width="1.1"/>`,
  raisin: () => `${bean(2.8, 2, '#73503F')}<path d="M-1.2-.4q1.2.8 2.4 0" stroke="#9C7462" stroke-width=".9"/>`,
  'pumpkin-seed': () => `${bean(3.4, 1.8, '#86AA60')}<path d="M-2 0h3" stroke="#B2CF8E" stroke-width="1"/>`,
  'onion-fried': () => `<path d="M-4.6 1Q0-4 4.6 1" stroke="#BE8244" stroke-width="2"/>`,
  // small things, scattered thickly and drawn without an outline
  seed: () => '<ellipse rx="1.2" ry=".8" fill="#4F4A48"/>',
  sesame: () => '<ellipse rx="1.6" ry=".9" fill="#F7EED8"/>',
  zaatar: () => '<circle r="1.1" fill="#7E8A4E"/>',
  cumin: () => '<circle r="1" fill="#A9733E"/>',
  paprika: () => '<circle r="1.1" fill="#C9553E"/>',
  cinnamon: () => '<circle r="1.1" fill="#A86A3C"/>',
  chili: () => '<circle r="1.1" fill="#D2463D"/>',
  parmesan: () => '<rect x="-2" y="-.6" width="4" height="1.2" rx=".6" fill="#FBEFC2"/>',
  oat: () => '<ellipse rx="2.2" ry="1.3" fill="#DCC69A"/>',
  pomegranate: () => '<ellipse rx="2.2" ry="1.8" fill="#C9415F"/>',
  bulgur: () => '<circle r="1.1" fill="#C9AA6E"/>',
  fleck: () => '<rect x="-1.2" y="-.6" width="2.4" height="1.2" rx=".6" fill="#5E9A5A"/>',
};
const DUST = new Set(['seed', 'sesame', 'zaatar', 'cumin', 'paprika', 'cinnamon', 'chili', 'parmesan', 'oat', 'pomegranate', 'bulgur', 'fleck']);
// Spacing radius of each item (default 5).
const FOOT = {
  blueberry: 4.2, strawberry: 6, raspberry: 4.6, mint: 5.4, herb: 4, basil: 6, spinach: 7, 'egg-fried': 12, 'egg-half': 8, 'egg-muffin': 12,
  'tomato-dice': 3.6, 'tomato-cherry': 5.6, 'tomato-slice': 8.6, 'pepper-red': 6, 'pepper-green': 6, 'pepper-strip': 4, cucumber: 6.4, 'cucumber-stick': 5,
  chickpea: 4, 'chickpea-roasted': 4.2, 'bean-black': 3.6, 'bean-red': 3.8, 'bean-white': 3.8, edamame: 5.6, feta: 4, 'onion-ring': 5.6, avocado: 9,
  'avocado-mash': 15, toast: 20, pita: 13, 'pita-chip': 5, chicken: 9.4, 'chicken-breast': 22, tuna: 5.6, salmon: 22, 'fish-white': 22, 'fish-red': 22,
  shrimp: 7, mango: 4.4, lemon: 8, lime: 8, walnut: 5.6, almond: 3.6, peanut: 4.4, banana: 5.4, 'apple-slice': 10, 'nut-butter': 14, date: 8,
  popcorn: 5, tofu: 5.6, broccoli: 7, 'snow-pea': 7, carrot: 4, 'carrot-stick': 5, 'sweet-potato': 4.8, corn: 2.6, zucchini: 6.2, eggplant: 6.2,
  mushroom: 6, 'red-cabbage': 5, radish: 5.6, olive: 4.4, asparagus: 5, 'green-bean': 4, 'quinoa-mound': 21, 'rice-side': 18, 'yogurt-dollop': 8,
  'hummus-bowl': 24, wrap: 15, 'stuffed-pepper': 14, drizzle: 0, dough: 4.8, raisin: 2.8, 'pumpkin-seed': 3.2, 'onion-fried': 4,
};
const LONG = new Set(['asparagus', 'green-bean', 'carrot-stick', 'cucumber-stick', 'pepper-strip']);
const ANCHOR = { 'hummus-bowl': [0.38, 0.05], 'nut-butter': [0.38, 0.1] };
const MAX_EACH = 7; const MAX_DUST = 14;
// Colours of items shown as a layer inside a glass or jar.
const LAYER = { pomegranate: '#C9415F', blueberry: '#7385BB', strawberry: '#EC7B88', raspberry: '#E47790', mango: '#F8C866', banana: '#F2DE8E' };

function parseItems(list) { return (list ?? []).map((s) => { const [type, n] = String(s).split('*'); return { type, n: Math.max(0, Number(n ?? 1) || 0) }; }); }

/** Scatter points inside a circle so that discs of radius `rad` do not overlap already placed discs. */
function scatter(r, count, radius, rad, placed) {
  const pts = [];
  for (let tries = 0; pts.length < count && tries < count * 80; tries++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * radius;
    const p = [Math.cos(a) * d, Math.sin(a) * d, rad];
    if ([...placed, ...pts].every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= (q[2] + rad) * 0.9)) pts.push(p);
  }
  return pts;
}

/** Items laid out in a circle of `area` around (cx, cy); `sx`/`sy` stretch the layout into an oval. */
function drawItems(items, cx, cy, area, r, { k = 1, sx = 1, sy = 1, flat = false } = {}) {
  const placed = [];
  // big pieces first so smaller ones arrange around them, then draw in the listed order
  const order = items.map((it, i) => ({ ...it, i })).filter((it) => ITEMS[it.type]).sort((x, y) => (FOOT[y.type] ?? 5) - (FOOT[x.type] ?? 5));
  const out = [];
  const longRot = r() * 180;
  for (const { type, n, i } of order) {
    const dust = DUST.has(type);
    const count = Math.min(n, dust ? MAX_DUST : MAX_EACH);
    const rad = dust ? 1.6 * k : (FOOT[type] ?? 5) * k;
    const room = flat ? area : Math.max(6, area - Math.min(rad, area * .5) * .8);
    const pts = ANCHOR[type] && !flat ? [[ANCHOR[type][0] * area, ANCHOR[type][1] * area, rad]] : scatter(r, count, room, rad, dust ? [] : placed);
    let svg = '';
    pts.forEach((p, j) => {
      if (!dust && rad > 0) placed.push(p);
      const rot = LONG.has(type) ? longRot + (r() - 0.5) * 24 : r() * 360;
      const s = k * (dust ? 1 : 0.92 + r() * 0.18);
      svg += `<g transform="translate(${f(cx + p[0] * sx)} ${f(cy + p[1] * sy)}) rotate(${f(rot)}) scale(${f(s)})"${dust ? ' stroke="none"' : ` stroke-width="${f(ISW * SWK / s)}"`}>${ITEMS[type](j)}</g>`;
    });
    out.push([i, svg]);
  }
  out.sort((x, y) => x[0] - y[0]);
  return out.map(([, svg]) => svg).join('');
}

/** Texture for a food surface filling the ellipse (cx, cy, rx, ry). */
function texture(b, cx, cy, rx, ry, r) {
  const A = Math.PI * rx * ry;
  const n = (per) => Math.max(3, Math.round(A / per));
  const pts = (m, md, k = .8) => spread(r, m, cx, cy, rx, ry, md, k);
  const t = b.tex;
  if (t === 'none' || t === 'bread') return '';
  // darker crescent along the lower inside edge gives the food some depth
  let o = t === 'leaves' ? '' : path(`M${P(cx - rx * .86, cy + ry * .22)}A${f(rx * .9)} ${f(ry * .9)} 0 0 0 ${P(cx + rx * .86, cy + ry * .22)}`, `stroke="${b.c}" stroke-width="${sw(2.2)}"`);
  const drops = (m, c, edge) => { let d = ''; for (const [x, y] of pts(m, 7, .7)) d += circ(x, y, 1.3 + r() * 1.3); return path(d, `fill="${c}" stroke="${edge}" stroke-width="1"`); };
  if (t === 'rice' || t === 'creamy') {
    let d = ''; let d2 = '';
    pts(n(t === 'rice' ? 60 : 110), 4.4, .86).forEach(([x, y], i) => { const g = grain(x, y, r() * Math.PI * 2, 4.8); if (i % 4 === 0) d2 += g; else d += g; });
    o += path(d, `stroke="${b.c}" stroke-width="1.8"`) + path(d2, `stroke="${b.c2}" stroke-width="1.8"`);
    if (b.spice) { let s = ''; for (const [x, y] of pts(Math.min(7, n(500)), 11, .72)) s += circ(x, y, 1.6); o += path(s, `fill="${b.spice}" stroke-width="1"`); }
    if (t === 'creamy') o += path(`M${P(cx - rx * .4, cy)}a${f(rx * .4)} ${f(ry * .36)} 0 1 1 ${f(rx * .56)} ${f(ry * .26)}`, `stroke="${b.c}" stroke-width="2"`);
  } else if (t === 'grains' || t === 'seeds') {
    let d = ''; let d2 = '';
    pts(n(t === 'grains' ? 34 : 46), 3.4, .86).forEach(([x, y], i) => { if (i % 3 === 0) d2 += circ(x, y, 1.1); else d += t === 'seeds' ? circ(x, y, 1.3) : `M${P(x, y)}v.1`; });
    o += t === 'seeds' ? path(d, `fill="${b.c2}" stroke="${b.c}" stroke-width="1"`) : path(d, `stroke="${b.c}" stroke-width="2.2"`);
    o += path(d2, `fill="${b.c2}" stroke="none"`);
  } else if (t === 'flakes') {
    let d = ''; for (const [x, y] of pts(n(60), 5, .84)) d += ell(x, y, 2.8, 1.6, r() * Math.PI);
    o += path(d, `fill="${b.c2}" stroke="${b.c}" stroke-width="1"`);
  } else if (t === 'beans') {
    let d = ''; for (const [x, y] of pts(n(110), 7.4, .82)) d += ell(x, y, 3.4, 2.3, r() * Math.PI);
    o += path(d, `fill="${b.c2}" stroke="${b.c}" stroke-width="1.1"`) + drops(3, '#E9CC6A', b.c);
  } else if (t === 'curds') {
    let d = ''; for (const [x, y] of pts(n(150), 8.4, .8)) d += circ(x, y, 2.6 + r() * 1.6);
    o += path(d, `fill="${b.c2}" stroke="${b.c}" stroke-width="1.1"`);
    let s = ''; for (const [x, y] of pts(10, 4, .84)) s += `M${P(x, y)}v.1`; o += path(s, `stroke="#D9A23B" stroke-width="1.8"`);
  } else if (t === 'soup' || t === 'sauce') {
    o += path(arcAt(cx, cy, rx * .55, ry * .55, 3.5, 5.4) + arcAt(cx, cy, rx * .32, ry * .32, .4, 2.2) + arcAt(cx, cy, rx * .7, ry * .7, .9, 1.9), `stroke="${b.c}" stroke-width="1.6"`);
    o += drops(n(380), b.oil, b.c);
    if (t === 'sauce') { let s = ''; for (const [x, y] of pts(9, 6, .8)) s += grain(x, y, r() * Math.PI, 3.4); o += path(s, `stroke="#C4503F" stroke-width="1.6"`); }
  } else if (t === 'stew') {
    let d = ''; for (const [x, y] of pts(n(260), 11, .74)) d += quad(x, y, 3.4 + r() * 1.2, r() * Math.PI);
    o += path(d, `fill="${b.chunk}" stroke-width="1.1"`);
    o += path(arcAt(cx, cy, rx * .5, ry * .5, 3.6, 5.2), `stroke="${b.c}" stroke-width="1.6"`) + drops(n(460), b.oil, b.c);
  } else if (t === 'swirl' || t === 'porridge') {
    const sp = `M${P(cx - rx * .5, cy)}a${f(rx * .5)} ${f(ry * .5)} 0 1 1 ${f(rx * .7)} ${f(ry * .35)}a${f(rx * .3)} ${f(ry * .3)} 0 1 1 ${f(-rx * .45)} ${f(-ry * .3)}`;
    o += path(sp, `stroke="${b.c}" stroke-width="2.6"`);
    o += path(`M${P(cx - rx * .56, cy - ry * .18)}a${f(rx * .56)} ${f(ry * .56)} 0 0 1 ${f(rx * .4)} ${f(-ry * .38)}`, `stroke="${b.c2 ?? '#FFFFFF'}" stroke-width="1.6"`);
    if (b.pool) o += `<ellipse cx="${f(cx + rx * .06)}" cy="${f(cy + ry * .04)}" rx="${f(rx * .2)}" ry="${f(ry * .15)}" fill="${b.pool}" stroke="${b.c}" stroke-width="1.2"/><path d="M${P(cx - rx * .06, cy - ry * .04)}h${f(rx * .08)}" stroke="#FCEBB4" stroke-width="1.4"/>`;
    if (t === 'porridge') { let s = ''; for (const [x, y] of pts(n(160), 5, .8)) s += `M${P(x, y)}v.1`; o += path(s, `stroke="${b.c}" stroke-width="1.8"`); }
  } else if (t === 'strands') {
    let d = '';
    for (let y = cy - ry + 7; y < cy + ry - 5; y += 5.6) {
      const hw = Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)) * rx - 6;
      if (hw < 6) continue;
      const segs = Math.max(1, Math.floor(hw / 4));
      d += `M${P(cx - segs * 4, y)}q2 ${f(-2.6 + r())} 4 0` + 't4 0'.repeat(segs * 2 - 1);
    }
    o += path(d, `stroke="${b.c}" stroke-width="3.6"`) + path(d, `stroke="${b.c2}" stroke-width="1.4"`);
  } else if (t === 'leaves') {
    for (const [x, y] of pts(n(150), 9, .8)) o += `<g transform="translate(${P(x, y)}) rotate(${f(r() * 360)})" stroke-width="1.1">${leafV(13, r() > .5 ? '#A6D198' : '#8FC383', '#6FA868')}</g>`;
  } else if (t === 'specks') {
    let d = ''; for (const [x, y] of pts(n(30), 3, .86)) d += `M${P(x, y)}v.1`; o += path(d, `stroke="${b.c}" stroke-width="1.6"`);
  } else if (t === 'bubbles') {
    let d = ''; for (const [x, y] of pts(n(90), 6, .8)) d += circ(x, y, 1 + r()); o += path(d, `stroke="${b.c}" stroke-width="1"`);
  }
  return o;
}

/** A flatbread (lahouh) round, or two when stacked, centred on (cx, cy). */
function flatbread(b, cx, cy, R, r) {
  let o = '';
  for (const [dx, dy, s] of [[7, -6, .92], [-3, 3, 1]]) {
    const x = cx + dx; const y = cy + dy; const a = R * s;
    o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(a)}" ry="${f(a * .94)}" fill="${s < 1 ? b.c2 : b.fill}" stroke-width="${sw(1.8)}"/>`;
  }
  const x = cx - 3; const y = cy + 3;
  o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(R * .84)}" ry="${f(R * .78)}" stroke="${b.c2}" stroke-width="${sw(2)}"/>`;
  let d = ''; for (const [px, py] of spread(r, 34, x, y, R, R * .94, 4.6, .76)) d += circ(px, py, .9 + r() * .9);
  return o + path(d, `fill="${b.c}" stroke="none"`);
}

/** One dish in a vessel, centred on (cx, cy), in a 200 × 150 frame. */
function vessel(kind, base, items, r, cx = 100, cy = 78) {
  const b = BASES[base] ?? null;
  const { white, blush, pink, rose, border, primary } = PAL;
  let o = '';
  if (kind === 'jar' || kind === 'glass') {
    const w = 64; const h = 100; const top = cy - h / 2 + 4; const bot = top + h;
    const l = cx - w / 2; const rr = cx + w / 2;
    const fill = b?.fill ?? '#F3E6D6';
    const y0 = top + h * (kind === 'jar' ? .3 : .22);
    let body; let surface;
    if (kind === 'jar') {
      body = `M${l} ${f(top + 10)}Q${l} ${top} ${f(l + 10)} ${top}H${f(rr - 10)}Q${rr} ${top} ${rr} ${f(top + 10)}V${f(bot - 14)}Q${rr} ${bot} ${f(rr - 14)} ${bot}H${f(l + 14)}Q${l} ${bot} ${l} ${f(bot - 14)}Z`;
      surface = `M${l} ${y0}H${rr}V${f(bot - 14)}Q${rr} ${bot} ${f(rr - 14)} ${bot}H${f(l + 14)}Q${l} ${bot} ${l} ${f(bot - 14)}Z`;
    } else {
      const xAt = (y) => (y - top) / h * 10;
      body = `M${l} ${top}H${rr}L${f(rr - 10)} ${bot}H${f(l + 10)}Z`;
      surface = `M${f(l + xAt(y0))} ${f(y0)}H${f(rr - xAt(y0))}L${f(rr - 10)} ${bot}H${f(l + 10)}Z`;
      o += `<path d="M${f(cx + 6)} ${f(top + 14)}L${f(cx + 18)} ${f(top - 14)}" stroke-width="7"/><path d="M${f(cx + 6)} ${f(top + 14)}L${f(cx + 18)} ${f(top - 14)}" stroke="${pink}" stroke-width="3"/>`;
    }
    o += `<ellipse cx="${cx}" cy="${f(bot + 2)}" rx="${f(w * .62)}" ry="6" fill="${border}" stroke="none"/>`;
    o += `<path d="${body}" fill="${white}"/><path d="${surface}" fill="${fill}" stroke="none"/>`;
    const inset = (m, md) => spread(r, m, cx, (y0 + bot) / 2 + 2, w / 2 - 9, (bot - y0) / 2 - 8, md, 1);
    const types = items.map((it) => it.type);
    // a fruit layer (and a granola layer for yogurt) seen through the glass
    const fruit = types.find((t) => LAYER[t]);
    if (base === 'oats' || base === 'yogurt' || base === 'chia') {
      const yl = f(top + h * .66);
      o += `<path d="M${f(l + 1.4)} ${yl}H${f(rr - 1.4)}" stroke="${base === 'yogurt' ? rose : '#FCFAF6'}" stroke-width="8"/>`;
      let d = ''; for (let x = l + 7; x < rr - 5; x += 6.4) d += circ(x + (r() - .5) * 2, yl + (r() - .5) * 3, 1.8);
      if (fruit) o += path(d, `fill="${LAYER[fruit]}" stroke="none"`);
      if (base === 'yogurt' && types.includes('oat')) { let g = ''; for (let x = l + 8; x < rr - 6; x += 5) g += ell(x, f(top + h * .5) + (r() - .5) * 2, 2.2, 1.3, r() * 3); o += path(g, `fill="#DCC69A" stroke="none"`); }
    }
    if (b && b.tex !== 'none') {
      if (b.tex === 'bubbles') { let d = ''; for (const [x, y] of inset(9, 8)) d += circ(x, y, 1.2 + r() * 1.2); o += path(d, `stroke="${b.c}" stroke-width="1.1"`); }
      else if (b.tex !== 'swirl') { let d = ''; for (const [x, y] of inset(16, 6)) d += `M${P(x, y)}v.1`; o += path(d, `stroke="${b.c}" stroke-width="2.2"`); }
      if (types.includes('seed')) { let d = ''; for (const [x, y] of inset(12, 5)) d += `M${P(x, y)}h1.2`; o += path(d, `stroke="#4F4A48" stroke-width="1.4"`); }
    }
    o += `<path d="M${l} ${f(y0)}H${rr}" stroke-width="${sw(1.8)}"/>`;
    o += `<path d="M${f(l + 8)} ${f(top + 16)}V${f(bot - 20)}M${f(l + 8)} ${f(bot - 14)}v.1" stroke="${white}" stroke-width="3.4"/>`;
    o += `<path d="${body}"/>`;
    o += drawItems(items, cx, y0 - 2, w * .34, r, { k: .8, sy: .2, flat: true });
    if (kind === 'jar') o += `<rect x="${f(l - 4)}" y="${f(top - 9)}" width="${f(w + 8)}" height="13" rx="6" fill="${pink}"/><path d="M${f(l + 4)} ${f(top - 2.6)}H${f(rr - 4)}" stroke="${PAL.pinkDeep}" stroke-width="${sw(1.6)}"/>`;
    return o;
  }
  if (kind === 'bowl') {
    const R = 52;
    o += `<circle cx="${cx}" cy="${f(cy + 6)}" r="${R}" fill="${pink}"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="${white}"/>`;
    o += `<circle cx="${cx}" cy="${cy}" r="${f(R * .8)}" fill="${b?.fill ?? blush}" stroke-width="${sw(1.8)}"/>`;
    if (b) o += texture(b, cx, cy, R * .8, R * .8, r);
    o += `<path d="M${f(cx - R * .62)} ${f(cy - R * .52)}A${f(R * .9)} ${f(R * .9)} 0 0 1 ${f(cx - R * .1)} ${f(cy - R * .88)}" stroke="${rose}" stroke-width="3"/>`;
    o += `<path d="M${f(cx + R * .5)} ${f(cy + R * .74)}A${f(R * .9)} ${f(R * .9)} 0 0 0 ${f(cx + R * .8)} ${f(cy + R * .42)}" stroke="${border}" stroke-width="2.4"/>`;
    return o + drawItems(items, cx, cy, R * .74, r);
  }
  if (kind === 'plate' || kind === 'platter') {
    const sx = kind === 'platter' ? 1.24 : 1; const R = kind === 'platter' ? 52 : 56;
    o += `<ellipse cx="${cx}" cy="${f(cy + 5)}" rx="${f(R * sx)}" ry="${R}" fill="${pink}"/><ellipse cx="${cx}" cy="${cy}" rx="${f(R * sx)}" ry="${R}" fill="${white}"/>`;
    o += `<ellipse cx="${cx}" cy="${cy}" rx="${f(R * .76 * sx)}" ry="${f(R * .76)}" fill="${blush}" stroke-width="${sw(1.5)}"/>`;
    o += `<path d="M${f(cx - R * .6 * sx)} ${f(cy - R * .58)}A${f(R * .9 * sx)} ${f(R * .9)} 0 0 1 ${f(cx - R * .1 * sx)} ${f(cy - R * .88)}" stroke="${rose}" stroke-width="2.6"/>`;
    if (b?.tex === 'bread') o += flatbread(b, cx, cy, R * .6, r);
    else if (b) o += `<ellipse cx="${cx}" cy="${cy}" rx="${f(R * .56 * sx)}" ry="${f(R * .56)}" fill="${b.fill}" stroke-width="${sw(1.5)}"/>` + texture(b, cx, cy, R * .56 * sx, R * .56, r);
    return o + drawItems(items, cx, cy, R * .72, r, { k: 1.02, sx });
  }
  if (kind === 'pan') {
    const R = 50;
    o += `<rect x="${f(cx + R * .8)}" y="${f(cy - 6)}" width="${f(R * .9)}" height="12" rx="6" fill="${primary}"/><circle cx="${f(cx + R * 1.56)}" cy="${cy}" r="2.4" fill="${PAL.sage}" stroke-width="${sw(1.4)}"/>`;
    o += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${border}"/><circle cx="${cx}" cy="${cy}" r="${f(R * .84)}" fill="${b?.fill ?? PAL.bg}" stroke-width="${sw(1.8)}"/>`;
    if (b) o += texture(b, cx, cy, R * .84, R * .84, r);
    o += `<path d="M${f(cx - R * .7)} ${f(cy - R * .62)}A${f(R * .93)} ${f(R * .93)} 0 0 1 ${f(cx - R * .1)} ${f(cy - R * .92)}" stroke="${white}" stroke-width="2.4"/>`;
    return o + drawItems(items, cx, cy, R * .74, r, { k: .96 });
  }
  if (kind === 'board') {
    o += `<rect x="${f(cx - 68)}" y="${f(cy - 44)}" width="136" height="96" rx="18" fill="#E2C9A6" stroke="none"/>`;
    o += `<rect x="${f(cx - 68)}" y="${f(cy - 48)}" width="136" height="96" rx="18" fill="#EFDDC4"/><rect x="${f(cx - 58)}" y="${f(cy - 38)}" width="116" height="76" rx="12" stroke="#DCC2A0" stroke-width="2"/><circle cx="${f(cx + 54)}" cy="${f(cy - 34)}" r="4" fill="${white}" stroke-width="${sw(1.8)}"/>`;
    o += `<path d="M${f(cx - 50)} ${f(cy - 22)}q14-4 28 0t28 0M${f(cx - 4)} ${f(cy + 26)}q14-4 28 0t24 0M${f(cx - 52)} ${f(cy + 12)}q10-3 20 0" stroke="#E2C9A6" stroke-width="1.6"/>`;
    return o + drawItems(items, cx, cy, 38, r, { sx: 1.35 });
  }
  if (kind === 'dish') {
    o += `<rect x="${f(cx - 74)}" y="${f(cy - 13)}" width="20" height="16" rx="6" fill="${white}"/><rect x="${f(cx + 54)}" y="${f(cy - 13)}" width="20" height="16" rx="6" fill="${white}"/>`;
    o += `<rect x="${f(cx - 66)}" y="${f(cy - 42)}" width="132" height="92" rx="20" fill="${pink}"/><rect x="${f(cx - 66)}" y="${f(cy - 47)}" width="132" height="92" rx="20" fill="${white}"/>`;
    o += `<rect x="${f(cx - 56)}" y="${f(cy - 37)}" width="112" height="72" rx="13" fill="${b?.fill ?? '#F7E7D3'}" stroke-width="${sw(1.5)}"/>`;
    o += `<path d="M${f(cx - 48)} ${f(cy + 28)}H${f(cx + 48)}" stroke="#EDD3B5" stroke-width="2.4"/>`;
    return o + drawItems(items, cx, cy - 1, 36, r, { sx: 1.4 });
  }
  // unknown vessel: a plain plate
  return vessel('plate', base, items, r, cx, cy);
}

// ---------------------------------------------------------------- table extras
/** Tumbler of water (with a lemon slice) or laban, top centre (x, y). */
function drink(x, y, kind, lemon) {
  const body = `M${f(x - 11)} ${y}h22l-2.6 42h-16.8Z`;
  let o = `<ellipse cx="${x}" cy="${f(y + 43)}" rx="13" ry="3" fill="${PAL.border}" stroke="none"/><path d="${body}" fill="${PAL.white}"/>`;
  if (kind === 'laban') {
    o += `<path d="M${f(x - 10.2)} ${f(y + 8)}h20.4l-2 34h-16.4Z" fill="#FFFDF6" stroke="none"/><path d="M${f(x - 9.6)} ${f(y + 15)}h19.2" stroke="${PAL.mint}" stroke-width="5"/><path d="M${f(x - 10.2)} ${f(y + 8)}h20.4" stroke-width="${sw(1.4)}"/>`;
    o += `<path d="M${f(x + 4)} ${f(y + 12)}l7-19" stroke="${PAL.plum}" stroke-width="2.6"/>`;
  } else {
    o += `<path d="M${f(x - 10.2)} ${f(y + 10)}h20.4l-2 32h-16.4Z" fill="#E4F1F0" stroke="none"/><path d="M${f(x - 10.2)} ${f(y + 10)}h20.4" stroke="#BCD9D6" stroke-width="${sw(1.4)}"/>`;
    o += `<path d="M${f(x - 4)} ${f(y + 20)}l3.4-2M${f(x + 2)} ${f(y + 28)}l3.4-2" stroke="#BCD9D6" stroke-width="1.4"/>`;
  }
  o += `<path d="M${f(x - 6.6)} ${f(y + 6)}l2 30" stroke="${PAL.white}" stroke-width="2.6"/><path d="${body}"/>`;
  if (lemon && kind !== 'laban') o += `<g transform="translate(${f(x + 10)} ${f(y + 1)}) rotate(-20)" stroke-width="${sw(1.5)}">${ITEMS.lemon()}</g>`;
  return o;
}

/** Small side bowl (top-down) with a food base and a few items. */
function sideBowl(x, y, R, base, items, r) {
  const b = BASES[base];
  let o = `<circle cx="${x}" cy="${f(y + 3)}" r="${R}" fill="${PAL.pink}"/><circle cx="${x}" cy="${y}" r="${R}" fill="${PAL.white}"/>`;
  o += `<circle cx="${x}" cy="${y}" r="${f(R * .72)}" fill="${b.fill}" stroke-width="${sw(1.6)}"/>`;
  if (b.tex === 'rice' || b.tex === 'soup' || b.tex === 'stew') { let d = ''; for (const [px, py] of spread(r, 8, x, y, R * .72, R * .72, 4.6, .74)) d += b.tex === 'rice' ? grain(px, py, r() * 6.3, 4) : circ(px, py, 1.2); o += path(d, b.tex === 'rice' ? `stroke="${b.c}" stroke-width="1.4"` : `fill="${b.oil}" stroke="${b.c}" stroke-width="1"`); }
  return o + drawItems(parseItems(items), x, y, R * .56, r, { k: .7 });
}

/** Two dates on a small saucer. */
function dates(x, y) {
  return `<ellipse cx="${x}" cy="${f(y + 2)}" rx="17" ry="9" fill="${PAL.pink}" stroke="none"/><ellipse cx="${x}" cy="${y}" rx="17" ry="9" fill="${PAL.white}"/>`
    + `<g transform="translate(${f(x - 5)} ${f(y - 1)}) rotate(-24) scale(.82)" stroke-width="${sw(2)}">${ITEMS.date(0)}</g><g transform="translate(${f(x + 6)} ${f(y + 1)}) rotate(18) scale(.82)" stroke-width="${sw(2)}">${ITEMS.date(1)}</g>`;
}

/** Fork and spoon on a napkin, centred on (x, y). */
function cutlery(x, y) {
  return `<rect x="${f(x - 11)}" y="${f(y - 30)}" width="22" height="60" rx="6" fill="${PAL.rose}" stroke="none"/><path d="M${f(x - 11)} ${f(y + 14)}h22" stroke="${PAL.pink}" stroke-width="2"/>`
    + `<path d="M${f(x - 4)} ${f(y + 26)}V${f(y - 6)}M${f(x - 7.4)} ${f(y - 24)}v9q0 4 3.4 4t3.4-4v-9M${f(x - 4)} ${f(y - 24)}v8" stroke-width="2"/>`
    + `<ellipse cx="${f(x + 5)}" cy="${f(y - 17)}" rx="3.6" ry="6" fill="${PAL.white}" stroke-width="2"/><path d="M${f(x + 5)} ${f(y - 11)}V${f(y + 26)}" stroke-width="2"/>`;
}

/** Rising steam above (x, y). */
function steam(x, y, c) {
  let d = '';
  for (const dx of [-12, 0, 12]) d += `M${f(x + dx)} ${y - (dx ? 0 : 3)}c-5-6 5-9 0-15`;
  return path(d, `stroke="${c}" stroke-width="2.6"`);
}

const badge = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="${PAL.pinkDeep}" stroke-width="2"/><path d="M${x} ${f(y + 4.6)}C${f(x - 4)} ${f(y + 2)} ${f(x - 4.8)} ${f(y - 1)} ${f(x - 3.4)} ${f(y - 2.6)}C${f(x - 2.3)} ${f(y - 3.8)} ${f(x - .6)} ${f(y - 3.4)} ${x} ${f(y - 2)}C${f(x + .6)} ${f(y - 3.4)} ${f(x + 2.3)} ${f(y - 3.8)} ${f(x + 3.4)} ${f(y - 2.6)}C${f(x + 4.8)} ${f(y - 1)} ${f(x + 4)} ${f(y + 2)} ${x} ${f(y + 4.6)}Z" fill="${PAL.white}" stroke-width="1.4"/>`;

// Complete trays: the sides are the meal's other components.
const TRAYS = {
  'kabsa-lunch-tray': { bowl: ['stew-red', ['herb*5', 'tomato-dice*2']], drink: 'water' },
  'saleeg-dinner-tray': { bowl: ['stew-red', ['herb*5', 'tomato-dice*2']], drink: 'water' },
  'fish-dinner-tray': { bowl: ['rice-yellow', ['chickpea*4', 'herb*2']], drink: 'water' },
  'bukhari-lunch-tray': { bowl: ['greens', ['tomato-dice*3', 'cucumber*2']], drink: 'water' },
  'lahouh-breakfast': { drink: 'laban', dates: true },
  'laban-dates': { dates: true },
};

/** Soft round shapes and plus-sparkles behind a dish. */
function backdrop(r, big, mid, small, w = 200, h = 150) {
  const bx = w / 2 + (r() - .5) * 24; const left = r() > .5;
  let o = `<circle cx="${f(bx)}" cy="${h / 2}" r="${h * .44}" fill="${big}"/>`;
  if (mid) o += `<circle cx="${left ? f(w * .78) : f(w * .24)}" cy="${f(h * .7)}" r="${f(h * .27)}" fill="${mid}"/>`;
  o += `<circle cx="${left ? f(w * .2) : f(w * .82)}" cy="${f(h * .76)}" r="${f(h * .17)}" fill="${small}"/>`;
  const spots = [[60, 16], [146, 14], [190, 70], [10, 52], [112, 140], [190, 140]];
  // pick three spots with a seeded shuffle (no sort with a random comparator: engines differ)
  const pick = [0, 1, 2, 3, 4, 5];
  for (let i = pick.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pick[i], pick[j]] = [pick[j], pick[i]]; }
  pick.length = 3;
  let d = '';
  for (const i of pick) { const [x, y] = spots[i]; const s = 3.4 + r() * 1.6; d += `M${f(x * w / 200)} ${f(y * h / 150 - s)}v${f(s * 2)}M${f(x * w / 200 - s)} ${f(y * h / 150)}h${f(s * 2)}`; }
  return o + `<path d="${d}" stroke="${PAL.pink}" stroke-width="2.6" stroke-linecap="round"/>`;
}

const VESSEL_R = { bowl: 52, plate: 56, platter: 52, pan: 50, board: 48, dish: 47, jar: 46, glass: 46 };

/** The whole table scene for one meal (200 × 150). */
function scene(meal) {
  const r = rng(hash(meal.id));
  const art = meal.art && meal.art.vessel ? meal.art : { vessel: 'plate', base: 'none', items: [] };
  const kind = VESSEL_R[art.vessel] ? art.vessel : 'plate';
  const items = parseItems(art.items);
  const types = new Set(items.map((i) => i.type));
  const cat = SCENE[meal.category] ? meal.category : 'dinner';
  const [bg, big, mid, small] = SCENE[cat];
  // a plate of "oats" is a flatbread (lahouh)
  const base = art.base === 'oats' && (kind === 'plate' || kind === 'platter') ? 'bread' : art.base;
  const tall = kind === 'jar' || kind === 'glass';
  const hot = !COLD_ID.test(meal.id) && (HOT_BASES.has(base) || kind === 'pan' || [...types].some((t) => HOT_ITEMS.has(t)));
  const extra = TRAYS[meal.id] ?? (tall || cat === 'snack' ? {} : { drink: 'water', cutlery: true });
  // garnish: a few fresh herb flecks wherever the recipe has herbs
  if (!tall && (types.has('herb') || types.has('mint') || types.has('basil')) && !types.has('fleck')) items.push({ type: 'fleck', n: 10 });

  let s = 1; let mx = 100; let my = 78;
  if (extra.bowl) { s = .78; mx = 98; my = 84; }
  else if (extra.drink) { s = .84; mx = kind === 'pan' ? 96 : 103; my = 79; }
  else if (tall) { s = .86; mx = extra.dates ? 84 : 92; my = 77; }
  else { s = .9; }
  SWK = s < 1 ? Math.min(1.2, .96 / s) : 1;

  let o = `<rect width="200" height="150" fill="${bg}"/>${backdrop(r, big, mid, small)}${G_OPEN}`;
  if (hot) o += steam(mx, f(my - VESSEL_R[kind] * s - 5), cat === 'lunch' ? PAL.white : '#CFE3CE');
  o += `<g transform="translate(${mx} ${my}) scale(${s}) translate(-100 -78)" stroke-width="${f(VSW * SWK)}">${vessel(kind, base, items, r)}</g>`;
  SWK = 1;
  if (extra.bowl) o += sideBowl(172, 40, 20, extra.bowl[0], extra.bowl[1], r);
  if (extra.drink) o += drink(15, extra.bowl ? 74 : 70, extra.drink, types.has('lemon') || types.has('lime'));
  if (extra.cutlery) o += cutlery(186, 82);
  if (extra.dates) o += tall ? dates(150, 118) : dates(176, 124);
  if (tall && !extra.dates) {
    // a few of the toppings on the table beside the glass
    const loose = items.filter((it) => !DUST.has(it.type) && it.type !== 'mint').slice(0, 2).map((it) => ({ type: it.type, n: 2 }));
    o += drawItems(loose, 150, 120, 12, r, { k: .9, sx: 1.4, sy: .5 });
  }
  o += badge(30, 27);
  return `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${o}</g></svg>`;
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cache = new Map();
const G_OPEN = `<g fill="none" stroke="${OL}" stroke-width="${VSW}" stroke-linecap="round" stroke-linejoin="round">`;

/** SVG illustration for a meal summary or record. */
export function mealArt(meal, { label = true } = {}) {
  // Same picture for the same id, category and art everywhere (server and browser).
  // Everything drawn below comes from these three fields only.
  const key = `${meal.id}|${meal.category ?? ''}|${JSON.stringify(meal.art ?? null)}`;
  if (!cache.has(key)) cache.set(key, scene(meal));
  const photo = PHOTOS[meal.id];
  const alt = `${label ? 'Illustration' : 'Image'} of ${meal.name}`;
  if (photo) return `<img src="${esc(photo)}" alt="${esc(alt.replace('Illustration', 'Photo'))}" loading="lazy">`;
  return cache.get(key).replace('<svg ', `<svg role="img" aria-label="${esc(alt)}" `);
}

/** Hero still life: several dishes on a pastel table. */
export function heroArt() {
  if (HERO_PHOTO) return `<img src="${esc(HERO_PHOTO)}" alt="A table of balanced, healthy meals">`;
  const r = rng(20261019);
  const W = 640; const H = 512;
  let o = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of balanced meals: a quinoa salad bowl, salmon with asparagus, a berry yogurt bowl and a green smoothie on a pastel table" preserveAspectRatio="xMidYMid slice">`;
  o += `<rect width="${W}" height="${H}" fill="${PAL.blush}"/>${backdrop(r, PAL.rose, null, PAL.mint, W, H)}`;
  const place = (x, y, s, kind, base, items) => `<g transform="translate(${x} ${y}) scale(${s}) translate(-100 -78)">${G_OPEN}${vessel(kind, base, parseItems(items), r)}</g></g>`;
  o += place(220, 250, 2.3, 'bowl', 'quinoa', ['chickpea*7', 'cucumber*5', 'tomato-cherry*5', 'feta*4', 'avocado*2', 'herb*7']);
  o += place(470, 360, 1.9, 'plate', 'none', ['salmon*1', 'asparagus*4', 'lemon*1', 'herb*4']);
  o += place(500, 130, 1.25, 'bowl', 'yogurt', ['blueberry*6', 'strawberry*3', 'raspberry*3', 'mint*2']);
  o += place(96, 100, 1, 'glass', 'smoothie-tan', ['mint*2']);
  return `${o}</svg>`;
}


/** Small decorative botanical used in empty states and panels. */
export function botanical(cls = 'botanical') {
  let o = `<svg class="${cls}" viewBox="0 0 160 120" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M20 110 C50 80 90 50 140 14" stroke="#8DB385" stroke-width="2.5" fill="none"/>`;
  for (let i = 1; i < 7; i++) {
    const x = 20 + i * 18; const y = 110 - i * 14;
    o += leaf(x - 6, y - 8, 1.6, -60 + i * 4, i % 2 ? '#B5D3AC' : '#C9E0C1', '#8DB385') + leaf(x + 8, y + 4, 1.5, 150 - i * 4, i % 2 ? '#F6C9D2' : '#FBE1E6', '#E5A7B5');
  }
  return `${o}<circle cx="140" cy="14" r="6" fill="#F6C9D2"/></svg>`;
}

/** Abstract botanical portrait used on team cards (no likeness implied). */
export function teamPortrait(initials, variant) {
  const pal = [['#FBE1E6', '#F6C9D2', '#7A3E50'], ['#E8F3E8', '#D6E8D5', '#526B59'], ['#FFF1F4', '#F6C9D2', '#7A3E50'], ['#E8F3E8', '#C9E0C1', '#3F5646']][variant % 4];
  const r = rng(hash(initials) + variant);
  let leaves = '';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + r() * .4;
    leaves += leaf(58 + Math.cos(a) * 50, 58 + Math.sin(a) * 50, 1.7, (a * 180) / Math.PI + 90, i % 2 ? '#B5D3AC' : '#F2B9C6', i % 2 ? '#8DB385' : '#E39AAB');
  }
  return `<svg class="portrait" viewBox="0 0 116 116" role="img" aria-label="Decorative monogram ${initials}" xmlns="http://www.w3.org/2000/svg"><circle cx="58" cy="58" r="56" fill="${pal[0]}"/>${leaves}<circle cx="58" cy="58" r="36" fill="${pal[1]}"/><text x="58" y="66" text-anchor="middle" font-family="Poppins, system-ui, sans-serif" font-size="24" font-weight="600" fill="${pal[2]}">${initials}</text></svg>`;
}

export function logoMark() {
  // A Saudi date palm with dates growing from a bowl: local food and healthy eating.
  return `<svg viewBox="0 0 40 40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="19" fill="#FFF1F4"/><path d="M20 23 L20 12.5" stroke="#3F5646" stroke-width="1.8" stroke-linecap="round"/><path d="M20 12.5 C17 9.5 12.5 9.5 10 12 C13 11.8 16.5 12.2 20 14Z" fill="#D6E8D5" stroke="#3F5646" stroke-width="1.3" stroke-linejoin="round"/><path d="M20 12.5 C23 9.5 27.5 9.5 30 12 C27 11.8 23.5 12.2 20 14Z" fill="#D6E8D5" stroke="#3F5646" stroke-width="1.3" stroke-linejoin="round"/><path d="M20 12.5 C18.2 9 18.5 6.3 20 5 C21.5 6.3 21.8 9 20 12.5Z" fill="#D6E8D5" stroke="#3F5646" stroke-width="1.3" stroke-linejoin="round"/><path d="M20 13 C16.8 13.8 14.6 16 14.2 18.6 C16.4 16.2 18.2 15.2 20 14.6Z M20 13 C23.2 13.8 25.4 16 25.8 18.6 C23.6 16.2 21.8 15.2 20 14.6Z" fill="#526B59" stroke="#3F5646" stroke-width="1.1" stroke-linejoin="round"/><ellipse cx="18.2" cy="16.4" rx="1.25" ry="1.65" fill="#EDB3C0" stroke="#3F5646" stroke-width="0.9"/><ellipse cx="21.8" cy="16.4" rx="1.25" ry="1.65" fill="#EDB3C0" stroke="#3F5646" stroke-width="0.9"/><ellipse cx="20" cy="17.7" rx="1.25" ry="1.65" fill="#EDB3C0" stroke="#3F5646" stroke-width="0.9"/><path d="M9.5 22 H30.5 C30 28.5 25.6 32.5 20 32.5 C14.4 32.5 10 28.5 9.5 22Z" fill="#FFFFFF" stroke="#3F5646" stroke-width="1.8" stroke-linejoin="round"/><path d="M12.5 25 H27.5" stroke="#F6C9D2" stroke-width="1.8" stroke-linecap="round"/></svg>`;
}
