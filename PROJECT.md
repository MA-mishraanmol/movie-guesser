# 🎬 Guess the Movie — Project Master Doc (V2)

*Last updated: 2026-07-08, after auditing actual repo state against the V1 vision doc.*

## Vision (unchanged)

Not another movie trivia quiz — a **party game** (Jackbox / Psych! / Heads Up energy) where the
*clues themselves* are the entertainment. Success looks like: "I need to send this game to my
friends." Difficulty comes from the writing style of the clue, never from picking obscure movies.

## Where the code actually is

```
movie-guesser/                     ← git repo root
  movie-guess-mvp/                 ← Vite + React 19 + Tailwind app
    src/App.jsx                    ← entire game logic, single component
    src/data/movies.json           ← 480 entries (LIVE data used by the app)
../movies.json                     ← 120 entries, SIBLING file outside the repo, NOT used by the app
../Movie guessing- 1st draft       ← original concept note (not a folder — a text file)
```

**Stack:** React 19, Vite 7, Tailwind 3, html2canvas for share cards. No backend, no server,
no database — everything is a static JSON import and local component state.

## Reality check vs. the V1 doc

| V1 claim | Actual state |
|---|---|
| "≈500 movie entries, deduplicated" | `src/data/movies.json` has 480 entries but **96 duplicate titles** (e.g. Titanic, Inception, Shrek each appear 2+ times with different clues). Dedup has **not** been done yet. |
| Loose `movies.json` at project root (120 entries) | Orphaned — not imported anywhere in the app. Likely an earlier/parallel draft. Needs a decision: merge, archive, or delete. |
| 3-tier progressive summary system (hard→medium→easy, each independently funny) | Not implemented. Current schema is `{ id, summary, answer, difficulty, hints[] }` — **one** summary + 3 short keyword hints (e.g. `"Ship", "Romance", "Iceberg"}`), revealed via a manual "💡 Hint" button, not a timer. |
| Timed rounds with decaying points (100/60/30) | Not implemented. Scoring today is just a **win streak counter**, reset to 0 on a wrong/revealed answer. No point values at all. |
| Multiplayer, room codes, live leaderboard | Not implemented. Single-player only, no networking layer. |
| Clue style rotation (HR email, police report, Reddit post, etc.) | Not implemented. All summaries are one-line jokes in a single consistent voice. |
| Perspective-shift clues (Iceberg's POV, Wilson the volleyball, etc.) | Not implemented. |
| Metadata (year, genre, cast, franchise, difficulty score, etc.) | Not implemented — schema only has `difficulty: easy/medium/hard` as a string. |

**What exists that the vision doc doesn't mention (keep these — they're good):**
- Autocomplete on the guess input (matches against all movie titles as you type)
- Shuffled session queue so movies don't repeat within a playthrough
- "Share Card" — renders a PNG of your streak via html2canvas for social sharing (very on-brand
  for the "send this to my friends" goal — lean into this later for multiplayer/social hooks)

## Immediate priorities (in order)

### 1. Data cleanup (blocking everything else)
- [ ] Decide fate of root-level `movies.json` (120 entries) — merge into `src/data/movies.json` or archive/delete
- [ ] Deduplicate `src/data/movies.json` (96 duplicate answers currently) — for true dupes, decide
      whether to keep one clue or use both as alternate clue variants for the same movie
- [ ] Audit clue quality — cut weak/unfunny ones per the "handcrafted, funny, makes sense after
      reveal" standard
- [ ] Balance across genres/decades/languages once the above is clean

### 2. Schema redesign
Move from the current flat single-summary shape to something that supports the progressive
3-tier reveal and future clue-style rotation, e.g.:
```json
{
  "id": 1,
  "answer": "Titanic",
  "year": 1997,
  "genres": ["Romance", "Drama"],
  "language": "English",
  "category": "Hollywood",
  "clues": [
    { "tier": "hard",   "style": "reddit-post", "text": "..." },
    { "tier": "medium", "style": "diary-entry",  "text": "..." },
    { "tier": "easy",   "style": "fake-news",    "text": "..." }
  ]
}
```
This is the highest-leverage change — every future feature (timers, scoring, clue rotation,
replayability via 20-40 cards per movie) depends on this shape existing first.

### 3. MVP gameplay loop rework
- [ ] Replace manual hint-button with the timed progressive reveal (clue 1 → 20s → clue 2 → 15s
      → clue 3 → 10s → reveal)
- [ ] Wire up the 100/60/30 point scoring tied to which tier the player answered on
- [ ] Keep the streak counter as a secondary stat (it already works and is satisfying)

### 4. Multiplayer (post-MVP)
- [ ] Needs a real backend/socket layer (out of scope for the current static-JSON app) — this is
      the point where a lightweight server (e.g. Firebase, Supabase, or a small Node/WS service)
      becomes necessary for room codes + synced timers + live leaderboard
- [ ] Design room-code join flow, host controls, simultaneous-answer capture

### 5. Content expansion
Only after schema + cleanup are solid — expand toward 1000+ movies, 300+ TV series, anime,
animated, Korean, Bollywood, South Indian per the original category targets.

## Clue philosophy (unchanged, this is the product)
- Difficulty = clue cleverness, never obscure movie choice
- Rotate writing styles silently (fake news, HR email, support ticket, diary, police report,
  Wikipedia intro, etc.) — player should never be able to predict the format
- Occasional perspective-shift clues (told from the iceberg, the ring, the shark, a bystander)
- Every clue must be funny standalone AND make sense in hindsight after the reveal
- Target 20-40 clue variants per movie eventually for replayability

## Open questions to resolve with the user before building further
1. Root `movies.json` (120 entries) vs `src/data/movies.json` (480 entries) — which is
   canonical, or should they be merged?
2. For the 96 duplicate titles already in the live dataset — treat duplicates as bugs to delete,
   or as the start of the "multiple clue variants per movie" system?
3. Multiplayer backend preference (Firebase/Supabase/custom Node+WebSocket/other) — affects how
   soon infra work needs to start vs. continuing solo on single-player content/schema.
