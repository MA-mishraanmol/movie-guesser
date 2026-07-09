import { useState } from "react";
import SoloGame from "./components/SoloGame";
import MultiplayerHome from "./components/multiplayer/Home";
import MultiplayerFlow from "./components/multiplayer/MultiplayerFlow";

export default function App() {
  const [view, setView] = useState("menu"); // menu | solo | mp-home | mp-room
  const [session, setSession] = useState(null); // { roomCode, playerId }

  function goToMenu() {
    setView("menu");
    setSession(null);
  }

  if (view === "solo") {
    return <SoloGame onBack={goToMenu} />;
  }

  if (view === "mp-home") {
    return (
      <MultiplayerHome
        onBack={goToMenu}
        onEnterRoom={({ roomCode, playerId }) => {
          setSession({ roomCode, playerId });
          setView("mp-room");
        }}
      />
    );
  }

  if (view === "mp-room" && session) {
    return (
      <MultiplayerFlow
        roomCode={session.roomCode}
        playerId={session.playerId}
        onLeave={goToMenu}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          🎬 Guess the Movie
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          A bad summary. A famous movie. Can you guess it before your friends?
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => setView("mp-home")}
            className="rounded-lg py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition"
          >
            Play with Friends
          </button>
          <button
            onClick={() => setView("solo")}
            className="rounded-lg py-4 text-base font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition"
          >
            Play Solo
          </button>
        </div>
      </div>
    </div>
  );
}
