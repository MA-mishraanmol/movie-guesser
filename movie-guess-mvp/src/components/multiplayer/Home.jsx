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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
        <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">
            Multiplayer isn't set up yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            This build is missing its Supabase connection (VITE_SUPABASE_URL /
            VITE_SUPABASE_ANON_KEY). Solo mode still works fine.
          </p>
          <button
            onClick={onBack}
            className="mt-5 rounded-lg py-3 px-6 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-8">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-slate-600 transition"
        >
          ← Menu
        </button>

        <h1 className="mt-3 text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
          Play with Friends
        </h1>

        {mode === "choose" && (
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => setMode("create")}
              className="rounded-lg py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition"
            >
              Create a Room
            </button>
            <button
              onClick={() => setMode("join")}
              className="rounded-lg py-4 text-base font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition"
            >
              Join a Room
            </button>
          </div>
        )}

        {mode !== "choose" && (
          <div className="mt-6 flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Your nickname
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                placeholder="e.g. Popcorn Pete"
                className="mt-1.5 w-full px-4 py-3 rounded-lg border border-slate-300 text-base text-slate-900 font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            {mode === "join" && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Room code
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="K7QX"
                  className="mt-1.5 w-full px-4 py-3 rounded-lg border border-slate-300 text-2xl tracking-[0.3em] text-center font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition uppercase"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 sm:gap-3 mt-1">
              <button
                onClick={() => {
                  setMode("choose");
                  setError("");
                }}
                className="flex-1 rounded-lg py-3 text-sm sm:text-base font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition"
              >
                Back
              </button>
              <button
                onClick={mode === "create" ? handleCreate : handleJoin}
                disabled={busy}
                className="flex-1 rounded-lg py-3 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
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
