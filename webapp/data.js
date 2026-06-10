// ============================================================
//  JEE Mindset Trainer — Question Bank
//  Authored with the "Examiner's Algorithm" methodology:
//  every question is tagged with the TRAP it tests + the
//  THINKING SCRIPT step that cracks it.
//  (PoC concept: Cube Roots of Unity)
// ============================================================

const CONCEPT = {
  id: "cube-roots-of-unity",
  subject: "Maths",
  title: "Cube & nth Roots of Complex Numbers",
  model: "ω = e^(2πi/3). The three cube roots are 1, ω, ω² — 120° apart on the unit circle. Two identities power ~95% of questions:  (1) 1 + ω + ω² = 0   and   (2) ω³ = 1 (so exponents cycle mod 3).",
};

// The examiner's fixed toolkit. Every question maps to one of these.
const TRAPS = {
  A: {
    name: "Exponent disguise", color: "#f59e0b",
    hint: "Huge power → reduce the exponent mod 3.",
    tell: "You see an intimidating power like ω⁴⁰⁰⁰ or ω^1729.",
    recognize: "The size of the exponent is BAIT — it has zero mathematical weight. The instant you see any power of ω, your hand should reduce it mod 3 before reading the rest of the question. Trained students never even feel the intimidation.",
  },
  B: {
    name: "Hidden sum = 0", color: "#ef4444",
    hint: "A long sum that secretly collapses via 1+ω+ω²=0.",
    tell: "Three-ish terms added, or a product that expands into 1+ω+ω².",
    recognize: "When you see terms being ADDED, test for collapse before computing. The examiner arranges the terms so the sum identity zeroes most of it out. If you start multiplying everything, you've already lost — they're counting on it.",
  },
  C: {
    name: "Reverse factorization", color: "#8b5cf6",
    hint: "x²+x+1 IS (x−ω)(x−ω²). Plug ω in instead of expanding.",
    tell: "You spot x²+x+1 or x²−x+1, often as a divisor or buried in a polynomial.",
    recognize: "That quadratic is a disguise for ω, ω². The examiner is testing whether you EVALUATE at the root instead of doing brute algebra. Remainder/divisibility problems crack instantly by plugging ω in — never long-divide.",
  },
  D: {
    name: "Sign / variant bait", color: "#06b6d4",
    hint: "1+ω = −ω²,  1+ω² = −ω,  1/ω = ω². Never expand brute-force.",
    tell: "Mixed forms: −ω, ω², 1/ω, 1+ω all appearing in one expression.",
    recognize: "This trap exists ONLY to make you slip a sign. Memorize the three rewrites cold (1+ω=−ω², 1+ω²=−ω, 1/ω=ω²) and apply them mechanically. The wrong options are the answers you'd get from one sign error — they're engineered, not random.",
  },
  E: {
    name: "Geometry crossover", color: "#10b981",
    hint: "1, ω, ω² = equilateral triangle on unit circle (area 3√3/4).",
    tell: "Words like 'vertices', 'triangle', 'area', 'Argand plane'.",
    recognize: "Algebra and geometry are the SAME object here. 1, ω, ω² are always the equilateral triangle on the unit circle. Don't compute coordinates — recognize the shape and read off area = 3√3/4 or centroid = origin.",
  },
  F: {
    name: "Multi-concept fusion", color: "#ec4899",
    hint: "ω inside a determinant/matrix → make a row/column vanish.",
    tell: "ω-powers stapled onto a determinant, matrix, or big summation.",
    recognize: "The other topic (matrices/determinants) is camouflage. The exit is always the sum identity: use 1+ω+ω²=0 to make a row or column collapse to zero. Look for where the three roots can be added together.",
  },
  G: {
    name: "Polar & De Moivre roots", color: "#14b8a6",
    hint: "nth roots of z: modulus r^(1/n), arguments (θ+2πk)/n, n of them, 2π/n apart.",
    tell: "Find all z with zⁿ = w, or evaluate (a+bi)ⁿ — not just ω-identities.",
    recognize: "Convert to polar FIRST: write the number as r∠θ. Then the n roots all share modulus r^(1/n) and have arguments (θ+2πk)/n for k=0…n−1, equally spaced by 2π/n. For powers use De Moivre: (r∠θ)ⁿ = rⁿ∠nθ. Never expand binomials by hand.",
  },
  H: {
    name: "Combined identities", color: "#a855f7",
    hint: "Chain two moves: (a+bω+cω²) factoring, ratios = ω/ω², a³+b³+c³−3abc, root-of-unity filters.",
    tell: "Symmetric expressions a+bω+cω², ratios of them, or sums of binomial coefficients.",
    recognize: "These separate the toppers — they need TWO chained rewrites. Recognize the structure: (a+bω+cω²)(a+bω²+cω)=a²+b²+c²−ab−bc−ca; cyclic ratios shift by a factor of ω; x²+x+1 divides x²ⁿ+xⁿ+1 iff 3∤n; binomial sums collapse via the root-of-unity filter. Name the identity, then apply — never grind.",
  },
};

// Difficulty: 1 = Mains-easy, 2 = Mains-hard, 3 = Advanced
const QUESTIONS = [
  {
    id: "q1",
    trap: "A",
    difficulty: 1,
    prompt: "Find the value of  ω⁹⁹⁹ + ω¹⁰⁰⁰ + ω¹⁰⁰¹.",
    options: ["0", "1", "ω", "3"],
    answer: 0,
    script: [
      "Big exponents → reduce each mod 3.",
      "999 mod 3 = 0, 1000 mod 3 = 1, 1001 mod 3 = 2.",
      "So it's ω⁰ + ω¹ + ω² = 1 + ω + ω² = 0.",
    ],
    mistake: "Reducing mod 2 (habit from i / fourth roots). Cube roots cycle mod 3.",
    why: "The examiner chose CONSECUTIVE exponents so Trap A feeds straight into the sum identity (Trap B). Recognise the pair, don't compute.",
  },
  {
    id: "q2",
    trap: "B",
    difficulty: 2,
    prompt: "Evaluate  (1 + ω)(1 + ω²)(1 + ω⁴)(1 + ω⁸).",
    options: ["0", "1", "−1", "ω²"],
    answer: 1,
    script: [
      "ω⁴ = ω and ω⁸ = ω², so it's (1+ω)(1+ω²)(1+ω)(1+ω²) = [(1+ω)(1+ω²)]².",
      "(1+ω)(1+ω²) = 1 + ω + ω² + ω³ = 0 + 1 = 1.",
      "So the answer is 1² = 1.",
    ],
    mistake: "Multiplying all four factors out blindly. Reduce the exponents (Trap A) FIRST, then pair.",
    why: "Two traps stacked: exponent disguise hides that it's really the same two factors squared.",
  },
  {
    id: "q3",
    trap: "C",
    difficulty: 3,
    prompt: "Find the remainder when  x¹⁰⁰ + x⁵⁰ + 1  is divided by  x² + x + 1.",
    options: ["0", "1", "x", "x + 1"],
    answer: 0,
    script: [
      "Roots of x²+x+1 are ω and ω². The remainder must equal the polynomial AT those roots.",
      "Plug ω: ω¹⁰⁰ + ω⁵⁰ + 1 = ω¹ + ω² + 1 (reduce mod 3) = 0.",
      "It vanishes at both roots → remainder is 0.",
    ],
    mistake: "Attempting actual polynomial long division. Use the roots — that's the whole point of Trap C.",
    why: "Examiner buries (x−ω)(x−ω²) as 'x²+x+1' to test if you SEE it. The big exponents are pure intimidation.",
  },
  {
    id: "q4",
    trap: "D",
    difficulty: 2,
    prompt: "The value of  (1 − ω + ω²)³ + (1 + ω − ω²)³  is:",
    options: ["−16", "16", "0", "−8"],
    answer: 0,
    script: [
      "Use 1 + ω² = −ω, so 1 − ω + ω² = (1+ω²) − ω = −ω − ω = −2ω.",
      "Use 1 + ω = −ω², so 1 + ω − ω² = (1+ω) − ω² = −ω² − ω² = −2ω².",
      "(−2ω)³ + (−2ω²)³ = −8ω³ − 8ω⁶ = −8 − 8 = −16.",
    ],
    mistake: "Treating −ω as ω². They are NOT equal. Only 1+ω = −ω² is true.",
    why: "Pure sign-bait. The examiner wants you to slip on one of the rewrites and land on +16 or 0.",
  },
  {
    id: "q5",
    trap: "E",
    difficulty: 1,
    prompt: "1, ω, ω² are plotted in the Argand plane. The area of the triangle they form is:",
    options: ["3√3 / 4", "√3 / 4", "3 / 4", "√3"],
    answer: 0,
    script: [
      "All three lie on the unit circle (radius 1), 120° apart → equilateral triangle.",
      "For an equilateral triangle inscribed in a circle of radius R, area = (3√3/4)·R².",
      "R = 1 → area = 3√3/4.",
    ],
    mistake: "Trying to compute coordinates and use the shoelace formula. Recognise the shape instead.",
    why: "Tests whether you connect algebra ↔ geometry instantly. The answer is ALWAYS this triangle.",
  },
  {
    id: "q6",
    trap: "A",
    difficulty: 2,
    prompt: "If ω is a non-real cube root of unity, then  ω²⁰²⁴  equals:",
    options: ["ω²", "ω", "1", "−1"],
    answer: 0,
    script: [
      "2024 mod 3: 3·674 = 2022, so 2024 − 2022 = 2, giving remainder 2.",
      "ω²⁰²⁴ = ω² .",
    ],
    mistake: "Arithmetic slip in the mod. Always compute the remainder cleanly before locking an option.",
    why: "Trap A in its purest form. The defence is a clean mod-3 calculation, every time.",
  },
];

// ============================================================
//  PREVIOUS YEAR QUESTIONS — DECODED
//  Real JEE Main / Advanced (incl. legacy IIT-JEE) questions on
//  nth roots & cube roots of complex numbers, decoded for the
//  examiner's manipulation.
//
//  ⚠ VERIFY: year/session attributions are pattern-faithful but
//  MUST be confirmed against official NTA/JEE papers by a human
//  before publishing. The DECODE (why it confuses) is the value.
// ============================================================

const PYQS = [
  {
    year: "2019", exam: "JEE Main", verify: true,
    concept: "Cube roots in a determinant (Trap F)",
    prompt: "Let ω be a complex cube root of unity. Evaluate the 3×3 determinant with rows [1, 1, 1], [1, −1−ω², ω²], [1, ω², ω⁷].",
    manipulation: "They bury the roots inside a determinant and write ω⁷ instead of ω to force a hidden mod-3 reduction (Trap A) INSIDE a Trap F shell. Two traps in one cell. Most students start cofactor-expanding a messy determinant and burn 4 minutes.",
    think: "Don't expand. First reduce ω⁷ = ω. Then use 1+ω+ω²=0 to simplify −1−ω² = ω. Now the matrix is clean and rows/columns simplify — the determinant collapses. The exam is testing whether you SIMPLIFY before you compute.",
    skill: "Reduce every ω-power mod 3 FIRST; only then look at the structure.",
  },
  {
    year: "1998", exam: "IIT-JEE (Advanced lineage)", verify: true,
    concept: "Sign-bait power (Trap D + A)",
    prompt: "If ω (≠1) is a cube root of unity, find the value of (1 + ω − ω²)⁷.",
    manipulation: "They combine a sign-rewrite with a 7th power. Students who don't rewrite 1−ω²=−2ω... wait — here it's 1+ω−ω². Using 1+ω=−ω², it becomes (−ω²−ω²)=−2ω². The 7th power then needs ω-power reduction. They stack Trap D (the rewrite) and Trap A (the exponent) so a single slip cascades.",
    think: "Rewrite first: 1+ω = −ω², so 1+ω−ω² = −2ω². Then (−2ω²)⁷ = −128·ω¹⁴ = −128·ω² (14 mod 3 = 2). Answer = −128ω². The lesson: collapse the bracket with a rewrite BEFORE touching the power.",
    skill: "Simplify the base with sign-rewrites, then apply exponent mod 3 — in that order.",
  },
  {
    year: "2020", exam: "JEE Main", verify: true,
    concept: "Sum of a series of ω-powers (Trap B + A)",
    prompt: "If ω is a non-real cube root of unity, find the sum  1 + ω + ω² + ω³ + … + ω^(3n−1).",
    manipulation: "A long, scary series. They want you to think 'geometric series formula' and grind. In reality it groups into n identical blocks of (1+ω+ω²), each = 0. The length 3n−1 is chosen so the blocks are exact — a deliberate construction.",
    think: "Group in threes: (1+ω+ω²) + (ω³+ω⁴+ω⁵) + … Each bracket = ω^{3k}(1+ω+ω²) = 0. So the whole sum is 0. Recognise the period-3 structure instead of summing term by term.",
    skill: "Any long sum of consecutive ω-powers groups into zero-blocks — look for the period of 3.",
  },
  {
    year: "General (classic IIT result)", exam: "JEE Advanced", verify: true,
    concept: "nth roots of unity — product identity",
    prompt: "If 1, α₁, α₂, …, α_(n−1) are the n distinct nth roots of unity, find the value of (1−α₁)(1−α₂)…(1−α_(n−1)).",
    manipulation: "This generalises beyond cube roots to test if you understand WHY the factorization works. They strip away numbers so brute force is impossible — you MUST use x^n − 1 = (x−1)(x−α₁)…(x−α_(n−1)). Pure-concept question, no computation escape hatch.",
    think: "Write x^n − 1 = (x−1)·∏(x−αₖ). Divide both sides by (x−1): 1 + x + … + x^(n−1) = ∏(x−αₖ). Now put x = 1: the left side = n. So the product = n. The trick is dividing out (x−1) first, then substituting.",
    skill: "For nth-root products, factor x^n−1, cancel (x−1), then substitute the target value.",
  },
  {
    year: "2021", exam: "JEE Main", verify: true,
    concept: "Geometry crossover (Trap E)",
    prompt: "The cube roots of unity 1, ω, ω² are the vertices of a triangle in the Argand plane. Its area and the radius of its circumscribed circle are:",
    manipulation: "They phrase an algebra fact as a coordinate-geometry problem to see if the student switches representations. Many compute the three points and attempt the shoelace formula — slow and error-prone — exactly the inefficiency the examiner rewards skipping.",
    think: "All three roots lie on |z|=1, so circumradius R = 1, equally spaced 120° apart → equilateral. Area of an equilateral triangle inscribed in radius R is (3√3/4)R² = 3√3/4. Read it off; don't compute coordinates.",
    skill: "1, ω, ω² are ALWAYS the unit-circle equilateral triangle — memorise area 3√3/4, R = 1.",
  },
  {
    year: "2017", exam: "JEE Main", verify: true,
    concept: "Reverse factorization in a fraction (Trap C + D)",
    prompt: "If ω is a cube root of unity, find the value of  1/(1+ω) + 1/(1+ω²).",
    manipulation: "Two small fractions look harmless, so students cross-multiply blindly. The intended path uses the rewrites 1+ω=−ω², 1+ω²=−ω. They keep it small precisely so over-confident students rush and mis-handle the signs.",
    think: "1/(1+ω) + 1/(1+ω²) = 1/(−ω²) + 1/(−ω) = −(1/ω² + 1/ω) = −(ω + ω²) [since 1/ω=ω², 1/ω²=ω] = −(−1) = 1. Answer = 1. Every step is a rewrite, not a computation.",
    skill: "Replace 1+ω and 1+ω² on sight; convert 1/ω to ω² — fractions of ω are never cross-multiplied.",
  },
];

