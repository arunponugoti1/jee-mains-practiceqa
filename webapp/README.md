# JEE Mindset Trainer — Web App (PoC)

A zero-build web app that teaches students to **recognize the examiner's trap**, not
memorize answers. Each question shows its TRAP category, the topper's THINKING SCRIPT,
the common mistake, and collects per-question feedback.

Built on the methodology in `../concept-poc-cube-roots-of-unity.md`.

## Run it (no install needed)
Just open `index.html` in any browser. On Windows:
```powershell
start index.html
```
It works offline and on any phone browser. Progress + feedback persist in localStorage.

## Deploy it to students (free, ~5 min)
Any static host works — no server needed:
- **Netlify Drop:** drag the `webapp` folder onto https://app.netlify.com/drop → instant public URL.
- **Vercel:** `vercel` in this folder.
- **GitHub Pages:** push `webapp` to a repo, enable Pages.

Send the URL to a small batch of students.

## How feedback collection works
- Each question has 💡 / ✅ / 😕 ratings + an optional note.
- On the results page, **Export feedback** downloads a JSON of all answers + ratings.
- Students send you that JSON (WhatsApp/email) → you read real signal on which traps land.

### To collect feedback automatically (next step)
Replace the download in `exportFeedback()` (app.js) with a POST:
```js
fetch("https://your-endpoint", { method: "POST", body: JSON.stringify(payload) });
```
Easiest no-code option: a **Google Form** with the same fields, or a Google Sheet via
Apps Script web-app endpoint. Wire this once you've confirmed students like the format.

## File map
- `index.html` — shell
- `styles.css` — mobile-first dark UI
- `data.js`   — the question bank (TRAPS + QUESTIONS, authored with the methodology)
- `app.js`    — quiz flow, thinking-script reveal, trap-weakness map, feedback export

## Adding a new concept
Duplicate the `CONCEPT` / `TRAPS` / `QUESTIONS` structure in `data.js`. Every question
MUST carry: `trap`, `difficulty`, `script[]`, `mistake`, `why`. That structure IS the
product — it's what makes this different from a plain question bank.

## Before showing students: human-verify
- [ ] Every numerical answer double-checked by a subject expert.
- [ ] Trap tags accurate (does the examiner really use that manipulation?).
- [ ] Any real-paper year citations confirmed against official NTA/JEE papers.
