// Shared filter option config + pool logic, used by both Solo mode and the
// multiplayer host's pre-game filters (Lobby).

export const ORIGIN_OPTIONS = [
  { value: "indian", emoji: "🎭", label: "Desi Drama" },
  { value: "foreign", emoji: "🌍", label: "Firangi Flicks" },
];

export const ERA_OPTIONS = [
  { value: "pre2000", emoji: "📼", label: "VHS Vibes" },
  { value: "post2000", emoji: "🚀", label: "Y2K+" },
];

// origins/eras are arrays of selected values; an empty array means "no filter on this dimension".
export function filterMovies(movies, origins, eras) {
  return movies.filter(
    (m) =>
      (origins.length === 0 || origins.includes(m.origin)) &&
      (eras.length === 0 || eras.includes(m.era))
  );
}

export function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
