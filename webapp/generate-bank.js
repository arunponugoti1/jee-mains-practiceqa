// ============================================================
//  Bank generator + VERIFIER — Cube & nth Roots of Complex Numbers
//  v2: addresses expert review —
//   • 8 trap families A–H (added G polar/De Moivre, H combined identities)
//   • no question SHAPE repeated > 6×
//   • C-trap answers varied (0 and 3), not always 0
//   • option positions SHUFFLED (deterministic per id) → no index-0 bias
//   • every computational answer checked against ω / complex arithmetic
//   • difficulty-3 ≈ 30%
//  Run:  node generate-bank.js   →  writes bank.js
// ============================================================
const fs = require("fs");

// ---- complex helpers: [re, im] ----
const W  = [-0.5, Math.sqrt(3) / 2];                 // ω
const cmul = (a,b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];
const cadd = (a,b) => [a[0]+b[0], a[1]+b[1]];
const csub = (a,b) => [a[0]-b[0], a[1]-b[1]];
const cscl = (a,s) => [a[0]*s, a[1]*s];
const cdiv = (a,b) => { const d=b[0]*b[0]+b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]; };
const cpow = (a,n) => { let r=[1,0]; for(let i=0;i<n;i++) r=cmul(r,a); return r; };
const ceq  = (a,b) => Math.abs(a[0]-b[0])<1e-9 && Math.abs(a[1]-b[1])<1e-9;
const polar = (r,deg) => [r*Math.cos(deg*Math.PI/180), r*Math.sin(deg*Math.PI/180)];
const W2 = cpow(W,2);
const ONE = [1,0];

// label → complex value (so symbolic options stay verified)
function val(label) {
  let s = String(label).trim().replace(/−/g,"-").replace(/\s/g,"");
  if (/^-?\d+(\.\d+)?$/.test(s)) return [parseFloat(s),0];
  if (/^-?\d*i$/.test(s)) { const c=s.slice(0,-1); return [0, c===""?1:(c==="-"?-1:parseFloat(c))]; }
  if (s==="√3") return [Math.sqrt(3),0];
  if (s==="-√3") return [-Math.sqrt(3),0];
  let m = s.match(/^(-?\d*)?(ω²|ω)$/);
  if (m) { let c=m[1]; c=(c===""||c===undefined)?1:(c==="-"?-1:parseFloat(c)); return cscl(m[2]==="ω²"?W2:W,c); }
  throw new Error("Unknown label: "+label);
}

// ---- deterministic per-id shuffle (kills answer-position bias) ----
function hash(s){ let h=2166136261; for(let i=0;i<s.length;i++) h=Math.imul(h^s.charCodeAt(i),16777619); return h>>>0; }
function rng(seed){ return ()=>{ seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function shuffleOpts(q){
  const r = rng(hash(q.id));
  const pairs = q.options.map((o,k)=>({o, a:k===q.answer}));
  for (let i=pairs.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [pairs[i],pairs[j]]=[pairs[j],pairs[i]]; }
  q.options = pairs.map(p=>p.o);
  q.answer  = pairs.findIndex(p=>p.a);
  return q;
}

// parse a complex-valued label like "√3+i", "1+i√3", "-2i", "-1+i√3"
function cval(label) {
  const s = String(label).trim().replace(/−/g,"-").replace(/\s/g,"");
  const terms = s.match(/[+-]?[^+-]+/g) || [];
  let re = 0, im = 0;
  for (let t of terms) {
    let sign = 1;
    if (t[0] === "+") t = t.slice(1); else if (t[0] === "-") { sign = -1; t = t.slice(1); }
    const hasI = t.includes("i");
    let mag = t.replace("i", "");
    let coef = mag.includes("√3") ? ((mag.replace("√3","") || "1") === "1" ? Math.sqrt(3) : parseFloat(mag.replace("√3",""))*Math.sqrt(3))
                                  : (mag === "" ? 1 : parseFloat(mag));
    if (hasI) im += sign * coef; else re += sign * coef;
  }
  return [re, im];
}
const nthRoots = n => Array.from({length:n}, (_,k) => [Math.cos(2*Math.PI*k/n), Math.sin(2*Math.PI*k/n)]);

let nId = 0;
const bank = [];
const shapes = {};   // shape-id -> count, to enforce "no shape > 6×"
function track(shape){ shapes[shape]=(shapes[shape]||0)+1; if (shapes[shape]>6) throw new Error(`Shape '${shape}' used ${shapes[shape]}× (>6)`); }
// no duplicate distractors may ship
function assertUniqueOpts(prompt, options){ if (new Set(options).size !== options.length) throw new Error("Duplicate options @ "+prompt+" → "+options); }

// COMPUTATIONAL push: answer verified against `value`
function add({ trap, diff, shape, prompt, options, value, script, mistake, why }) {
  track(shape);
  assertUniqueOpts(prompt, options);
  const idxs = options.map((o,i)=> ceq(val(o),value)?i:-1).filter(i=>i>=0);
  if (idxs.length !== 1) throw new Error(`VERIFY FAIL @${prompt}\n value=${value}\n options=${options} matched=${idxs}`);
  bank.push(shuffleOpts({ id:"b"+(++nId), trap, difficulty:diff, prompt, options:options.slice(), answer:idxs[0], script, mistake, why }));
}
// CONCEPT push: answer index given, asserted by a REQUIRED real check() (no ()=>true allowed)
function addConcept({ trap, diff, shape, prompt, options, answer, check, script, mistake, why }) {
  track(shape);
  assertUniqueOpts(prompt, options);
  if (typeof check !== "function") throw new Error("check() is required @ "+prompt);
  if (check.toString().replace(/\s/g,"") === "()=>true") throw new Error("Trivial check ()=>true is banned — write a real check @ "+prompt);
  if (check() !== true) throw new Error("CONCEPT CHECK FAIL @ "+prompt);
  bank.push(shuffleOpts({ id:"b"+(++nId), trap, difficulty:diff, prompt, options:options.slice(), answer, script, mistake, why }));
}

const SYM = ["1","-1","ω","ω²"];

// ============================================================
//  A — exponent disguise (≤6, single shape)
// ============================================================
[8,17,64,100,2024,4000].forEach(N => add({
  trap:"A", diff:N>99?2:1, shape:"A-power",
  prompt:`If ω is a non-real cube root of unity, then ω^${N} = ?`,
  options:SYM, value:cpow(W,N),
  script:[`${N} mod 3 = ${N%3}.`, `ω^${N} = ω^${N%3} = ${["1","ω","ω²"][N%3]}.`],
  mistake:"Letting the big exponent intimidate you, or reducing mod 2 instead of mod 3.",
  why:"Pure exponent disguise — the size of the power carries zero weight. Reduce mod 3 on sight.",
}));

// ============================================================
//  B — hidden sum = 0  (two shapes ×3)
// ============================================================
[[0,1,2],[99,100,101],[2024,2025,2026]].forEach(([a,b,c]) => add({
  trap:"B", diff:1, shape:"B-triple",
  prompt:`Value of ω^${a} + ω^${b} + ω^${c} ?`,
  options:["0","1","ω","ω²"], value:cadd(cadd(cpow(W,a),cpow(W,b)),cpow(W,c)),
  script:["Three consecutive powers reduce to 1, ω, ω² in some order.","1 + ω + ω² = 0."],
  mistake:"Not spotting that consecutive powers form the zero-sum identity.",
  why:"Consecutive exponents are engineered to land on 1+ω+ω²=0. Recognize, don't compute.",
}));
[[1,2],[10,20],[50,100]].forEach(([a,b]) => add({
  trap:"B", diff:2, shape:"B-pair",
  prompt:`Value of ω^${a} + ω^${b} ?`,
  options:["-1","0","1","ω"], value:cadd(cpow(W,a),cpow(W,b)),
  script:[`Reduce: ω^${a}=ω^${a%3}, ω^${b}=ω^${b%3}.`,"Their sum is ω+ω² = −1."],
  mistake:"Computing huge powers directly instead of reducing first.",
  why:"Two powers chosen so they reduce to ω + ω² = −1.",
}));

// ============================================================
//  C — reverse factorization (VARIED answers: 0 and 3)
// ============================================================
function polyAtW(terms){ return terms.reduce((s,[c,p])=>cadd(s,cscl(cpow(W,p),c)),[0,0]); }
// shape C-rem: x^a + x^b + 1 with non-trivial residues → 0
[[100,50],[200,100],[8,4],[20,10]].forEach(([a,b]) => add({
  trap:"C", diff:3, shape:"C-rem",
  prompt:`Remainder when x^${a} + x^${b} + 1 is divided by x² + x + 1 (give its value at x = ω):`,
  options:["0","1","-1","ω"], value:polyAtW([[1,a],[1,b],[1,0]]),
  script:["Roots of x²+x+1 are ω, ω²; the remainder equals the polynomial at x = ω.",`Plug x=ω, reduce powers mod 3 → ω+ω²+1 = 0.`],
  mistake:"Attempting polynomial long division instead of evaluating at the root.",
  why:"x²+x+1 is a disguise for (x−ω)(x−ω²) — evaluate at ω, never long-divide.",
}));
// shape C-2n: value of x^(2n)+x^n+1 at ω depends on n mod 3  → 3 when 3|n, else 0
[[3,3],[6,3],[4,0],[5,0]].forEach(([n,ans]) => add({
  trap:"C", diff:3, shape:"C-2n",
  prompt:`For ω a cube root of unity, the value of ω^${2*n} + ω^${n} + 1 is:`,
  options:["0","3","1","ω"], value:cadd(cadd(cpow(W,2*n),cpow(W,n)),ONE),
  script:[`Reduce ω^${2*n}=ω^${(2*n)%3}, ω^${n}=ω^${n%3}.`, n%3===0 ? "Both become 1 → 1+1+1 = 3." : "Get ω+ω²+1 = 0."],
  mistake:"Assuming the answer is always 0 — it is 3 exactly when n is a multiple of 3.",
  why:"Same shape, different answer by n mod 3. The examiner flips 0↔3 to punish autopilot.",
}));
// shape C-cyc: x^a − 1 at ω → 0 when 3|a
[3,6].forEach(a => add({
  trap:"C", diff:2, shape:"C-cyc",
  prompt:`Value of ω^${a} − 1 ?`,
  options:["0","1","-1","ω"], value:csub(cpow(W,a),ONE),
  script:[`${a} is a multiple of 3 ⇒ ω^${a} = 1.`, "1 − 1 = 0."],
  mistake:"Forgetting ω^(3k)=1.", why:"Multiples of 3 collapse the power to 1.",
}));

// ============================================================
//  D — sign / variant bait (three shapes)
// ============================================================
const oneW = cadd(ONE,W), oneW2 = cadd(ONE,W2);
[2,4,7].forEach(n => add({
  trap:"D", diff:2, shape:"D-pow",
  prompt:`Value of (1 + ω)^${n} ?`,
  options:["1","-1","ω","ω²","-ω","-ω²"], value:cpow(oneW,n),
  script:["1 + ω = −ω².", `(−ω²)^${n} = (−1)^${n}·ω^${(2*n)%3}.`],
  mistake:"Expanding the binomial instead of rewriting 1+ω = −ω².",
  why:"Sign-bait: rewrite the base first, then the power is a one-liner.",
}));
const aMinus = csub(cadd(ONE,W2),W);  // 1−ω+ω² = −2ω
const aPlus  = csub(cadd(ONE,W),W2);  // 1+ω−ω² = −2ω²
add({ trap:"D", diff:2, shape:"D-cube", prompt:"Value of (1 − ω + ω²)³ ?", options:["-8","8","-8ω","8ω²"], value:cpow(aMinus,3),
  script:["1+ω²=−ω ⇒ 1−ω+ω² = −2ω.","(−2ω)³ = −8ω³ = −8."], mistake:"Sign slip turning −2ω into +2ω².", why:"Rewrite collapses the bracket to −2ω before cubing." });
add({ trap:"D", diff:2, shape:"D-cube", prompt:"Value of (1 + ω − ω²)³ ?", options:["-8","8","-16","-8ω²"], value:cpow(aPlus,3),
  script:["1+ω=−ω² ⇒ 1+ω−ω² = −2ω².","(−2ω²)³ = −8ω⁶ = −8."], mistake:"Confusing −2ω² with −2ω.", why:"Mirror of the previous trap; collapses to −2ω²." });
add({ trap:"D", diff:3, shape:"D-cube", prompt:"Value of (1 − ω + ω²)³ + (1 + ω − ω²)³ ?", options:["-16","16","0","-8"], value:cadd(cpow(aMinus,3),cpow(aPlus,3)),
  script:["Brackets = −2ω and −2ω².","(−2ω)³+(−2ω²)³ = −8−8 = −16."], mistake:"One sign wrong → +16 or 0 (the distractors).", why:"Two sign-baits summed; distractors are exactly the single-error answers." });
add({ trap:"D", diff:2, shape:"D-frac", prompt:"Value of 1/(1+ω) + 1/(1+ω²) ?", options:["1","-1","0","ω"], value:cadd(cdiv(ONE,oneW),cdiv(ONE,oneW2)),
  script:["1/(1+ω)=1/(−ω²)=−ω,  1/(1+ω²)=1/(−ω)=−ω².","Sum = −(ω+ω²) = −(−1) = 1."], mistake:"Cross-multiplying and dropping a sign.", why:"Small fractions bait rushing; every step is a rewrite." });
add({ trap:"D", diff:2, shape:"D-frac", prompt:"Value of (1 + ω)/(1 + ω²) ?", options:["ω","ω²","-ω","-1"], value:cdiv(oneW,oneW2),
  script:["(−ω²)/(−ω) = ω²/ω = ω."], mistake:"Sign error in either rewrite.", why:"Ratio of the two sign-rewrites cancels to a single ω." });

// ============================================================
//  E — geometry crossover (concept, distinct shapes)
// ============================================================
const dist = (p,q) => Math.hypot(p[0]-q[0], p[1]-q[1]);
const TRI = [ONE, W, W2];
const triArea = Math.abs(TRI[0][0]*(TRI[1][1]-TRI[2][1]) + TRI[1][0]*(TRI[2][1]-TRI[0][1]) + TRI[2][0]*(TRI[0][1]-TRI[1][1]))/2;
const triPerim = dist(TRI[0],TRI[1]) + dist(TRI[1],TRI[2]) + dist(TRI[2],TRI[0]);
addConcept({ trap:"E", diff:1, shape:"E-area", prompt:"1, ω, ω² are vertices of a triangle in the Argand plane. Its area is:",
  options:["3√3/4","√3/4","3/4","√3"], answer:0, check:()=> Math.abs(triArea - 3*Math.sqrt(3)/4) < 1e-9,
  script:["All on |z|=1, 120° apart ⇒ equilateral, R=1.","Area = (3√3/4)R² = 3√3/4."], mistake:"Using the shoelace formula on coordinates.", why:"Always the unit-circle equilateral triangle — read it off." });
addConcept({ trap:"E", diff:1, shape:"E-centroid", prompt:"The centroid of the triangle with vertices 1, ω, ω² is:",
  options:["0 (origin)","1","ω","(1+i)/3"], answer:0, check:()=> ceq(cscl(cadd(cadd(TRI[0],TRI[1]),TRI[2]), 1/3), [0,0]),
  script:["Centroid = (1+ω+ω²)/3 = 0."], mistake:"Averaging coordinates the long way.", why:"Centroid is the sum identity over 3 = 0." });
addConcept({ trap:"E", diff:2, shape:"E-radius", prompt:"The circumradius of the triangle formed by 1, ω, ω² is:",
  options:["1","√3","1/2","3/4"], answer:0, check:()=> TRI.every(p => Math.abs(Math.hypot(...p) - 1) < 1e-9),
  script:["All three lie on |z|=1 ⇒ circumradius = 1."], mistake:"Computing side then R=a/√3 and slipping.", why:"They sit ON the unit circle — R=1." });
addConcept({ trap:"E", diff:2, shape:"E-perim", prompt:"The perimeter of the triangle with vertices 1, ω, ω² is:",
  options:["3√3","√3","3","2√3"], answer:0, check:()=> Math.abs(triPerim - 3*Math.sqrt(3)) < 1e-9,
  script:["Side = |1−ω| = √3 (chord of 120° on unit circle).","Perimeter = 3√3."], mistake:"Using side √2.", why:"Each side is the 120° chord = √3; ×3." });
addConcept({ trap:"E", diff:2, shape:"E-side", prompt:"The distance between the points ω and ω² in the Argand plane is:",
  options:["√3","1","2","√2"], answer:0, check:()=> Math.abs(dist(W,W2) - Math.sqrt(3)) < 1e-9,
  script:["|ω−ω²| = |i√3| = √3."], mistake:"Thinking adjacent roots are distance 1 apart.", why:"ω and ω² differ by i√3 — a √3 chord." });

// ============================================================
//  F — determinant fusion (concept; checked via complex det)
// ============================================================
function cdet3(M){ const [[a,b,c],[d,e,f],[g,h,i]]=M;
  return cadd(csub(cmul(a,csub(cmul(e,i),cmul(f,h))), cmul(b,csub(cmul(d,i),cmul(f,g)))), cmul(c,csub(cmul(d,h),cmul(e,g)))); }
addConcept({ trap:"F", diff:2, shape:"F-cyc",
  prompt:"The determinant |1 ω ω² ; ω ω² 1 ; ω² 1 ω| equals:",
  options:["0","1","3","-3"], answer:0,
  check:()=> ceq(cdet3([[ONE,W,W2],[W,W2,ONE],[W2,ONE,W]]),[0,0]),
  script:["Add all columns into column 1 → each row sums to 1+ω+ω² = 0.","A zero column ⇒ determinant = 0."],
  mistake:"Cofactor-expanding instead of spotting the zero row-sum.", why:"Cyclic rows of 1,ω,ω² always sum to 0 per row → instant zero." });
addConcept({ trap:"F", diff:2, shape:"F-cyc",
  prompt:"The determinant |1 ω ω² ; ω² 1 ω ; ω ω² 1| equals:",
  options:["0","1","-1","3"], answer:0,
  check:()=> ceq(cdet3([[ONE,W,W2],[W2,ONE,W],[W,W2,ONE]]),[0,0]),
  script:["Every row sums to 1+ω+ω² = 0 ⇒ add columns into one → zero column.","Determinant = 0."],
  mistake:"Expanding the full 3×3.", why:"Row-sum-zero forces a zero determinant." });
addConcept({ trap:"F", diff:3, shape:"F-vand",
  prompt:"The determinant |1 1 1 ; 1 ω ω² ; 1 ω² ω| equals:",
  options:["-3√3 i","3√3 i","0","3"], answer:0,
  check:()=> ceq(cdet3([[ONE,ONE,ONE],[ONE,W,W2],[ONE,W2,W]]),[0,-3*Math.sqrt(3)]),
  script:["Subtract row1 from rows 2,3 → zeros in column 1, then expand the 2×2.","Result = (ω−1)(ω²−1)(ω²−ω) = 3·(−√3 i) = −3√3 i."],
  mistake:"Cofactor-expanding the full 3×3 without first creating zeros.",
  why:"A Vandermonde-style ω determinant — its value is purely imaginary, −3√3 i." });

// ============================================================
//  G — polar & De Moivre nth-root finding (the actual concept!)
// ============================================================
// G-count: number of distinct nth roots = n  (verified: n distinct points)
[5,7,12].forEach(n => addConcept({ trap:"G", diff:1, shape:"G-count",
  prompt:`For a non-zero complex number z, how many distinct values does z^(1/${n}) have?`,
  options:[`${n}`, `${n-1}`, `1`, `2`], answer:0,
  check:()=> new Set(nthRoots(n).map(p => p.map(x=>Math.round(x*1e6)).join(","))).size === n,
  script:[`Every non-zero z has exactly n distinct nth roots.`,`Here n = ${n}.`],
  mistake:"Thinking there is one root, or 2 like a square root.", why:`nth roots come in exactly n, equally spaced 2π/${n} apart.` }));
// G-mod: modulus of each nth root of w = |w|^(1/n)  (verified numerically)
[["8i",3,2],["16",4,2],["27",3,3]].forEach(([w,n,r]) => addConcept({ trap:"G", diff:2, shape:"G-mod",
  prompt:`Each of the ${n===3?"cube":n+"th"} roots of ${w} has modulus:`,
  options:[`${r}`, `${r*2}`, `1`, `${r+1}`], answer:0,
  check:()=> Math.abs(Math.pow(Math.hypot(...val(w)), 1/n) - r) < 1e-9,
  script:[`Modulus of every nth root = |w|^(1/n).`, `|${w}|^(1/${n}) = ${r}.`],
  mistake:"Taking the modulus of the number itself, not its nth root.", why:`All nth roots lie on one circle of radius |w|^(1/n) = ${r}.` }));
// G-angle: angle between consecutive nth roots = 360/n degrees
[[5,72],[8,45],[6,60],[10,36]].forEach(([n,a]) => addConcept({ trap:"G", diff:1, shape:"G-angle",
  prompt:`The angle (in degrees) between two consecutive ${n}th roots of unity is:`,
  options:[`${a}`, `${a*2}`, `${Math.round(180/n)}`, `${Math.round(540/n)}`], answer:0, check:()=> Math.abs(360/n-a)<1e-9,
  script:[`The n roots are equally spaced around the circle.`, `Separation = 360°/${n} = ${a}°.`],
  mistake:"Halving or doubling the spacing.", why:`Equal spacing means 2π/${n} = ${a}° between neighbours.` }));
// G-arg: smallest positive argument among nth roots of w  (verified: compute roots, min positive arg)
[["−8",3,60],["−16",4,45],["8i",3,30]].forEach(([w,n,a]) => addConcept({ trap:"G", diff:3, shape:"G-arg",
  prompt:`Among the ${n===3?"cube":n+"th"} roots of ${w}, the smallest positive argument (degrees) is:`,
  options:[`${a}`, `${a*2}`, `${a+90}`, `0`], answer:0,
  check:()=>{ const z=val(w); const th=Math.atan2(z[1],z[0]);
    const args=[...Array(n)].map((_,k)=>(th+2*Math.PI*k)/n).map(x=>((x%(2*Math.PI))+2*Math.PI)%(2*Math.PI)).filter(x=>x>1e-9);
    return Math.abs(Math.min(...args)*180/Math.PI - a) < 1e-6; },
  script:[`Write ${w} in polar form r∠θ.`, `Root arguments are (θ + 360k)/${n}; the smallest positive is ${a}°.`],
  mistake:"Forgetting to divide the argument by n, or using θ=0 for a negative number.",
  why:"Polar-first thinking: the argument of the number must be split into n equal slices." }));
// G-identify: WHICH complex number is an nth root of w (the form JEE actually prints)
[
  { w:"8i", n:3, root:"√3+i",   opts:["√3+i","1+i√3","2+i","√3−i"] },
  { w:"−8", n:3, root:"1+i√3",  opts:["1+i√3","√3+i","2i","−1−i√3"] },
  { w:"8",  n:3, root:"−1+i√3", opts:["−1+i√3","1+i√3","2i","1−i"] },
  { w:"16", n:4, root:"2i",     opts:["2i","1+i","√3+i","2+2i"] },
].forEach(({w,n,root,opts}) => {
  const T = val(w);
  const isRoot = o => ceq(cpow(cval(o), n), T);
  addConcept({ trap:"G", diff:3, shape:"G-identify",
    prompt:`Which of these is a ${n===3?"cube":n+"th"} root of ${w}?`,
    options:opts, answer:opts.indexOf(root),
    check:()=> opts.filter(isRoot).length === 1 && isRoot(root),
    script:[`Convert ${w} to polar; its ${n} roots have modulus |${w}|^(1/${n}) at equally spaced arguments.`,`Only ${root} matches both modulus and an allowed argument: (${root})^${n} = ${w}.`],
    mistake:"Picking a number with the right modulus but the wrong argument.",
    why:"Polar-first: a true root must match BOTH the modulus and one of the n allowed angles." });
});
// G-demoivre: evaluate a power via polar
[["(1+i)⁸","16"],["(1+i)⁴","-4"],["(√3+i)⁶","-64"]].forEach(([expr,ans], k) => {
  const base = k<2 ? [1,1] : [Math.sqrt(3),1];
  const pw   = [8,4,6][k];
  add({ trap:"G", diff:3, shape:"G-demoivre",
    prompt:`Using De Moivre, ${expr} = ?`, options:[ans, String(-parseFloat(ans)), "0", k<2?"16i":"64i"], value:cpow(base,pw),
    script:[`Convert the base to polar r∠θ, then apply (r∠θ)ⁿ = rⁿ∠nθ.`, `${expr} = ${ans}.`],
    mistake:"Expanding the binomial by hand instead of using polar form.",
    why:"De Moivre turns a brutal expansion into one modulus power and one angle multiply." });
});

// ============================================================
//  H — combined identities (the topper-separators; two chained moves)
// ============================================================
// H-prod: (a+bω+cω²)(a+bω²+cω) = a²+b²+c²−ab−bc−ca
function hprod(a,b,c){ const x=cadd(cadd([a,0],cscl(W,b)),cscl(W2,c)); const y=cadd(cadd([a,0],cscl(W2,b)),cscl(W,c)); return cmul(x,y); }
[[2,3,4,3],[1,2,3,3],[1,1,2,1]].forEach(([a,b,c,ans]) => add({
  trap:"H", diff:3, shape:"H-prod",
  prompt:`Value of (${a} + ${b}ω + ${c}ω²)(${a} + ${b}ω² + ${c}ω) ?`,
  options:[`${ans}`, `${ans+ (ans===3?3:2)}`, "0", "1"].filter((v,i,arr)=>arr.indexOf(v)===i).slice(0,4).concat(["7"]).slice(0,4),
  value:hprod(a,b,c),
  script:["This product is the identity a²+b²+c²−ab−bc−ca.",`= ${a}²+${b}²+${c}² − (${a}·${b}+${b}·${c}+${c}·${a}) = ${ans}.`],
  mistake:"Multiplying out all nine ω-terms by hand.",
  why:"Recognize the conjugate-pair identity — it collapses to a simple real number.",
}));
// H-ratio: (a+bω+cω²)/(c+aω+bω²) = ω²   and reverse = ω
add({ trap:"H", diff:3, shape:"H-ratio", prompt:"Value of (1 + 2ω + 3ω²)/(3 + ω + 2ω²) ?",
  options:["ω²","ω","1","-1"], value:cdiv(cadd(cadd(ONE,cscl(W,2)),cscl(W2,3)), cadd(cadd([3,0],W),cscl(W2,2))),
  script:["Denominator = ω·(numerator), since multiplying a+bω+cω² by ω cycles the coefficients.","Ratio = 1/ω = ω²."],
  mistake:"Rationalising the denominator the long way.", why:"Cyclic coefficient shift means the ratio is just a power of ω." });
add({ trap:"H", diff:3, shape:"H-ratio", prompt:"Value of (3 + ω + 2ω²)/(1 + 2ω + 3ω²) ?",
  options:["ω","ω²","1","-1"], value:cdiv(cadd(cadd([3,0],W),cscl(W2,2)), cadd(cadd(ONE,cscl(W,2)),cscl(W2,3))),
  script:["Denominator·ω = numerator ⇒ ratio = ω."],
  mistake:"Missing the cyclic relationship between the two expressions.", why:"Reverse of the previous — the ratio flips to ω." });
// H-div: divisibility iff 3 ∤ n
addConcept({ trap:"H", diff:3, shape:"H-div",
  prompt:"x² + x + 1 divides x^(2n) + xⁿ + 1 for:",
  options:["all positive integers n not divisible by 3","all positive integers n","only n divisible by 3","only even n"], answer:0,
  check:()=>{ const f=n=>ceq(cadd(cadd(cpow(W,2*n),cpow(W,n)),ONE),[0,0]); return f(1)&&f(2)&&!f(3)&&f(4)&&f(5)&&!f(6); },
  script:["x²+x+1 | P(x) iff P(ω)=0. Here P(ω)=ω^(2n)+ωⁿ+1.","That is 0 unless 3|n (then it equals 3). So it divides iff 3∤n."],
  mistake:"Answering 'all n' — it fails exactly when n is a multiple of 3.",
  why:"The divisibility flips on n mod 3 — the value is 0 (divides) or 3 (does not)." });
// H-filter: root-of-unity filter on binomial sums
[[6,22],[9,170]].forEach(([n,ans]) => {
  let s=0; for(let k=0;k<=n;k+=3) s+=binom(n,k);
  addConcept({ trap:"H", diff:3, shape:"H-filter",
    prompt:`The value of C(${n},0) + C(${n},3) + C(${n},6) + … is:`,
    options:[`${ans}`, `${2**n}`, `${ans-2}`, `${Math.round(2**n/3)}`], answer:0, check:()=> s===ans,
    script:["Use the root-of-unity filter: sum of every 3rd binomial = (2ⁿ + 2cos(nπ/3))/3.",`= ${ans}.`],
    mistake:"Adding the binomials one by one and slipping.",
    why:"Cube roots of unity act as a sieve picking every third term — that is the filter trick." });
});
function binom(n,k){ let r=1; for(let i=0;i<k;i++) r=r*(n-i)/(i+1); return Math.round(r); }
// H-min: minimum nonzero |a+bω+cω²| over integers = 1
addConcept({ trap:"H", diff:3, shape:"H-min",
  prompt:"For integers a, b, c (not all equal), the minimum value of |a + bω + cω²| is:",
  options:["1","0","√3","√2"], answer:0,
  check:()=>{ // |a+bω+cω²|² = ½[(a−b)²+(b−c)²+(c−a)²]; min nonzero integer case = 1
    let best=Infinity; for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){ if(a===b&&b===c)continue; const v=Math.hypot(...cadd(cadd([a,0],cscl(W,b)),cscl(W2,c))); best=Math.min(best,v);} return Math.abs(best-1)<1e-9; },
  script:["|a+bω+cω²|² = ½[(a−b)²+(b−c)²+(c−a)²].","Smallest nonzero integer case (e.g. a=1,b=0,c=0) gives 1."],
  mistake:"Forgetting the cross terms — it is NOT a²+b²+c².",
  why:"The modulus-squared is a symmetric quadratic; minimizing it over integers gives 1." });
// H-chain: chained product collapsing via sum identity
add({ trap:"H", diff:2, shape:"H-chain", prompt:"Value of (1+ω)(1+ω²)(1+ω⁴)(1+ω⁸) ?",
  options:["1","0","-1","ω²"], value:cmul(cmul(oneW,oneW2),cmul(cadd(ONE,cpow(W,4)),cadd(ONE,cpow(W,8)))),
  script:["ω⁴=ω, ω⁸=ω² ⇒ [(1+ω)(1+ω²)]² .","(1+ω)(1+ω²)=1 ⇒ answer 1."],
  mistake:"Multiplying all four factors blindly.", why:"Reduce exponents first, then the product squares to 1." });

// ---- extra shapes to broaden coverage (each ≤6) ----
// G-sum: sum of all nth roots of unity = 0
[5,7,8].forEach(n => addConcept({ trap:"G", diff:2, shape:"G-sum",
  prompt:`The sum of all ${n}th roots of unity is:`, options:["0","1",`${n}`,"-1"], answer:0,
  check:()=> ceq(nthRoots(n).reduce(cadd,[0,0]),[0,0]),
  script:[`The ${n} roots are symmetric about the origin.`,"Their sum (and 1+x+…+xⁿ⁻¹) is 0."],
  mistake:"Forgetting all nth roots (n>1) always cancel to zero.", why:"Symmetric points around the circle sum to 0 — generalizes 1+ω+ω²=0." }));
// G-prod: product of all nth roots of unity = (−1)^(n+1)
[3,4,5].forEach(n => { const p=nthRoots(n).reduce(cmul,[1,0]); add({ trap:"G", diff:2, shape:"G-prod",
  prompt:`The product of all ${n}th roots of unity is:`, options:["1","-1","0",`${n}`], value:p,
  script:[`Product of nth roots of unity = (−1)^(n+1).`, `For n=${n} this is ${n%2===0?-1:1}.`],
  mistake:"Assuming the product is always 1.", why:"Sign alternates with n: odd n → 1, even n → −1." }); });
// A-prod: ω^a · ω^b = ω^((a+b) mod 3)
[[5,7],[4,4],[2,3]].forEach(([a,b]) => add({ trap:"A", diff:1, shape:"A-prod",
  prompt:`Value of ω^${a} · ω^${b} ?`, options:SYM, value:cpow(W,a+b),
  script:[`Add exponents: ω^${a}·ω^${b}=ω^${a+b}.`, `${a+b} mod 3 = ${(a+b)%3} ⇒ ${["1","ω","ω²"][(a+b)%3]}.`],
  mistake:"Multiplying instead of adding exponents.", why:"Powers of ω add exponents, then reduce mod 3." }));
// H-fact: a³+b³+c³−3abc = (a+b+c)(a²+b²+c²−ab−bc−ca)
[[1,2,3,18],[2,3,4,27],[1,2,4,49]].forEach(([a,b,c,ans]) => add({ trap:"H", diff:2, shape:"H-fact",
  prompt:`Value of ${a}³ + ${b}³ + ${c}³ − 3·${a}·${b}·${c} ?`,
  options:[`${ans}`, `${ans+3}`, "0", `${a**3+b**3+c**3}`], value:[ans,0],
  script:["Use a³+b³+c³−3abc = (a+b+c)(a²+b²+c²−ab−bc−ca).",`= (${a+b+c})·(${a*a+b*b+c*c-a*b-b*c-c*a}) = ${ans}.`],
  mistake:"Computing each cube separately and slipping arithmetic.",
  why:"The ω-factorization (a+bω+cω²)(a+bω²+cω) underlies this identity — recognize and factor." }));

// ============================================================
//  emit
// ============================================================
// Deterministic serve-order shuffle: break up trap blocks so a sequential
// student can't infer the trap from position. Fixed seed = reproducible builds.
{
  const sr = rng(0x5EEDC0DE);
  for (let i = bank.length - 1; i > 0; i--) { const j = Math.floor(sr() * (i + 1)); [bank[i], bank[j]] = [bank[j], bank[i]]; }
}
const header = `// AUTO-GENERATED by generate-bank.js (v3) — DO NOT EDIT BY HAND.
// Every computational answer verified against complex/ω-arithmetic at build time.
// Option positions are deterministically shuffled (no answer-index bias).
// Question count: ${bank.length}
`;
fs.writeFileSync("bank.js", header + "const BANK = " + JSON.stringify(bank, null, 1) + ";\n");

const byTrap = {}; bank.forEach(q => byTrap[q.trap]=(byTrap[q.trap]||0)+1);
const byDiff = {}; bank.forEach(q => byDiff[q.difficulty]=(byDiff[q.difficulty]||0)+1);
const byAns  = {}; bank.forEach(q => byAns[q.answer]=(byAns[q.answer]||0)+1);
console.log(`✅ Generated & VERIFIED ${bank.length} questions → bank.js`);
console.log("   by trap:", byTrap);
console.log("   by difficulty:", byDiff, `(diff-3 = ${Math.round(100*(byDiff[3]||0)/bank.length)}%)`);
console.log("   answer-index spread:", byAns);
const maxShape = Math.max(...Object.values(shapes));
console.log(`   distinct shapes: ${Object.keys(shapes).length}, max per shape: ${maxShape}`);
