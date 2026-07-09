import { useState } from "react";
import { colorForIndex } from "../../lib/roomCode";
import { startGame } from "../../lib/roomActions";

export default function Lobby({ room, players, playerId, onLeave }) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const isHost = room.host_player_id === playerId;

  async function handleStart() {
    setStarting(true);
    setError("");
    try {
      await startGame(room.code);
    } catch (err) {
      setError(err.message || "Couldn't start the game. Try again.");
      setStarting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-8">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onLeave}
            className="text-sm text-slate-400 hover:text-slate-600 transition"
          >
            ← Leave
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700 shrink-0">
            {players.length} {players.length === 1 ? "player" : "players"}
          </div>
        </div>

        <p className="mt-5 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
          Room code
        </p>
        <p className="mt-1 text-center text-4xl sm:text-5xl font-bold tracking-[0.3em] text-indigo-600">
          {room.code}
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Share this code — friends can join from their own phones
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {players.map((player, i) => {
            const color = colorForIndex(player.color_index ?? i);
            const isYou = player.id === playerId;
            const isRoomHost = player.id === room.host_player_id;
            return (
              <div
                key={player.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"
              >
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${color.bg}`} />
                <span className="text-sm font-medium text-slate-800 truncate">
                  {player.nickname}
                  {isYou && <span className="text-slate-400"> (you)</span>}
                </span>
                {isRoomHost && (
                  <span className="ml-auto text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 shrink-0">
                    Host
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={starting || players.length < 1}
            className="mt-6 w-full rounded-lg py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {starting ? "Starting…" : "Start Game"}
          </button>
        ) : (
          <p className="mt-6 text-center text-sm text-slate-500">
            Waiting for the host to start the game…
          </p>
        )}
      </div>
    </div>
  );
}
