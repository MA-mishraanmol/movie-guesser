import { useMemo, useState } from "react";
import { colorForIndex } from "../../lib/roomCode";
import { startGame } from "../../lib/roomActions";
import MovieFilters from "../MovieFilters";
import { filterMovies } from "../../lib/movieFilters";
import moviesData from "../../data/movies.json";

export default function Lobby({ room, players, playerId, onLeave }) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [originFilter, setOriginFilter] = useState([]);
  const [eraFilter, setEraFilter] = useState([]);
  const isHost = room.host_player_id === playerId;

  const matchCount = useMemo(
    () => filterMovies(moviesData, originFilter, eraFilter).length,
    [originFilter, eraFilter]
  );

  function toggleOrigin(value) {
    setOriginFilter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleEra(value) {
    setEraFilter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleStart() {
    setStarting(true);
    setError("");
    try {
      await startGame(room.code, originFilter, eraFilter);
    } catch (err) {
      setError(err.message || "Couldn't start the game. Try again.");
      setStarting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl animate-fade-up rounded-[2rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_-20px_rgba(99,102,241,0.4)] p-4 sm:p-8">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onLeave}
            className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
          >
            ← Leave
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 shrink-0">
            {players.length} {players.length === 1 ? "player" : "players"}
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Room code
        </p>
        <p className="mt-1 text-center text-4xl sm:text-5xl font-display font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300">
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
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${color.bg}`} />
                <span className="text-sm font-medium text-slate-200 truncate">
                  {player.nickname}
                  {isYou && <span className="text-slate-500"> (you)</span>}
                </span>
                {isRoomHost && (
                  <span className="ml-auto text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 rounded-full px-2 py-0.5 shrink-0">
                    Host
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {isHost && (
          <MovieFilters
            origins={originFilter}
            eras={eraFilter}
            onToggleOrigin={toggleOrigin}
            onToggleEra={toggleEra}
            matchCount={matchCount}
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-2xl px-3 py-2">
            {error}
          </p>
        )}

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={starting || players.length < 1 || matchCount === 0}
            className="mt-6 w-full rounded-2xl py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_25px_-6px_rgba(139,92,246,0.7)] hover:shadow-[0_0_35px_-6px_rgba(139,92,246,0.9)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
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
