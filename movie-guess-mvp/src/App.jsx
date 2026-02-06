import { useState } from "react";
import movies from "./data/movies.json";
import html2canvas from "html2canvas";

export default function App() {
  const [currentMovie, setCurrentMovie] = useState(
    movies[Math.floor(Math.random() * movies.length)]
  );

  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [hintIndex, setHintIndex] = useState(0);

  const [roundOver, setRoundOver] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const [winningStreak, setWinningStreak] = useState(0);
  const [result, setResult] = useState("");

  // Input handler
  function handleInputChange(e) {
    if (roundOver) return;

    const value = e.target.value;
    setGuess(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = movies
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
      guess.trim().toLowerCase() ===
      currentMovie.answer.trim().toLowerCase();

    if (correct) {
      setResult("✅ Correct!");
      setWinningStreak(winningStreak + 1);
      setRoundOver(true);
      setSuggestions([]);
    } else {
      setResult("❌ Wrong! Answer revealed.");
      setRevealed(true);
      setRoundOver(true);

      // streak resets
      setWinningStreak(0);
      setSuggestions([]);
    }
  }

  // Hint system
  function handleHint() {
    if (roundOver) return;
    if (hintIndex < 3) setHintIndex(hintIndex + 1);
  }

  // Reveal manually
  function handleReveal() {
    if (roundOver) return;

    setResult("👀 Answer Revealed!");
    setRevealed(true);
    setRoundOver(true);

    setWinningStreak(0);
    setSuggestions([]);
  }

  // Next movie
  function handleNext() {
    if (!roundOver) return;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * movies.length);
    } while (movies[randomIndex].id === currentMovie.id);

    setCurrentMovie(movies[randomIndex]);

    setGuess("");
    setSuggestions([]);
    setHintIndex(0);

    setRoundOver(false);
    setRevealed(false);
    setResult("");
  }

  // ✅ Generate Share Image Card
  async function handleShareImage() {
    const card = document.getElementById("share-card");

    if (!card) return;

    const canvas = await html2canvas(card);

    // Convert canvas → image link
    const image = canvas.toDataURL("image/png");

    // Download automatically
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
          <h1 className="text-3xl font-bold tracking-tight">
            🎬 Guess The Movie
          </h1>

          <div className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold">
            🔥 Streak: {winningStreak}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-2xl bg-white/15 p-6 border border-white/10">
          <p className="text-lg leading-relaxed">{currentMovie.summary}</p>
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

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={roundOver}
            className="flex-1 rounded-xl py-3 font-semibold bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
          >
            Submit
          </button>

          <button
            onClick={handleHint}
            disabled={roundOver || hintIndex >= 3}
            className="flex-1 rounded-xl py-3 font-semibold bg-white/20 hover:bg-white/30 transition disabled:opacity-50"
          >
            💡 Hint ({hintIndex}/3)
          </button>
        </div>

        {/* Hint Chips */}
        {hintIndex > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentMovie.hints.slice(0, hintIndex).map((hint, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-white/20 text-sm"
              >
                {hint}
              </span>
            ))}
          </div>
        )}

        {/* Reveal */}
        {hintIndex === 3 && !roundOver && (
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

      {/* ✅ Hidden Share Card (Rendered for Image Export) */}
      <div
        id="share-card"
        className="fixed -left-[9999px] top-0 w-[500px] p-8 rounded-3xl bg-gradient-to-br from-purple-700 to-black text-white"
      >
        <h1 className="text-3xl font-bold">🎬 Guess The Movie</h1>

        <p className="mt-4 text-xl">🔥 Winning Streak: {winningStreak}</p>

        <p className="mt-3 text-lg">{result}</p>

        <p className="mt-6 text-sm opacity-80">
          Play now → Guess The Movie MVP
        </p>
      </div>
    </div>
  );
}
