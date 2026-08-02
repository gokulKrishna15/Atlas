# Atlas Quiz

A small, static, no-backend MCQ quiz for flags and capitals. Pure HTML/CSS/JS —
no build step, no server, no database.

## Run it locally without backend

Just open `index.html` in a browser, or serve the folder so ES modules load
over http (double-clicking the file works in most browsers too, but if you
hit a CORS error on `file://`, use a quick local server instead):

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploy to GitHub Pages

1. Create a new GitHub repo (e.g. `atlas-quiz`) and push this folder as its
   contents:
   ```bash
   git init
   git add .
   git commit -m "Atlas quiz: flags + capitals MCQ"
   git branch -M main
   git remote add origin https://github.com/<your-username>/atlas-quiz.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Source → Deploy from a branch**, pick
   `main` and `/ (root)`, then save.
3. Your app goes live at
   `https://<your-username>.github.io/atlas-quiz/` within a minute or two.

Any static host works the same way with zero code changes — Netlify, Vercel,
Cloudflare Pages, or a GitHub Pages custom domain — since there's no backend
to configure.

## How it's structured (and how to extend it)

- `data-flags.js`, `data-capitals.js` — plain arrays of quiz items, generated
  from your CSVs.
- `quiz-engine.js` — generic MCQ generator: given any deck, it picks a
  question and builds 4 shuffled options (1 correct + 3 distractors).
- `main.js` — a `DECKS` array registers each quiz. **To add a new quiz type
  later** (e.g. "flag → capital", "currency", "continent"):
  1. Add a `data-<name>.js` file exporting an array of items.
  2. Add one object to `DECKS` in `main.js` with `id`, `tabLabel`,
     `promptLabel`, `promptType` (`"flag"` or `"text"`), `data`, `prompt()`,
     and `answer()`.
  3. Nothing else changes — a new tab appears automatically.
- Best score per quiz is saved in the browser's `localStorage` (personal,
  per-device — not synced anywhere).
