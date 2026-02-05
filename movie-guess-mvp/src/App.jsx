import { useState } from "react";
import movies from "./data/movies.json";

export default function App() {
  // Random first movie
  const [currentMovie, setCurrentMovie] = useState(
    movies[Math.floor(Math.random() * movies.length)]
  );

  // User guess
  const [guess, setGuess] = useState("");

  // Autocomplete
  const [suggestions, setSuggestions] = useState([]);

  // Hint system
  const [hintIndex, setHintIndex] = useState(0);

  // Round states
  const [roundOver, setRoundOver] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Winning streak only
  const [winningStreak, setWinningStreak] = useState(0);

  // Result message
  const [result, setResult] = useState("");

  // Handle typing
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

  // Suggestion click
  function handleSuggestionClick(movieName) {
    setGuess(movieName);
    setSuggestions([]);
  }

  // Submit answer
  function handleSubmit() {
    if (roundOver) return;

    const correct =
      guess.trim().toLowerCase() ===
      currentMovie.answer.trim().toLowerCase();

    if (correct) {
      setResult("✅ Correct!");
      setWinningStreak(winningStreak + 1);

      // Round ends
      setRoundOver(true);
      setSuggestions([]);
    } else {
      setResult("❌ Wrong! Answer revealed.");

      // Wrong answer ends round + reveals answer
      setRevealed(true);
      setRoundOver(true);

      // Reset streak
      setWinningStreak(0);

      setSuggestions([]);
    }
  }

  // Hint button
  function handleHint() {
    if (roundOver) return;
    if (hintIndex < 3) setHintIndex(hintIndex + 1);
  }

  // Reveal answer manually
  function handleReveal() {
    if (roundOver) return;

    setResult("👀 Answer Revealed!");
    setRevealed(true);
    setRoundOver(true);

    // Reveal breaks streak
    setWinningStreak(0);

    setSuggestions([]);
  }

  // Next movie (only allowed if round over)
  function handleNext() {
    if (!roundOver) return;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * movies.length);
    } while (movies[randomIndex].id === currentMovie.id);

    setCurrentMovie(movies[randomIndex]);

    // Reset round
    setGuess("");
    setSuggestions([]);
    setHintIndex(0);
    setRoundOver(false);
    setRevealed(false);
    setResult("");
  }

  // Share result
  function handleShare() {
    const shareText = `🎬 Guess The Movie!\n🔥 Winning Streak: ${winningStreak}\n${result}`;

    navigator.clipboard.writeText(shareText);
    alert("Copied streak card to clipboard!");
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎬 Guess The Movie</h1>

      {/* Winning Streak Display */}
      <div style={styles.streakBox}>
        🔥 Winning Streak: {winningStreak}
      </div>

      {/* Summary */}
      <div style={styles.card}>
        <p style={styles.summary}>{currentMovie.summary}</p>
      </div>

      {/* Input Disabled if Round Over */}
      <div style={{ position: "relative" }}>
        <input
          style={{
            ...styles.input,
            backgroundColor: roundOver ? "#eee" : "white",
          }}
          value={guess}
          onChange={handleInputChange}
          placeholder="Type your guess..."
          disabled={roundOver}
        />

        {/* Autocomplete Dropdown */}
        {!roundOver && suggestions.length > 0 && (
          <div style={styles.dropdown}>
            {suggestions.map((movie) => (
              <div
                key={movie.id}
                style={styles.dropdownItem}
                onClick={() => handleSuggestionClick(movie.answer)}
              >
                {movie.answer}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button Disabled if Round Over */}
      <div style={styles.buttonRow}>
        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={roundOver}
        >
          Submit
        </button>

        <button
          style={styles.button}
          onClick={handleHint}
          disabled={roundOver || hintIndex >= 3}
        >
          💡 Hint ({hintIndex}/3)
        </button>
      </div>

      {/* Show hints */}
      {hintIndex > 0 && (
        <div style={styles.hintsBox}>
          <h3>Hints:</h3>
          <ul>
            {currentMovie.hints.slice(0, hintIndex).map((hint, i) => (
              <li key={i}>{hint}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Reveal option only after 3 hints */}
      {hintIndex === 3 && !roundOver && (
        <button style={styles.revealButton} onClick={handleReveal}>
          👀 Reveal Answer
        </button>
      )}

      {/* Result */}
      {result && <h2 style={styles.result}>{result}</h2>}

      {/* Answer shown if revealed or wrong */}
      {revealed && (
        <p style={styles.answer}>
          Answer: <b>{currentMovie.answer}</b>
        </p>
      )}

      {/* Share Button available anytime round ends */}
      {roundOver && (
        <button style={styles.shareButton} onClick={handleShare}>
          📲 Share Winning Streak
        </button>
      )}

      {/* Next Button only after round ends */}
      {roundOver && (
        <button style={styles.nextButton} onClick={handleNext}>
          Next Movie →
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "sans-serif",
    textAlign: "center",
  },
  title: {
    fontSize: "2.2rem",
  },
  streakBox: {
    fontSize: "1.3rem",
    marginBottom: "15px",
  },
  card: {
    margin: "20px auto",
    padding: "20px",
    maxWidth: "600px",
    border: "2px solid black",
    borderRadius: "12px",
  },
  summary: {
    fontSize: "1.3rem",
  },
  input: {
    padding: "12px",
    width: "320px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid gray",
  },
  dropdown: {
    position: "absolute",
    top: "50px",
    width: "320px",
    left: 0,
    right: 0,
    margin: "0 auto",
    border: "1px solid gray",
    background: "white",
    zIndex: 10,
  },
  dropdownItem: {
    padding: "10px",
    cursor: "pointer",
  },
  buttonRow: {
    marginTop: "15px",
  },
  button: {
    padding: "10px 18px",
    margin: "0 10px",
    cursor: "pointer",
  },
  hintsBox: {
    marginTop: "15px",
    maxWidth: "400px",
    marginInline: "auto",
    textAlign: "left",
    border: "1px solid gray",
    padding: "10px",
    borderRadius: "10px",
  },
  revealButton: {
    marginTop: "15px",
    padding: "10px 16px",
    background: "black",
    color: "white",
    cursor: "pointer",
  },
  shareButton: {
    marginTop: "20px",
    padding: "10px 18px",
    cursor: "pointer",
  },
  nextButton: {
    marginTop: "15px",
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};
