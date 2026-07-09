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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <p className="text-sm text-slate-400">Connecting…</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
        <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Room not found</p>
          <p className="mt-2 text-sm text-slate-500">
            This room may have ended or the code was mistyped.
          </p>
          <button
            onClick={onLeave}
            className="mt-5 rounded-lg py-3 px-6 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
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
