import { useRoom } from "../../hooks/useRoom";
import Lobby from "./Lobby";
import GameRoom from "./GameRoom";
import RoundResult from "./RoundResult";
import Leaderboard from "./Leaderboard";

// Owns the single realtime subscription for this room and routes to the right screen
// based on room.status, so child screens stay presentational.
export default function MultiplayerFlow({ roomCode, playerId, onLeave }) {
  const { room, players, answers, loading } = useRoom(roomCode);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-slate-400 animate-pulse">Connecting…</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
        <div className="w-full max-w-xl animate-fade-up rounded-[2rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_-20px_rgba(99,102,241,0.4)] p-6 sm:p-8 text-center">
          <p className="text-lg font-semibold text-white">Room not found</p>
          <p className="mt-2 text-sm text-slate-400">
            This room may have ended or the code was mistyped.
          </p>
          <button
            onClick={onLeave}
            className="mt-5 rounded-2xl py-3 px-6 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_20px_-5px_rgba(139,92,246,0.7)] hover:shadow-[0_0_28px_-5px_rgba(139,92,246,0.9)] transition-all duration-300"
          >
            ← Back to menu
          </button>
        </div>
      </div>
    );
  }

  switch (room.status) {
    case "playing":
      return (
        <GameRoom room={room} players={players} answers={answers} playerId={playerId} />
      );
    case "round_result":
      return (
        <RoundResult room={room} players={players} answers={answers} playerId={playerId} />
      );
    case "game_over":
      return (
        <Leaderboard room={room} players={players} playerId={playerId} onLeave={onLeave} />
      );
    case "lobby":
    default:
      return (
        <Lobby room={room} players={players} playerId={playerId} onLeave={onLeave} />
      );
  }
}
