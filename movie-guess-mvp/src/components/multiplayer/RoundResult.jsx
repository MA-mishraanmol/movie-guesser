import { useEffect, useRef, useState } from "react";
import moviesData from "../../data/movies.json";
import { RankedList } from "./Leaderboard";
import { nextRound } from "../../lib/roomActions";
import { ROUND_RESULT_PAUSE_MS } from "../../lib/gameConfig";

const moviesById = new Map(moviesData.map((m) => [m.id, m]));

export default function RoundResult({ room, players, answers, playerId }) {
  const movie = moviesById.get(room.movie_queue[room.round_index]);
  const roundAnswers = answers.filter((a) => a.round_index === room.round_index);
  const myAnswer = roundAnswers.find((a) => a.player_id === playerId);

  const isHost = room.host_player_id === playerId;
  const isLastRound = room.round_index + 1 >= room.movie_queue.length;
  const [advancing, setAdvancing] = useState(false);
  const timeoutRef = useRef(null);
  const firedRef = useRef(false);

  async function handleContinue() {
    if (firedRef.current) return;
    firedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAdvancing(true);
    try {
      await nextRound(room.code, room.round_index, room.movie_queue.length);
    } finally {
      setAdvancing(false);
    }
  }

  // Host auto-advances after a short pause so the game doesn't stall if nobody clicks.
  useEffect(() => {
    if (!isHost) return;
    firedRef.current = false;
    timeoutRef.current = setTimeout(handleContinue, ROUND_RESULT_PAUSE_MS);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, room.round_index]);

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl animate-fade-up rounded-[2rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_-20px_rgba(99,102,241,0.4)] p-4 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 text-center">
          Round {room.round_index + 1} of {room.movie_queue.length}
        </p>
        <p className="mt-1 text-center font-display text-2xl font-bold text-white">
          {movie.answer}
        </p>

        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-center text-sm font-medium ${
            myAnswer?.correct
              ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-400/20 text-rose-300"
          }`}
        >
          {myAnswer?.correct
            ? `✅ Correct! +${myAnswer.points} points`
            : myAnswer
            ? "❌ Not quite"
            : "⌛ No answer submitted"}
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
            Standings
          </p>
          <RankedList players={players} playerId={playerId} />
        </div>

        {isHost && (
          <button
            onClick={handleContinue}
            disabled={advancing}
            className="mt-6 w-full rounded-2xl py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_20px_-5px_rgba(139,92,246,0.7)] hover:shadow-[0_0_28px_-5px_rgba(139,92,246,0.9)] transition-all duration-300 disabled:opacity-30 disabled:shadow-none"
          >
            {advancing
              ? "Loading…"
              : isLastRound
              ? "See Final Results"
              : "Next Round →"}
          </button>
        )}
      </div>
    </div>
  );
}
