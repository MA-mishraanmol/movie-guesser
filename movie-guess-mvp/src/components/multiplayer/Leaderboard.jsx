import { colorForIndex } from "../../lib/roomCode";
import { startGame } from "../../lib/roomActions";
import { useState } from "react";

// Reusable ranked list — used both between rounds (inside RoundResult) and on the
// final game-over screen below.
export function RankedList({ players, playerId }) {
  const ranked = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-2">
      {ranked.map((player, i) => {
        const color = colorForIndex(player.color_index ?? i);
        const isYou = player.id === playerId;
        return (
          <div
            key={player.id}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
              isYou
                ? "border-indigo-400/30 bg-indigo-500/10"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <span className="text-sm font-semibold text-slate-500 w-5 shrink-0">
              {i + 1}
            </span>
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${color.bg}`} />
            <span className="text-sm font-medium text-slate-200 truncate">
              {player.nickname}
              {isYou && <span className="text-slate-500"> (you)</span>}
            </span>
            {player.streak >= 2 && (
              <span className="text-xs text-amber-300 shrink-0">🔥{player.streak}</span>
            )}
            <span className="ml-auto text-sm font-semibold text-white shrink-0 tabular-nums">
              {player.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ room, players, playerId, onLeave }) {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const podium = ranked.slice(0, 3);
  const isHost = room.host_player_id === playerId;
  const [restarting, setRestarting] = useState(false);

  async function handlePlayAgain() {
    setRestarting(true);
    try {
      await startGame(room.code);
    } finally {
      setRestarting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl animate-fade-up rounded-[2rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_-20px_rgba(99,102,241,0.4)] p-4 sm:p-8">
        <h1 className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight text-center">
          🎬 Game Over
        </h1>

        {podium.length > 0 && (
          <div className="mt-6 flex items-end justify-center gap-3">
            {podium.map((player, i) => (
              <div key={player.id} className="flex flex-col items-center gap-1">
                <span className="text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  {MEDALS[i]}
                </span>
                <span className="text-sm font-medium text-slate-200 max-w-[6rem] truncate">
                  {player.nickname}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {player.score} pts
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <RankedList players={players} playerId={playerId} />
        </div>

        <div className="mt-6 flex gap-2 sm:gap-3">
          <button
            onClick={onLeave}
            className="flex-1 rounded-2xl py-3 text-sm sm:text-base font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            Back to Menu
          </button>
          {isHost && (
            <button
              onClick={handlePlayAgain}
              disabled={restarting}
              className="flex-1 rounded-2xl py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_20px_-5px_rgba(139,92,246,0.7)] hover:shadow-[0_0_28px_-5px_rgba(139,92,246,0.9)] transition-all duration-300 disabled:opacity-30 disabled:shadow-none"
            >
              {restarting ? "Starting…" : "Play Again"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
