# 🎬 Guess the Movie — Project Master Doc (V4)

*Last updated: 2026-07-10. Full history and roadmap now also live on Notion:*
*[🎬 Guess the Movie — Project & Roadmap](https://app.notion.com/p/39725aafc8b481638506de88b8c35ae1) · [💡 Side Project Ideas](https://app.notion.com/p/39725aafc8b4816ba24fdd3339d91406)*

## Vision (unchanged)

Not another movie trivia quiz — a **party game** (Jackbox / Psych! / Heads Up energy) where the
*clues themselves* are the entertainment. Success looks like: "I need to send this game to my
friends." Difficulty comes from the writing style of the clue, never from picking obscure movies.

## ⚠️ Action needed before multiplayer works

Multiplayer needs a live Supabase project — I can't create this myself. To activate it:
1. Create a free project at [supabase.com](https://supabase.com)
2. Open the SQL editor and run `movie-guess-mvp/supabase/schema.sql`
3. Copy `movie-guess-mvp/.env.example` → `.env.local` and fill in your project's URL + anon key
   (Dashboard → Project Settings → API)
4. `npm run dev` — the "Play with Friends" flow will light up automatically once those env vars
   are present (it shows a friendly "not set up yet" message until then, solo mode is unaffected)

## Where the code actually is

```
movie-guesser/                       ← git repo root
  movie-guess-mvp/                   ← Vite + React 19 + Tailwind app
    src/App.jsx                      ← top-level switcher: menu → Solo or Multiplayer
    src/components/SoloGame.jsx      ← single-player game (unchanged logic, extracted from App.jsx)
    src/components/ClueCard.jsx      ← shared clue+progress-dot UI (solo & multiplayer)
    src/components/multiplayer/      ← Home (create/join), Lobby, GameRoom, RoundResult, Leaderboard
    src/hooks/useRoom.js             ← Supabase Realtime subscription (rooms/players/answers)
    src/lib/supabaseClient.js        ← Supabase client, reads VITE_SUPABASE_URL / _ANON_KEY
    src/lib/roomActions.js           ← createRoom/joinRoom/startGame/submitGuess/finishRound/nextRound
    src/lib/roomCode.js              ← room code generator + player color palette
    src/lib/gameConfig.js            ← tier durations (30s/20s/20s), points (100/60/30)
    src/data/movies.json             ← 1000 entries (LIVE data used by the app)
    supabase/schema.sql              ← run this once in your Supabase project's SQL editor
../movies.json                       ← 120 entries, SIBLING file outside the repo, still orphaned
../Movie guessing- 1st draft         ← original concept note (not a folder — a text file)
```

**Stack:** React 19, Vite 7, Tailwind 3, html2canvas for share cards, **Supabase (Postgres +
Realtime) for multiplayer**. Solo mode still has zero backend dependency.

## Current status (as of 2026-07-10)

- [x] Deduplicated the dataset, redesigned schema (`summaries: [{tier, text}]`), rebuilt gameplay
      around progressive single-clue reveal, redesigned UI (clean light theme, indigo accent)
- [x] Expanded the dataset to **1000 unique movies**, all hand-written, zero duplicates
- [x] Mobile-responsive pass across all screens (320px–1440px verified), native share sheet on
      mobile instead of a broken download link
- [x] **Multiplayer mode built** — Psych!/Kahoot-style room-code party game:
      - Host creates a room (4-char code) or players join with a code + nickname, no login
      - Lobby shows live player list, host starts the game
      - Synced game screen: everyone sees the same clue at the same time, live countdown
        (30s hard → 20s medium → 20s easy), scored 100/60/30 by which tier you answered on
      - Round-result screen with per-player point deltas + live standings after every round
      - Final podium + full leaderboard, host can start a new game in the same room
      - Backend: Supabase Realtime (Postgres Changes subscriptions) — **not yet connected to a
        real project**, see "Action needed" above
- [ ] Orphaned root-level `movies.json` (120 entries, not imported by the app) — still needs a
      decision: merge, archive, or delete
- [ ] Genre/decade/language balance pass — 1000 titles is broad but not yet evenly weighted

## Data schema (current, live)

**Movies** (`src/data/movies.json`):
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

**Multiplayer** (Supabase/Postgres, see `supabase/schema.sql` for the full DDL + RLS policies):
- `rooms` — code, host_player_id, status (lobby/playing/round_result/game_over), movie_queue,
  round_index, tier_index, tier_deadline
- `players` — room_code, nickname, color_index, score, streak, connected
- `answers` — room_code, round_index, player_id, guess, correct, tier_answered, points

**Timer authority model:** no dedicated server exists, so the *host's browser* drives tier/round
advancement (writes `tier_index`/`tier_deadline` when its local timer or "everyone answered"
condition fires); every client renders its own countdown from the synced deadline. Known v1
tradeoff: if the host closes their tab mid-game, the game pauses until they return. A v2 could
move this to a Supabase Edge Function on a schedule to remove that dependency.

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

### 1. Connect the live Supabase project (see "Action needed" above)
Everything is built and tested with mock data; it just needs real credentials to go live.

### 2. Multiplayer v1.1 polish (known gaps, intentionally deferred)
- [ ] Reconnect-with-same-identity after a real disconnect (currently: refresh = new player row)
- [ ] Host controls beyond Start Game (kick player, force-skip, pause)
- [ ] Move tier/round advancement off the host's browser onto a scheduled Edge Function

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
2. Once Supabase is connected: comfortable with the host-authoritative timer tradeoff for now, or
   worth the extra infra to make round advancement server-driven from day one?
