import { useState } from "react";
import moviesData from "../data/movies.json";
import html2canvas from "html2canvas";
import ClueCard from "./ClueCard";

export default function SoloGame({ onBack }) {
  // Shuffle movies ONCE per session
  const [movieQueue] = useState(() =>
    [...moviesData].sort(() => Math.random() - 0.5)
  );

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

  const isLastTier = tierIndex === currentMovie.summaries.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      {/* Main Game Card */}
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-slate-600 transition"
          >
            ← Menu
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700 shrink-0">
            🔥 {winningStreak}
          </div>
        </div>

        <h1 className="mt-3 text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
          Guess the Movie
        </h1>

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
            className={`w-full px-4 py-3 rounded-lg border text-base text-slate-900 font-medium outline-none transition
              ${
                roundOver
                  ? "bg-slate-100 border-slate-200 text-slate-400"
                  : "bg-white border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              }
            `}
          />

          {!roundOver && suggestions.length > 0 && (
            <div className="absolute mt-2 w-full max-h-60 overflow-y-auto rounded-lg bg-white border border-slate-200 shadow-lg overflow-hidden z-20">
              {suggestions.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleSuggestionClick(movie.answer)}
                  className="px-4 py-3 sm:py-2.5 cursor-pointer text-sm text-slate-700 hover:bg-indigo-50 active:bg-indigo-100"
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
            className="flex-1 rounded-lg py-3 text-sm sm:text-base font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next Clue
          </button>

          <button
            onClick={handleSubmit}
            disabled={roundOver}
            className="flex-1 rounded-lg py-3 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>

        {/* Reveal button */}
        {isLastTier && !roundOver && (
          <button
            onClick={handleReveal}
            className="mt-3 w-full rounded-lg py-3 text-sm sm:text-base font-medium text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 transition"
          >
            Reveal Answer
          </button>
        )}

        {/* Result */}
        {result && (
          <div
            className={`mt-4 sm:mt-5 rounded-lg border px-4 py-3 text-center text-sm sm:text-base font-medium ${
              revealed
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {result}
          </div>
        )}

        {/* Answer */}
        {revealed && (
          <p className="mt-3 text-center text-sm sm:text-base text-slate-600 break-words">
            Answer:{" "}
            <span className="font-semibold text-slate-900">
              {currentMovie.answer}
            </span>
          </p>
        )}

        {/* Share + Next */}
        {roundOver && (
          <div className="mt-4 sm:mt-5 flex gap-2 sm:gap-3">
            <button
              onClick={handleShareImage}
              className="flex-1 rounded-lg py-3 text-sm sm:text-base font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition"
            >
              Share Result
            </button>

            <button
              onClick={handleNext}
              className="flex-1 rounded-lg py-3 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Share Card Uses Last Successful Streak */}
      <div
        id="share-card"
        className="fixed -left-[9999px] top-0 w-[500px] p-10 rounded-2xl
             bg-white border-2 border-indigo-600 shadow-2xl"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Guess the Movie
        </h1>

        {/* Streak Only */}
        <p className="mt-6 text-2xl font-semibold text-slate-700">
          Winning Streak:{" "}
          <span className="text-indigo-600">
            {roundOver ? lastSuccessfulStreak : winningStreak}
          </span>
        </p>

        {/* Footer */}
        <p className="mt-12 text-base text-slate-400">
          Play now → Guess The Movie
        </p>
      </div>
    </div>
  );
}
