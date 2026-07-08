import { useState } from "react";
import moviesData from "./data/movies.json";
import html2canvas from "html2canvas";

export default function App() {
  // ✅ Shuffle movies ONCE per session
  const [movieQueue, setMovieQueue] = useState(() =>
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

  // ✅ Last streak before losing/revealing
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
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = "guess-the-movie-result.png";
    link.click();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 flex items-center justify-center px-4">
      {/* Main Game Card */}
      <div className="w-full max-w-xl rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🎬 Guess The Movie</h1>

          <div className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold">
            🔥 Streak: {winningStreak}
          </div>
        </div>

        {/* Progressive summaries: hard -> medium -> easy, stacked as they're revealed */}
        <div className="mt-6 space-y-3">
          {currentMovie.summaries.slice(0, tierIndex + 1).map((s, i) => (
            <div
              key={s.tier}
              className={`rounded-2xl p-6 border ${
                i === tierIndex
                  ? "bg-white/15 border-white/20"
                  : "bg-white/5 border-white/10 opacity-60"
              }`}
            >
              <span className="block text-xs uppercase tracking-wide font-semibold text-purple-300 mb-1">
                {s.tier}
              </span>
              <p className="text-lg leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="mt-6 relative">
          <input
            value={guess}
            onChange={handleInputChange}
            disabled={roundOver}
            placeholder="Type your guess..."
            className={`w-full px-4 py-3 rounded-xl text-black font-medium outline-none
              ${roundOver ? "bg-gray-300" : "bg-white"}
            `}
          />

          {!roundOver && suggestions.length > 0 && (
            <div className="absolute mt-2 w-full rounded-xl bg-white shadow-lg overflow-hidden z-20">
              {suggestions.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleSuggestionClick(movie.answer)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200 text-black"
                >
                  {movie.answer}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Buttons: Next Clue LEFT, Submit RIGHT */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleNextClue}
            disabled={roundOver || tierIndex >= currentMovie.summaries.length - 1}
            className="flex-1 rounded-xl py-3 font-semibold bg-white/20 hover:bg-white/30 transition disabled:opacity-50"
          >
            🔓 Next Clue ({tierIndex + 1}/{currentMovie.summaries.length})
          </button>

          <button
            onClick={handleSubmit}
            disabled={roundOver}
            className="flex-1 rounded-xl py-3 font-semibold bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
          >
            Submit
          </button>
        </div>

        {/* Reveal button */}
        {tierIndex === currentMovie.summaries.length - 1 && !roundOver && (
          <button
            onClick={handleReveal}
            className="mt-5 w-full rounded-xl py-3 font-semibold bg-red-600 hover:bg-red-700 transition"
          >
            👀 Reveal Answer
          </button>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-bold">{result}</h2>
          </div>
        )}

        {/* Answer */}
        {revealed && (
          <p className="mt-3 text-center text-lg">
            Answer:{" "}
            <span className="font-bold text-yellow-300">
              {currentMovie.answer}
            </span>
          </p>
        )}

        {/* Share + Next */}
        {roundOver && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleShareImage}
              className="flex-1 rounded-xl py-3 font-semibold bg-green-600 hover:bg-green-700 transition"
            >
              🖼️ Share Card
            </button>

            <button
              onClick={handleNext}
              className="flex-1 rounded-xl py-3 font-semibold bg-white/20 hover:bg-white/30 transition"
            >
              Next →
            </button>  
          </div>
        )}
      </div>

      {/* ✅ Share Card Uses Last Successful Streak */}
      <div
        id="share-card"
        className="fixed -left-[9999px] top-0 w-[500px] p-10 rounded-3xl 
             bg-gradient-to-br from-purple-700 via-purple-800 to-black 
             text-white shadow-2xl"
      >
        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight">
          🎬 Guess The Movie
        </h1>

        {/* Streak Only */}
        <p className="mt-6 text-2xl font-bold">
          🔥 Winning Streak:{" "}
          <span className="text-yellow-300">
            {roundOver ? lastSuccessfulStreak : winningStreak}
          </span>
        </p>

        {/* Footer */}
        <p className="mt-12 text-lg opacity-80">
          Play now → Guess The Movie MVP
        </p>
      </div>
    </div>
  );
}
