import { useMemo, useState } from "react";
import moviesData from "../data/movies.json";
import html2canvas from "html2canvas";
import ClueCard from "./ClueCard";
import MovieFilters from "./MovieFilters";
import { filterMovies, shuffle } from "../lib/movieFilters";

export default function SoloGame({ onBack }) {
  // Which origin/era tags are active. Empty array = no filter on that dimension.
  const [originFilter, setOriginFilter] = useState([]);
  const [eraFilter, setEraFilter] = useState([]);

  const filteredPool = useMemo(
    () => filterMovies(moviesData, originFilter, eraFilter),
    [originFilter, eraFilter]
  );

  // Shuffled queue, reshuffled whenever the active filters change.
  const [movieQueue, setMovieQueue] = useState(() => shuffle(moviesData));

  // Current index in queue
  const [currentIndex, setCurrentIndex] = useState(0);

  // Current movie
  const currentMovie = movieQueue[currentIndex];

  // Guess + autocomplete
  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Progressive summary reveal: 0 = hard only, 1 = +medium, 2 = +easy
  const [tierIndex, setTierIndex] = useState(0);

  // Round state
  const [roundOver, setRoundOver] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Winning streak
  const [winningStreak, setWinningStreak] = useState(0);

  // Last streak before losing/revealing
  const [lastSuccessfulStreak, setLastSuccessfulStreak] = useState(0);

  // Result message
  const [result, setResult] = useState("");

  // Reshuffle the queue and reset the round whenever the active filters change.
  // ("Adjusting state when a prop/derived value changes" — done during render, not an
  // effect, so it doesn't cause an extra render pass. See react.dev/learn/you-might-not-need-an-effect.)
  const filterKey = `${originFilter.join(",")}|${eraFilter.join(",")}`;
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey);
  if (filterKey !== appliedFilterKey) {
    setAppliedFilterKey(filterKey);
    setMovieQueue(shuffle(filteredPool));
    setCurrentIndex(0);
    setGuess("");
    setSuggestions([]);
    setTierIndex(0);
    setRoundOver(false);
    setRevealed(false);
    setWinningStreak(0);
    setResult("");
  }

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

  // Typing handler
  function handleInputChange(e) {
    if (roundOver) return;

    const value = e.target.value;
    setGuess(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = moviesData
      .filter((movie) =>
        movie.answer.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5);

    setSuggestions(filtered);
  }

  function handleSuggestionClick(movieName) {
    setGuess(movieName);
    setSuggestions([]);
  }

  // Submit guess
  function handleSubmit() {
    if (roundOver) return;

    const correct =
      guess.trim().toLowerCase() === currentMovie.answer.toLowerCase();

    if (correct) {
      setResult("✅ Correct!");
      setWinningStreak(winningStreak + 1);

      setRoundOver(true);
      setSuggestions([]);
    } else {
      // Snapshot streak before reset
      setLastSuccessfulStreak(winningStreak);

      setResult("❌ Wrong! Answer revealed.");
      setRevealed(true);
      setRoundOver(true);

      setWinningStreak(0);
      setSuggestions([]);
    }
  }

  // Reveal next (easier) summary tier
  function handleNextClue() {
    if (roundOver) return;
    if (tierIndex < currentMovie.summaries.length - 1) {
      setTierIndex(tierIndex + 1);
    }
  }

  // Reveal manually after all tiers are shown
  function handleReveal() {
    if (roundOver) return;

    // Snapshot streak before reset
    setLastSuccessfulStreak(winningStreak);

    setResult("👀 Answer Revealed!");
    setRevealed(true);
    setRoundOver(true);

    setWinningStreak(0);
    setSuggestions([]);
  }

  // Next movie (sequential, no repeats)
  function handleNext() {
    if (!roundOver) return;

    // End of session
    if (currentIndex + 1 >= movieQueue.length) {
      alert("🎉 You completed all movies in this session!");
      return;
    }

    setCurrentIndex(currentIndex + 1);

    // Reset round
    setGuess("");
    setSuggestions([]);
    setTierIndex(0);
    setRoundOver(false);
    setRevealed(false);
    setResult("");
  }

  // Share Image Card
  async function handleShareImage() {
    const card = document.getElementById("share-card");
    if (!card) return;

    const canvas = await html2canvas(card);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "guess-the-movie-result.png", {
        type: "image/png",
      });

      // Mobile browsers (iOS Safari doesn't support the download attribute):
      // use the native share sheet so the image can actually be saved/shared.
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Guess the Movie",
            text: "Check out my streak on Guess the Movie!",
          });
          return;
        } catch (err) {
          if (err?.name === "AbortError") return;
        }
      }

      // Desktop / unsupported browsers: fall back to a direct download.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "guess-the-movie-result.png";
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  const isLastTier = currentMovie
    ? tierIndex === currentMovie.summaries.length - 1
    : false;

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      {/* Main Game Card */}
      <div className="w-full max-w-xl animate-fade-up rounded-[2rem] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_-20px_rgba(99,102,241,0.4)] p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onBack}
            className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
          >
            ← Menu
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-amber-300 shrink-0">
            🔥 {winningStreak}
          </div>
        </div>

        <h1 className="mt-3 font-display text-lg sm:text-xl font-semibold text-white tracking-tight">
          Guess the Movie
        </h1>

        <MovieFilters
          origins={originFilter}
          eras={eraFilter}
          onToggleOrigin={toggleOrigin}
          onToggleEra={toggleEra}
          matchCount={filteredPool.length}
        />

        {!currentMovie ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-slate-400">
            No movies match these filters — try a different combination.
          </div>
        ) : (
          <>
            <ClueCard summaries={currentMovie.summaries} tierIndex={tierIndex} />

            {/* Input */}
            <div className="mt-4 sm:mt-5 relative">
              <input
                value={guess}
                onChange={handleInputChange}
                disabled={roundOver}
                placeholder="Type your guess..."
                inputMode="text"
                autoCapitalize="words"
                autoCorrect="off"
                autoComplete="off"
                className={`w-full px-4 py-3.5 rounded-2xl border text-base font-medium outline-none transition-all duration-300
                  ${
                    roundOver
                      ? "bg-white/[0.02] border-white/5 text-slate-500"
                      : "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20"
                  }
                `}
              />

              {!roundOver && suggestions.length > 0 && (
                <div className="absolute mt-2 w-full max-h-60 overflow-y-auto rounded-2xl bg-[#0b0d15] border border-white/10 shadow-2xl overflow-hidden z-20">
                  {suggestions.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => handleSuggestionClick(movie.answer)}
                      className="px-4 py-3 sm:py-2.5 cursor-pointer text-sm text-slate-300 hover:bg-white/5 active:bg-white/10"
                    >
                      {movie.answer}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons: Next Clue LEFT, Submit RIGHT */}
            <div className="mt-4 sm:mt-5 flex gap-2 sm:gap-3">
              <button
                onClick={handleNextClue}
                disabled={roundOver || isLastTier}
                className="flex-1 rounded-2xl py-3 text-sm sm:text-base font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5"
              >
                Next Clue
              </button>

              <button
                onClick={handleSubmit}
                disabled={roundOver}
                className="flex-1 rounded-2xl py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_20px_-5px_rgba(139,92,246,0.7)] hover:shadow-[0_0_28px_-5px_rgba(139,92,246,0.9)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Submit
              </button>
            </div>

            {/* Reveal button */}
            {isLastTier && !roundOver && (
              <button
                onClick={handleReveal}
                className="mt-3 w-full rounded-2xl py-3 text-sm sm:text-base font-medium text-rose-300 bg-rose-500/10 border border-rose-400/20 hover:bg-rose-500/15 transition-all duration-300"
              >
                Reveal Answer
              </button>
            )}

            {/* Result */}
            {result && (
              <div
                className={`mt-4 sm:mt-5 rounded-2xl border px-4 py-3 text-center text-sm sm:text-base font-medium ${
                  revealed
                    ? "bg-rose-500/10 border-rose-400/20 text-rose-300"
                    : "bg-emerald-500/10 border-emerald-400/20 text-emerald-300"
                }`}
              >
                {result}
              </div>
            )}

            {/* Answer */}
            {revealed && (
              <p className="mt-3 text-center text-sm sm:text-base text-slate-400 break-words">
                Answer:{" "}
                <span className="font-semibold text-white">
                  {currentMovie.answer}
                </span>
              </p>
            )}

            {/* Share + Next */}
            {roundOver && (
              <div className="mt-4 sm:mt-5 flex gap-2 sm:gap-3">
                <button
                  onClick={handleShareImage}
                  className="flex-1 rounded-2xl py-3 text-sm sm:text-base font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  Share Result
                </button>

                <button
                  onClick={handleNext}
                  className="flex-1 rounded-2xl py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_20px_-5px_rgba(139,92,246,0.7)] hover:shadow-[0_0_28px_-5px_rgba(139,92,246,0.9)] transition-all duration-300"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Card — Uses Last Successful Streak. Solid gradient (no backdrop-blur), so
          html2canvas renders it faithfully when exported as a shareable PNG. */}
      <div
        id="share-card"
        className="fixed -left-[9999px] top-0 w-[500px] p-10 rounded-[2rem]
             bg-gradient-to-br from-[#0b0d18] to-[#1a1030] border-2 border-indigo-500/40"
      >
        {/* Title */}
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          🎬 Guess the Movie
        </h1>

        {/* Streak Only */}
        <p className="mt-6 text-2xl font-semibold text-slate-300">
          Winning Streak:{" "}
          <span className="text-indigo-300">
            {roundOver ? lastSuccessfulStreak : winningStreak}
          </span>
        </p>

        {/* Footer */}
        <p className="mt-12 text-base text-slate-500">
          Play now → Guess The Movie
        </p>
      </div>
    </div>
  );
}
