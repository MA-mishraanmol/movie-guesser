import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Subscribes to a room's rooms/players/answers rows via Supabase Realtime and keeps
// them in sync across every connected client.
export function useRoom(roomCode) {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(roomCode && supabase));

  useEffect(() => {
    if (!roomCode || !supabase) return;

    let active = true;

    async function loadInitial() {
      const [roomRes, playersRes, answersRes] = await Promise.all([
        supabase.from("rooms").select("*").eq("code", roomCode).maybeSingle(),
        supabase
          .from("players")
          .select("*")
          .eq("room_code", roomCode)
          .order("joined_at", { ascending: true }),
        supabase.from("answers").select("*").eq("room_code", roomCode),
      ]);
      if (!active) return;
      setRoom(roomRes.data ?? null);
      setPlayers(playersRes.data ?? []);
      setAnswers(answersRes.data ?? []);
      setLoading(false);
    }
    loadInitial();

    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `code=eq.${roomCode}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setRoom(null);
            return;
          }
          setRoom(payload.new);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_code=eq.${roomCode}` },
        (payload) => {
          setPlayers((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((p) => p.id === payload.new.id)) return prev;
              return [...prev, payload.new].sort((a, b) =>
                a.joined_at.localeCompare(b.joined_at)
              );
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((p) => (p.id === payload.new.id ? payload.new : p));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((p) => p.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "answers", filter: `room_code=eq.${roomCode}` },
        (payload) => {
          setAnswers((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((a) => a.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((a) => (a.id === payload.new.id ? payload.new : a));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((a) => a.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  return { room, players, answers, loading };
}
