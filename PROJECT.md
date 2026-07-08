# 🎬 Guess the Movie — Project Master Doc (V3)

*Last updated: 2026-07-09. Full history and roadmap now also live on Notion:*
*[🎬 Guess the Movie — Project & Roadmap](https://app.notion.com/p/39725aafc8b481638506de88b8c35ae1) · [💡 Side Project Ideas](https://app.notion.com/p/39725aafc8b4816ba24fdd3339d91406)*

## Vision (unchanged)

Not another movie trivia quiz — a **party game** (Jackbox / Psych! / Heads Up energy) where the
*clues themselves* are the entertainment. Success looks like: "I need to send this game to my
friends." Difficulty comes from the writing style of the clue, never from picking obscure movies.

## Where the code actually is

```
movie-guesser/                     ← git repo root
  movie-guess-mvp/                 ← Vite + React 19 + Tailwind app
    src/App.jsx                    ← entire game logic, single component
    src/data/movies.json           ← 1000 entries (LIVE data used by the app)
../movies.json                     ← 120 entries, SIBLING file outside the repo, still orphaned
../Movie guessing- 1st draft       ← original concept note (not a folder — a text file)
```

**Stack:** React 19, Vite 7, Tailwind 3, html2canvas for share cards. No backend, no server,
no database — everything is a static JSON import and local component state.

## Current status (as of 2026-07-09)

- [x] Deduplicated the dataset: 480 raw entries → 384 unique movies (96 duplicates removed)
- [x] Schema redesigned from `summary + hints[]` to `summaries: [{tier, text}]` (hard → medium → easy)
- [x] Gameplay rebuilt around progressive single-clue reveal (one summary shown at a time, step
      progress bar, no visible tier labels to players)
- [x] UI redesigned: clean minimal light theme (white card, indigo accent) replacing the earlier
      dark glassmorphism look
- [x] Hand-written hard/medium/easy summaries for **all 384** originally-deduped movies
- [x] Expanded the dataset from 384 → **1000 unique movies** (hit the original Phase 5 milestone)
      — added 616 new titles across two passes spanning Hollywood classics/blockbusters, Bollywood
      (old and new), South Indian cinema (Tamil/Telugu/Malayalam/Kannada), Korean cinema, anime,
      animated/Pixar/Disney, musicals, war films, franchises (Star Wars, full Harry Potter, John
      Wick, X-Men, MCU), biographies, cult classics, and world cinema — every one with its own
      hand-written 3-tier summary set, zero duplicate titles verified programmatically each pass
- [ ] Orphaned root-level `movies.json` (120 entries, not imported by the app) — still needs a
      decision: merge, archive, or delete
- [ ] Genre/decade/language balance pass — 1000 titles is broad but not yet evenly weighted

## Data schema (current, live)

```json
{
  "id": 1,
  "answer": "Titanic",
  "difficulty": "easy",
  "summaries": [
    { "tier": "hard", "text": "..." },
    { "tier": "medium", "text": "..." },
    { "tier": "easy", "text": "..." }
  ]
}
```

Future direction (once clue-style rotation ships) — add a `style` field per clue and grow each
movie's `summaries` array toward 20-40 variants, e.g. `{ "tier": "hard", "style": "reddit-post", "text": "..." }`.
Future metadata fields still to add: `year`, `genres`, `language`, `category`, `franchise`,
`popularity`, `cast`, `director`, `oscarWinner`, `runtime`, `familyFriendly`.

## Clue philosophy (unchanged, this is the product)
- Difficulty = clue cleverness, never obscure movie choice
- Rotate writing styles silently (fake news, HR email, support ticket, diary, police report,
  Wikipedia intro, etc.) — player should never be able to predict the format
- Occasional perspective-shift clues (told from the iceberg, the ring, the shark, a bystander)
- Every clue must be funny standalone AND make sense in hindsight after the reveal
- Target 20-40 clue variants per movie eventually for replayability

## Immediate priorities (in order)

### 1. Gameplay loop rework
- [ ] Replace manual "Next Clue" button with the timed progressive reveal (clue 1 → 20s → clue 2
      → 15s → clue 3 → 10s → reveal)
- [ ] Wire up 100/60/30 point scoring tied to which tier the player answered on (currently only a
      win streak counter exists)

### 2. Multiplayer (post-MVP)
- [ ] Needs a real backend/socket layer (out of scope for the current static-JSON app) — likely
      Firebase, Supabase, or a small Node/WS service for room codes + synced timers + live leaderboard
- [ ] Design room-code join flow, host controls, simultaneous-answer capture

### 3. Metadata + clue-style rotation
- [ ] Add year/genre/language/category/cast/director fields per movie
- [ ] Introduce the `style` field and start rotating clue voice (HR email, police report, Reddit
      post, etc.) — a handful of movies already have rotated-style clues baked in as a preview
      (Haunted Mansion, Harry Potter, Godzilla, Cinderella, etc.)
- [ ] Perspective-shift clues (told from the iceberg, the ring, a bystander)

### 4. Further content growth
- [x] 1000 / 1000+ movies — original milestone hit
- [ ] TV Series (300+), Anime as its own tracked category (150+ target — some anime films already
      mixed into the movie set), more Animated Movies (100+)
- [ ] Documentaries, Classic Cinema, Cult Classics, Christmas, Halloween, Oscar Winners, Sports,
      Biographies (post-1000 category expansion)

## Open questions to resolve with the user before building further
1. Root `movies.json` (120 entries) vs `src/data/movies.json` (1000 entries) — which is
   canonical, or should they be merged?
2. Multiplayer backend preference (Firebase/Supabase/custom Node+WebSocket/other) — affects how
   soon infra work needs to start vs. continuing solo on single-player content/schema.
3. Timed reveal + scoring — build now, or keep growing content/metadata first?
