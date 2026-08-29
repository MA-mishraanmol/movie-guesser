import { supabase } from "./supabaseClient";
import { generateRoomCode, normalizeRoomCode } from "./roomCode";
import moviesData from "../data/movies.json";
import { TIER_DURATIONS_SEC, TIER_POINTS, ROUNDS_PER_GAME } from "./gameConfig";
import { filterMovies } from "./movieFilters";

function tierDeadline(tierIndex) {
  return new Date(Date.now() + TIER_DURATIONS_SEC[tierIndex] * 1000).toISOString();
}

// Retries a few times in case of a rare room-code collision.
export async function createRoom(nickname) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { error: roomError } = await supabase.from("rooms").insert({
      code,
      status: "lobby",
    });
    if (roomError) {
      if (roomError.code === "23505") continue; // code collision, retry
      throw roomError;
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({ room_code: code, nickname, color_index: 0 })
      .select()
      .single();
    if (playerError) throw playerError;

    const { error: updateError } = await supabase
      .from("rooms")
      .update({ host_player_id: player.id })
      .eq("code", code);
    if (updateError) throw updateError;

    return { roomCode: code, playerId: player.id };
  }
  throw new Error("Could not generate a unique room code, please try again.");
}

export async function joinRoom(rawCode, nickname) {
  const code = normalizeRoomCode(rawCode);

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (roomError) throw roomError;
  if (!room) throw new Error("Room not found. Double-check the code.");
  if (room.status !== "lobby") {
    throw new Error("This game has already started.");
  }

  const { count } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("room_code", code);

  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({ room_code: code, nickname, color_index: count ?? 0 })
    .select()
    .single();
  if (playerError) throw playerError;

  return { roomCode: code, playerId: player.id };
}

// origins/eras: arrays of selected filter values ("indian"/"foreign", "pre2000"/"post2000").
// An empty array means no filter on that dimension. Falls back to the full catalog if the
// chosen combination happens to match nothing.
export async function startGame(roomCode, origins = [], eras = []) {
  const pool = filterMovies(moviesData, origins, eras);
  const source = pool.length > 0 ? pool : moviesData;

  const shuffled = [...source]
    .sort(() => Math.random() - 0.5)
    .slice(0, ROUNDS_PER_GAME)
    .map((m) => m.id);

  const { error } = await supabase
    .from("rooms")
    .update({
      status: "playing",
      movie_queue: shuffled,
      round_index: 0,
      tier_index: 0,
      tier_deadline: tierDeadline(0),
    })
    .eq("code", roomCode);
  if (error) throw error;
}

export async function advanceTier(roomCode, nextTierIndex) {
  const { error } = await supabase
    .from("rooms")
    .update({
      tier_index: nextTierIndex,
      tier_deadline: tierDeadline(nextTierIndex),
    })
    .eq("code", roomCode);
  if (error) throw error;
}

export async function submitGuess({
  roomCode,
  roundIndex,
  playerId,
  guess,
  correct,
  tierAnswered,
}) {
  const points = correct ? TIER_POINTS[tierAnswered] : 0;
  const { error } = await supabase.from("answers").insert({
    room_code: roomCode,
    round_index: roundIndex,
    player_id: playerId,
    guess,
    correct,
    tier_answered: tierAnswered,
    points,
  });
  if (error) throw error;
  return points;
}

// Host-only: tallies this round's answers into player scores/streaks and shows the result.
export async function finishRound(roomCode, players, roundAnswers) {
  const updates = players.map((player) => {
    const answer = roundAnswers.find((a) => a.player_id === player.id);
    const gotItRight = Boolean(answer?.correct);
    const points = answer?.points ?? 0;
    return supabase
      .from("players")
      .update({
        score: player.score + points,
        streak: gotItRight ? player.streak + 1 : 0,
      })
      .eq("id", player.id);
  });
  await Promise.all(updates);

  const { error } = await supabase
    .from("rooms")
    .update({ status: "round_result" })
    .eq("code", roomCode);
  if (error) throw error;
}

// Host-only: moves to the next round, or ends the game if the queue is exhausted.
export async function nextRound(roomCode, currentRoundIndex, queueLength) {
  const next = currentRoundIndex + 1;
  if (next >= queueLength) {
    const { error } = await supabase
      .from("rooms")
      .update({ status: "game_over" })
      .eq("code", roomCode);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("rooms")
    .update({
      round_index: next,
      tier_index: 0,
      tier_deadline: tierDeadline(0),
      status: "playing",
    })
    .eq("code", roomCode);
  if (error) throw error;
}
