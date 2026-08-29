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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl animate-fade-up rounded-[2rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_-20px_rgba(99,102,241,0.45)] p-6 sm:p-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
          🎬 The clue is the entertainment
        </span>

        <h1 className="mt-6 font-display text-4xl sm:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-indigo-200">
          Guess the Movie
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-md mx-auto">
          A terrible summary. A famous movie. Can you name it before your
          friends do?
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <button
            onClick={() => setView("mp-home")}
            className="group relative rounded-2xl py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_25px_-6px_rgba(139,92,246,0.7)] hover:shadow-[0_0_40px_-6px_rgba(139,92,246,0.9)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            Play with Friends
          </button>
          <button
            onClick={() => setView("solo")}
            className="rounded-2xl py-4 text-base font-semibold text-slate-100 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.99] transition-all duration-300"
          >
            Play Solo
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-500">
          1000 movies · Hollywood &amp; Bollywood · no login required
        </p>
      </div>
    </div>
  );
}
