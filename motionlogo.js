// The logo as the motion design, for the website: an SVG that animates itself with CSS (it runs inside an <img>, so
// the page needs no script). The same moves as the films' Logo3 (remotion-videos/src/fizzle3/Logo3.tsx):
//   build (once, 2.4 s): the wings bubble up, the honeycomb body springs in, honey rises in the stripes, the head pops
//   in, the name writes itself stroke by stroke, the i's bubble drops in, the sting pops in bubble by bubble
//   then, for ever: the bee hovers, the wings flutter now and then, the eye blinks, the sting's bubbles bob each on
//   their own clock, and fizz rises out of the sting's tip one bubble at a time, rocking, growing and popping
// With prefers-reduced-motion it is the still logo. Used by build.js: logo.svg (lockup) and bee.svg (the bee alone).
const B = require('../../deck-src/brand');

const r = v => +(+v).toFixed(2);
const BE = B.BEE, TILT = BE.tilt * Math.PI / 180;
// a point of the bee's own (tilted) drawing in the hover group's frame
const rot = (x, y) => [x * Math.cos(TILT) - y * Math.sin(TILT), x * Math.sin(TILT) + y * Math.cos(TILT)];

// the rising bubble's path as CSS keyframes, sampled from the same formula Logo3 uses (screen up, drifting back)
function riseKeyframes() {
  const ease = (p, a, b) => { const u = Math.min(1, Math.max(0, (p - a) / (b - a))); return 1 - Math.pow(1 - u, 3); };
  const steps = [0, .07, .14, .22, .3, .38, .46, .54, .62, .7, .78, .86, .9, .94, 1];
  const RMAX = 9; // the circle is drawn at its biggest; scale shrinks it
  return steps.map(p => {
    const swell = ease(p, 0, .14), go = Math.max(0, p - .12) / .88;
    const climb = 220 * (go - .32 * (1 - Math.exp(-go * 3.2)));
    const age = p * 1.5, rock = Math.sin(age * 2 * Math.PI / .5) * 7 * Math.min(1, go * 1.6);
    const pop = ease(p, .88, 1), rad = (4.5 + 4.5 * go) * swell * (1 + .5 * pop);
    // screen up is (0, -1); back (the way the bee came from) is (-1, 0)
    const x = -26 * go + rock, y = -climb;
    return `${r(p * 100)}% { transform: translate(${r(x)}px, ${r(y)}px) scale(${r(rad / RMAX)}); opacity: ${r(1 - pop)}; }`;
  }).join(' ');
}

// the bee's parts inside a <g class="hov"> (hover); o.build: play the build first
function beeParts(o = {}) {
  const L = o.look || B.LOOK.color, [w0, w1] = BE.wings, H = BE.head;
  const hole = (c, rr) => `<circle cx="${c.x}" cy="${c.y}" r="${rr}" fill="#000"/>`;
  const mask = (id, inner) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="-400" y="-400" width="800" height="800"><rect x="-400" y="-400" width="800" height="800" fill="#fff"/>${inner}</mask>`;
  const glint = (w, k) => `<path d="${B.glintD(w)}" fill="none" stroke="#000" stroke-width="${B.glintW(w)}" stroke-linecap="round"/>`;
  const defs = `<clipPath id="bc"><path d="${BE.body}"/></clipPath>`
    + mask('mb', hole(H, H.r + BE.gap) + hole(w0, w0.r + BE.gap) + hole(w1, w1.r + BE.gap))
    + mask('m0', hole(w1, w1.r + BE.gap) + glint(w0)) + mask('m1', glint(w1));
  const sw = b => r(Math.max(3.5, b.r * .42));
  // the sting: each bubble pops in (outer group) and bobs (inner circle)
  const sting = BE.trail.map((b, i) => `<g transform="translate(${b.x} ${b.y})"><g class="sp" style="animation-delay:${r(1.0 + i * .12)}s"><circle class="sb sb${i}" r="${b.r}" fill="none" stroke="${L.wing}" stroke-width="${sw(b)}"/></g></g>`).join('');
  const body = `<g mask="url(#mb)"><g class="body"><path d="${BE.body}" fill="${L.fg}"/><g clip-path="url(#bc)">${BE.stripes.map(([a, b], i) => `<rect class="hn" style="animation-delay:${i ? .68 : .6}s" x="${a}" y="-110" width="${b - a}" height="220" fill="${L.st}"/>`).join('')}</g></g></g>`;
  const head = `<g class="head"><circle cx="${H.x}" cy="${H.y}" r="${H.r}" fill="${L.fg}"/><circle class="eye" cx="${BE.eye.x}" cy="${BE.eye.y}" r="${BE.eye.r}" fill="${L.eye}"/></g>`;
  const wing = (w, m, cls) => `<g mask="url(#${m})"><g transform="translate(${w.x} ${w.y})"><g class="${cls}"><circle class="flap" r="${w.r}" fill="${L.wing}"/></g></g></g>`;
  // the fizz out of the tip, in the hover group's (untilted) frame, so it rises straight up the screen
  const tip = BE.trail[BE.trail.length - 1], [tx, ty] = rot(tip.x - 14, tip.y + 3); // (born just past the tip)
  // (drawn 1.3 times the films' size: the site shows the logo small)
  const rising = [0, 1, 2].map(i => `<g transform="translate(${r(tx)} ${r(ty)})"><circle class="rb" style="animation-delay:${r((o.build ? 1.4 : .2) + i * .5)}s" r="${r(9 * 1.3)}" fill="none" stroke="${L.wing}" stroke-width="${r(3.8 * 1.3)}"/></g>`).join('');
  return { defs, body: `${rising}<g transform="rotate(${BE.tilt})">${sting}${body}${head}${wing(w0, 'm0', 'wbk')}${wing(w1, 'm1', 'wfr')}</g>` };
}

// the name, stroke by stroke, in writing order (as Logo3)
function wordParts() {
  const L = B.LOOK.color, P = B.wordParts({ lig: true }), out = [];
  let at = .8;
  for (const l of P.letters) {
    for (const d of l.d) for (const sub of d.split(/(?=M)/)) { out.push(`<path class="ln" style="animation-delay:${r(at)}s" transform="translate(${l.x} 0)" d="${sub}" pathLength="1"/>`); at += .07; }
    if (l.ch === 'l') {
      out.push(`<path class="ln" style="animation-delay:${r(at)}s" transform="translate(${P.e.x} 0)" d="${P.e.bowl}" pathLength="1" stroke-linecap="butt"/>`);
      out.push(`<g transform="translate(${P.e.x} 0)"><path class="ln" style="animation-delay:${r(at + .12)}s" d="${P.e.bar}" pathLength="1" stroke-linecap="butt" stroke-width="${P.eb}" clip-path="url(#eb)"/></g>`);
      var eEnd = at + .34;
    }
  }
  const eo = P.e.outer;
  const defs = `<clipPath id="eb"><ellipse cx="${eo[0]}" cy="${eo[1]}" rx="${eo[2]}" ry="${eo[3]}"/></clipPath>`;
  const body = `<g fill="none" stroke="${L.fg}" stroke-width="${P.sw}" stroke-linecap="round" stroke-linejoin="round">${out.join('')}</g>`
    + `<circle class="pt" style="animation-delay:${r(eEnd)}s" cx="${r(P.e.x + P.e.end[0])}" cy="${P.e.end[1]}" r="${P.sw / 2}" fill="${L.fg}"/>`
    + `<circle class="dot" cx="${P.dot.x}" cy="${P.dot.y}" r="${P.dot.r}" fill="none" stroke="${L.wing}" stroke-width="${P.dot.w}"/>`;
  return { defs, body };
}

const CSS = build => `
.hov { animation: hover 2.6s ease-in-out ${build ? 2.2 : 0}s infinite; }
@keyframes hover { 50% { transform: translateY(-5px); } }
.body, .head, .wbk, .wfr, .sp, .pt, .dot, .hn, .eye, .flap, .sb, .rb { transform-box: fill-box; transform-origin: center; }
.hn, .flap { transform-origin: 50% 100%; }
.flap { animation: flap 3s ease-in-out ${build ? 2.6 : .4}s infinite; }
@keyframes flap { 0%, 78%, 100% { transform: none; } 82% { transform: scaleY(.78); } 86% { transform: none; } 90% { transform: scaleY(.84); } 94% { transform: none; } }
.eye { animation: blink 4.2s ${build ? 1.9 : .8}s infinite; }
@keyframes blink { 0%, 93%, 100% { transform: none; } 96% { transform: scaleY(.1); } }
.sb { animation: bob 1.5s ease-in-out infinite; }
.sb1 { animation-duration: 2s; animation-delay: -.7s; }
.sb2 { animation-duration: 1s; animation-delay: -.3s; }
@keyframes bob { 25% { transform: translate(1.6px, -1.2px) scale(1.05); } 75% { transform: translate(-1.4px, 1.2px) scale(.96); } }
.rb { opacity: 0; animation: rise 1.5s linear infinite; }
@keyframes rise { ${riseKeyframes()} }
${build ? `
.body { animation: bodyin .5s cubic-bezier(.16, 1, .3, 1) .35s both; }
@keyframes bodyin { 0% { transform: rotate(-28deg) scale(0); } 65% { transform: rotate(-3deg) scale(1.07); } 100% { transform: none; } }
.hn { animation: honey .4s cubic-bezier(.65, 0, .35, 1) both; }
@keyframes honey { from { transform: scaleY(0); } }
.head { animation: popin .3s cubic-bezier(.16, 1, .3, 1) .7s both; }
.wfr { animation: wingrise .55s cubic-bezier(.65, 0, .35, 1) both; }
@keyframes wingrise { 0% { transform: translateY(300px) scale(0); } 20% { transform: translateY(240px) scale(.55); } 100% { transform: none; } }
.wbk { animation: popin .35s cubic-bezier(.16, 1, .3, 1) .45s both; }
.sp { animation: popin .3s cubic-bezier(.16, 1, .3, 1) both; }
.pt { animation: popin .12s linear both; }
.dot { animation: dotin .3s cubic-bezier(.16, 1, .3, 1) 1.4s both; }
@keyframes dotin { from { transform: translateY(-30px) scale(0); } }
@keyframes popin { 0% { transform: scale(0); } 70% { transform: scale(1.08); } 100% { transform: none; } }
.ln { animation: draw .34s cubic-bezier(.65, 0, .35, 1) both; }
@keyframes draw { 0% { stroke-dasharray: 1 2; stroke-dashoffset: 1; opacity: 0; } 1% { opacity: 1; } 100% { stroke-dasharray: 1 2; stroke-dashoffset: 0; opacity: 1; } }` : ''}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;

// the horizontal lockup (no slogan), built then alive; the view box is centred on the name, so it sits level with
// the text beside it, and leaves room above and behind the bee for the rising fizz
async function lockup() {
  const hb = await B.horizontalBee(), box = (await B.horizontal(B.LOOK.color, { id: 'ml' })).box, bee = beeParts({ build: true }), word = wordParts();
  const top = -258, bottom = 99, x0 = box.x - 44, x1 = box.x + box.w + 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x0)} ${top} ${r(x1 - x0)} ${bottom - top}" width="${r(x1 - x0)}" height="${bottom - top}"><title>Fizzle</title>`
    + `<style>${CSS(true)}</style><defs>${bee.defs}${word.defs}</defs>`
    + `<g transform="translate(${r(hb.tx)} ${r(hb.ty)}) scale(${r(hb.k * 1000) / 1000})"><g class="hov">${bee.body}</g></g>${word.body}</svg>`;
}
// the bee alone (for the hero), alive from the start; on the cream page it takes the cream look (orange wings and fizz)
async function beeOnly(look = B.LOOK.cream) {
  const L = look, b = await B.measure(B.bee(L, { trail: false, id: 'mm' })), k = 300 / b.h, bee = beeParts({ look });
  const tx = -(b.x + b.w / 2) * k, ty = -(b.y + b.h / 2) * k;
  // the bee with its sting, and room above and behind it for the fizz to rise and pop
  const t = await B.measure(B.bee(L, { trail: true, id: 'mt' })), x0 = t.x * k + tx - 48, x1 = (t.x + t.w) * k + tx + 10, y0 = t.y * k + ty - 190, y1 = (t.y + t.h) * k + ty + 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x0)} ${r(y0)} ${r(x1 - x0)} ${r(y1 - y0)}" width="${r(x1 - x0)}" height="${r(y1 - y0)}">`
    + `<style>${CSS(false)}</style><defs>${bee.defs}</defs>`
    + `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(k * 1000) / 1000})"><g class="hov">${bee.body}</g></g></svg>`;
}

module.exports = { lockup, beeOnly };
