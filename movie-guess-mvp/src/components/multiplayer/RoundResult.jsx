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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 text-center">
          Round {room.round_index + 1} of {room.movie_queue.length}
        </p>
        <p className="mt-1 text-center text-2xl font-bold text-slate-900">
          {movie.answer}
        </p>

        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-center text-sm font-medium ${
            myAnswer?.correct
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {myAnswer?.correct
            ? `✅ Correct! +${myAnswer.points} points`
            : myAnswer
            ? "❌ Not quite"
            : "⌛ No answer submitted"}
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">
            Standings
          </p>
          <RankedList players={players} playerId={playerId} />
        </div>

        {isHost && (
          <button
            onClick={handleContinue}
            disabled={advancing}
            className="mt-6 w-full rounded-lg py-3 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-40"
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
