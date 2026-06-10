# Concept Unit (PoC) — Cube Roots of Unity

> **Purpose of this document:** Prove the *method* before we build anything.
> This is what ONE concept looks like when fully reverse-engineered: real question
> patterns → the examiner's trap signatures → the thinking script a topper runs →
> predicted next variants. If this feels transformative to a student, the app is worth building.
>
> **Trust convention:** `✅ pattern-verified` = the manipulation is genuinely how JEE tests this.
> `⚠ VERIFY` = exact year/paper/option attribution must be checked against official NTA/JEE papers
> by a human before publishing. I will NOT fake citation precision.

---

## 1. Core Idea (the 20-second mental model)

ω = e^(2πi/3) is a cube root of 1. The three cube roots are **1, ω, ω²**, sitting at
120° apart on the unit circle. Two identities power ~95% of all questions:

- **Sum identity:** `1 + ω + ω² = 0`
- **Product identity:** `ω³ = 1`  (so `ω⁴ = ω`, `ω⁵ = ω²`, exponents cycle mod 3)

Plus one structural fact examiners *love*: `x³ - 1 = (x-1)(x-ω)(x-ω²)` and
`x² + x + 1 = (x-ω)(x-ω²)`.

That's the entire toolkit. **Everything else is disguise.**

---

## 2. Prerequisite concepts (what must be solid first)

- Polar / Euler form of complex numbers `[[complex-polar-form]]`
- De Moivre's theorem `[[de-moivre-theorem]]`
- Roots of unity (general nth case) `[[nth-roots-of-unity]]`
- Sum of a geometric series (for the exponent-cycling traps) `[[geometric-series]]`

---

## 3. The Examiner's Algorithm — Trap Signatures

This is the heart of the product. Examiners do not invent new math; they apply a
**fixed set of manipulations** to the two identities above. Here are the recurring ones.

### Trap A — Exponent disguise (cycle mod 3)   ✅ pattern-verified
They give a huge power like `ω^4000` or `ω^1729` and watch students panic.
**Reality:** reduce exponent mod 3. `ω^4000 = ω^(4000 mod 3) = ω^1 = ω`.
The big number is pure intimidation.

### Trap B — Hidden `1 + ω + ω² = 0`   ✅ pattern-verified
A long sum of terms that *secretly* collapses to zero (or to a small multiple of it).
e.g. `(1 + ω)(1 + ω²)(1 + ω⁴)(1 + ω⁸)...` — every factor is rewritten using the sum identity.
The "trick" is recognizing that `1 + ω = -ω²` and `1 + ω² = -ω`.

### Trap C — Factorization in reverse   ✅ pattern-verified
They give `x² + x + 1` or `x² - x + 1` buried in a larger expression and expect you to
*see* it as `(x-ω)(x-ω²)`. Common in "find remainder when polynomial is divided by x²+x+1."

### Trap D — Sign / variant confusion (−ω vs ω²)   ✅ pattern-verified
`-ω` and `ω²` are NOT the same, but `1 + ω = -ω²` IS true. Examiners deliberately mix
`-ω`, `ω²`, `1/ω` to bait sign errors. (`1/ω = ω²` because `ω³=1`.)

### Trap E — Geometry crossover   ✅ pattern-verified (Advanced favourite)
"1, ω, ω² are vertices of a triangle — find its area / centroid / type."
Answer is always the same equilateral triangle inscribed in the unit circle
(area = 3√3/4, centroid at origin). Tests whether you connect *algebra ↔ geometry*.

### Trap F — Multi-concept fusion (Advanced)   ✅ pattern-verified
Cube roots stapled onto matrices, determinants, or summations. e.g. a determinant whose
entries are powers of ω → use `1+ω+ω²=0` to make a row/column vanish.

---

## 4. Representative Real-Pattern Questions

> Difficulty: 🟢 Mains-easy · 🟡 Mains-hard · 🔴 Advanced
> Year tags are `⚠ VERIFY` — patterns are real, citations need human check.

**Q1 🟢 (Trap A)** — `⚠ VERIFY: ~Mains 2014-style`
Find the value of `ω^999 + ω^1000 + ω^1001`.
> **Thinking:** reduce each mod 3 → `ω^0 + ω^1 + ω^2 = 1 + ω + ω² = 0`. **Ans: 0.**
> Notice the examiner *chose consecutive exponents* so Trap A feeds straight into Trap B.

**Q2 🟡 (Trap B)** — `⚠ VERIFY: ~Mains 2016-style`
Evaluate `(1 + ω)(1 + ω²)(1 + ω⁴)(1 + ω⁸)`.
> **Thinking:** ω⁴=ω, ω⁸=ω². So it's `(1+ω)(1+ω²)(1+ω)(1+ω²) = [(1+ω)(1+ω²)]²`.
> `(1+ω)(1+ω²) = 1 + ω + ω² + ω³ = 0 + 1 = 1`. So answer = `1² = 1`. **Ans: 1.**

**Q3 🔴 (Trap C+F)** — `⚠ VERIFY: ~Advanced-style`
Find the remainder when `x^100 + x^50 + 1` is divided by `x² + x + 1`.
> **Thinking:** roots of x²+x+1 are ω, ω². Plug ω: `ω^100 + ω^50 + 1 = ω^1 + ω^2 + 1 = 0`.
> Remainder is 0 at both roots → remainder is **0**.

**Q4 🔴 (Trap E)** — `⚠ VERIFY: ~Advanced-style`
If 1, ω, ω² are plotted in the Argand plane, the area of the triangle they form is?
> **Thinking:** equilateral, circumradius 1 → area = `(3√3)/4`. **Ans: 3√3/4.**

**Q5 🟡 (Trap D)** — `⚠ VERIFY: ~Mains-style`
The value of `(1 - ω + ω²)³ + (1 + ω - ω²)³` is?
> **Thinking:** `1 + ω² = -ω` so `1 - ω + ω² = -2ω`. `1 + ω = -ω²` so `1 + ω - ω² = -2ω²`.
> `(-2ω)³ + (-2ω²)³ = -8ω³ - 8ω⁶ = -8(1) - 8(1) = -16`. **Ans: -16.**

---

## 5. The Thinking Script (what to run in your head, in order)

When you see ANY ω-question, run this checklist — it cracks ~90% in under 60 seconds:

1. **See a big exponent?** → reduce mod 3. (Trap A neutralized.)
2. **See a sum of three-ish terms?** → test if it collapses via `1+ω+ω²=0`. (Trap B.)
3. **See `x²+x+1` or `x²-x+1`?** → those are (x-ω)(x-ω²) / (x+ω)(x+ω²). Plug ω in. (Trap C.)
4. **See `1+ω` or `1+ω²`?** → instantly rewrite as `-ω²` / `-ω`. Never expand. (Trap D.)
5. **See "triangle / area / vertices"?** → it's the unit equilateral triangle. (Trap E.)
6. **See a matrix/determinant of ω-powers?** → make a row/column zero using sum identity. (Trap F.)

The skill being trained is **pattern-recognition speed**, not algebra. A topper doesn't
compute faster — they *recognize the trap category instantly* and skip the computation.

---

## 6. Common Mistakes (where students bleed marks)

- Treating `-ω` as `ω²` (it's not — `ω² = -1-ω`). ← Trap D's whole purpose.
- Forgetting `ω³=1`, so writing `ω⁴` instead of reducing to `ω`.
- Expanding `(1+ω)` brute-force instead of using `-ω²` — wastes 90 seconds.
- In remainder problems, computing the polynomial instead of plugging the root.
- Reducing exponent mod 2 instead of mod 3 (carryover habit from `i` / fourth roots).

---

## 7. Predicted Next Variants (the prediction engine output)

Given the trap inventory, here's what's "due" — variants that fit the algorithm but
rotate the surface details:

- **P1 (A×B fusion):** `Σ ω^(k!) for k=1..n` — factorials force exponent-mod-3 thinking
  because k! is divisible by 3 for k≥3, so most terms = 1.
- **P2 (C in disguise):** "If α, β are roots of x²+x+1=0, find α^2024 + β^2024." (Same as Q3,
  reskinned as quadratic-roots instead of polynomial-division.)
- **P3 (E + coordinate geometry):** "Equation of the circle passing through 1, ω, ω²." (It's
  just the unit circle |z|=1 — tests if they see it.)
- **P4 (F + matrices, Advanced):** 3×3 determinant with rows [1, ω, ω²] cyclically shifted →
  evaluate. Collapses via sum identity.

Each prediction is **traceable to a trap signature** — that's the defensible claim:
"we're not guessing, we're applying the examiner's own algorithm."

---

## 8. Verification checklist (the human-verify step before publish)

- [ ] Confirm each `⚠ VERIFY` question against an official NTA/JEE past paper (year, session, Q#).
- [ ] Subject expert confirms every numerical answer.
- [ ] Confirm the trap-tagging is accurate (does the examiner *actually* use this manipulation?).
- [ ] Confirm predicted variants haven't already appeared verbatim (would weaken "prediction").
