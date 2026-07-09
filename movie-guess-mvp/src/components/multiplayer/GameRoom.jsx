import { useEffect, useRef, useState } from "react";
import moviesData from "../../data/movies.json";
import ClueCard from "../ClueCard";
import { advanceTier, finishRound, submitGuess } from "../../lib/roomActions";
import { TIER_DURATIONS_SEC } from "../../lib/gameConfig";

const moviesById = new Map(moviesData.map((m) => [m.id, m]));

export default function GameRoom({ room, players, answers, playerId }) {
  const movie = moviesById.get(room.movie_queue[room.round_index]);

  const roundAnswers = answers.filter((a) => a.round_index === room.round_index);
  const myAnswer = roundAnswers.find((a) => a.player_id === playerId);

  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);

  const isHost = room.host_player_id === playerId;
  const advancingRef = useRef(false);

  // Live per-client countdown, computed from the shared deadline so every device agrees.
  useEffect(() => {
    function tick() {
      const ms = new Date(room.tier_deadline).getTime() - Date.now();
      setRemainingMs(Math.max(0, ms));
    }
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [room.tier_deadline]);

  // Host-only: advances the tier (or finishes the round) once the deadline passes,
  // or as soon as everyone connected has answered.
  useEffect(() => {
    if (!isHost) return;
    advancingRef.current = false;

    const id = setInterval(async () => {
      if (advancingRef.current) return;
      const timeUp = Date.now() >= new Date(room.tier_deadline).getTime();
      const everyoneAnswered =
        players.length > 0 && roundAnswers.length >= players.length;

      if (!timeUp && !everyoneAnswered) return;
      advancingRef.current = true;

      try {
        if (room.tier_index < TIER_DURATIONS_SEC.length - 1) {
          await advanceTier(room.code, room.tier_index + 1);
        } else {
          await finishRound(room.code, players, roundAnswers);
        }
      } finally {
        advancingRef.current = false;
      }
    }, 300);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, room.code, room.tier_index, room.tier_deadline, players.length, roundAnswers.length]);

  function handleInputChange(e) {
    const value = e.target.value;
    setGuess(value);
    if (!value) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      moviesData
        .filter((m) => m.answer.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
    );
  }

  async function handleSubmit(guessValue) {
    if (myAnswer || submitting) return;
    const value = (guessValue ?? guess).trim();
    if (!value) return;

    setSubmitting(true);
    const correct = value.toLowerCase() === movie.answer.toLowerCase();
    try {
      await submitGuess({
        roomCode: room.code,
        roundIndex: room.round_index,
        playerId,
        guess: value,
        correct,
        tierAnswered: room.tier_index,
      });
    } finally {
      setSubmitting(false);
      setSuggestions([]);
    }
  }

  const totalTierMs = TIER_DURATIONS_SEC[room.tier_index] * 1000;
  const pct = totalTierMs > 0 ? Math.round((remainingMs / totalTierMs) * 100) : 0;
  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-8">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            Room {room.code}
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700 shrink-0">
            Round {room.round_index + 1} / {room.movie_queue.length}
          </div>
        </div>

        <ClueCard summaries={movie.summaries} tierIndex={room.tier_index}>
          {/* Live countdown, shared layout slot between the progress dots and clue box */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-[width] duration-200 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-500 tabular-nums w-6 text-right">
              {seconds}
            </span>
          </div>
        </ClueCard>

        <p className="mt-3 text-xs text-slate-400 text-center">
          {roundAnswers.length} of {players.length} answered
        </p>

        {myAnswer ? (
          <div className="mt-4 sm:mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-600">
            You guessed "{myAnswer.guess}" — waiting for the others…
          </div>
        ) : (
          <>
            <div className="mt-4 sm:mt-5 relative">
              <input
                value={guess}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type your guess..."
                inputMode="text"
                autoCapitalize="words"
                autoCorrect="off"
                autoComplete="off"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-base text-slate-900 font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
              {suggestions.length > 0 && (
                <div className="absolute mt-2 w-full max-h-60 overflow-y-auto rounded-lg bg-white border border-slate-200 shadow-lg z-20">
                  {suggestions.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setGuess(m.answer);
                        setSuggestions([]);
                      }}
                      className="px-4 py-3 sm:py-2.5 cursor-pointer text-sm text-slate-700 hover:bg-indigo-50 active:bg-indigo-100"
                    >
                      {m.answer}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={submitting || !guess.trim()}
              className="mt-4 sm:mt-5 w-full rounded-lg py-3 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Guess"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
