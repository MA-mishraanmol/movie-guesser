import { useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { createRoom, joinRoom } from "../../lib/roomActions";

export default function MultiplayerHome({ onEnterRoom, onBack }) {
  const [mode, setMode] = useState("choose"); // choose | create | join
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
        <div className="w-full max-w-xl animate-fade-up rounded-[2rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_-20px_rgba(99,102,241,0.4)] p-6 sm:p-8 text-center">
          <p className="text-lg font-semibold text-white">
            Multiplayer isn't set up yet
          </p>
          <p className="mt-2 text-sm text-slate-400">
            This build is missing its Supabase connection (VITE_SUPABASE_URL /
            VITE_SUPABASE_ANON_KEY). Solo mode still works fine.
          </p>
          <button
            onClick={onBack}
            className="mt-5 rounded-2xl py-3 px-6 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_20px_-5px_rgba(139,92,246,0.7)] hover:shadow-[0_0_28px_-5px_rgba(139,92,246,0.9)] transition-all duration-300"
          >
            ← Back to menu
          </button>
        </div>
      </div>
    );
  }

  async function handleCreate() {
    if (!nickname.trim()) {
      setError("Enter a nickname first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { roomCode, playerId } = await createRoom(nickname.trim());
      onEnterRoom({ roomCode, playerId });
    } catch (err) {
      setError(err.message || "Couldn't create a room. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!nickname.trim()) {
      setError("Enter a nickname first.");
      return;
    }
    if (code.trim().length < 4) {
      setError("Enter the 4-character room code.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { roomCode, playerId } = await joinRoom(code, nickname.trim());
      onEnterRoom({ roomCode, playerId });
    } catch (err) {
      setError(err.message || "Couldn't join that room. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl animate-fade-up rounded-[2rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_-20px_rgba(99,102,241,0.4)] p-4 sm:p-8">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
        >
          ← Menu
        </button>

        <h1 className="mt-3 font-display text-lg sm:text-xl font-semibold text-white tracking-tight">
          Play with Friends
        </h1>

        {mode === "choose" && (
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => setMode("create")}
              className="rounded-2xl py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_25px_-6px_rgba(139,92,246,0.7)] hover:shadow-[0_0_35px_-6px_rgba(139,92,246,0.9)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Create a Room
            </button>
            <button
              onClick={() => setMode("join")}
              className="rounded-2xl py-4 text-base font-semibold text-slate-100 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Join a Room
            </button>
          </div>
        )}

        {mode !== "choose" && (
          <div className="mt-6 flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Your nickname
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                placeholder="e.g. Popcorn Pete"
                className="mt-1.5 w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-base text-white font-medium placeholder:text-slate-500 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-300"
              />
            </div>

            {mode === "join" && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Room code
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="K7QX"
                  className="mt-1.5 w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-2xl tracking-[0.3em] text-center font-bold text-white outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-300 uppercase"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-2xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 sm:gap-3 mt-1">
              <button
                onClick={() => {
                  setMode("choose");
                  setError("");
                }}
                className="flex-1 rounded-2xl py-3 text-sm sm:text-base font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                Back
              </button>
              <button
                onClick={mode === "create" ? handleCreate : handleJoin}
                disabled={busy}
                className="flex-1 rounded-2xl py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_20px_-5px_rgba(139,92,246,0.7)] hover:shadow-[0_0_28px_-5px_rgba(139,92,246,0.9)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {busy
                  ? "One sec…"
                  : mode === "create"
                  ? "Create Room"
                  : "Join Room"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
