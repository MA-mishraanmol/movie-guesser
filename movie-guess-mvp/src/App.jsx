import { useState } from "react";
import movies from "./data/movies.json";

export default function App() {
  // Random first movie
  const [currentMovie, setCurrentMovie] = useState(
    movies[Math.floor(Math.random() * movies.length)]
  );

  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");

  // Autocomplete
  const [suggestions, setSuggestions] = useState([]);

  // Hint system
  const [hintIndex, setHintIndex] = useState(0);

  // ✅ Reveal state
  const [revealed, setRevealed] = useState(false);

  // ✅ Score + streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Typing handler
  function handleInputChange(e) {
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

  // ✅ Submit answer
  function handleSubmit() {
    if (
      guess.trim().toLowerCase() ===
      currentMovie.answer.trim().toLowerCase()
    ) {
      setResult("✅ Correct!");

      // Add points + streak
      setScore(score + 10);
      setStreak(streak + 1);
    } else {
      setResult("❌ Wrong guess!");

      // Reset streak
      setStreak(0);
    }
  }

  // Hint button
  function handleHint() {
    if (hintIndex < 3) {
      setHintIndex(hintIndex + 1);
    }
  }

  // ✅ Reveal Answer Button
  function handleReveal() {
    setRevealed(true);
    setResult("😅 Answer Revealed!");

    // Reveal breaks streak
    setStreak(0);
  }

  // Next movie
  function handleNext() {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * movies.length);
    } while (movies[randomIndex].id === currentMovie.id);

    setCurrentMovie(movies[randomIndex]);

    setGuess("");
    setResult("");
    setSuggestions([]);

    setHintIndex(0);
    setRevealed(false);
  }

  // ✅ Share Result Text
  function handleShare() {
    const shareText = `🎬 Guess The Movie!
Result: ${result || "In progress"}
Hints used: ${hintIndex}/3
🔥 Streak: ${streak}
⭐ Score: ${score}`;

    navigator.clipboard.writeText(shareText);
    alert("Copied share result to clipboard!");
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎬 Guess The Movie</h1>

      {/* Scoreboard */}
      <div style={styles.scoreBox}>
        ⭐ Score: {score} | 🔥 Streak: {streak}
      </div>

      {/* Summary */}
      <div style={styles.card}>
        <p style={styles.summary}>{currentMovie.summary}</p>
      </div>

      {/* Input */}
      <div style={{ position: "relative" }}>
        <input
          style={styles.input}
          value={guess}
          onChange={handleInputChange}
          placeholder="Type your guess..."
        />

        {suggestions.length > 0 && (
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

      {/* Buttons */}
      <div style={styles.buttonRow}>
        <button style={styles.button} onClick={handleSubmit}>
          Submit
        </button>

        <button style={styles.button} onClick={handleNext}>
          Next →
        </button>
      </div>

      {/* Hint Button */}
      <button
        style={styles.hintButton}
        onClick={handleHint}
        disabled={hintIndex >= 3}
      >
        💡 Hint ({hintIndex}/3)
      </button>

      {/* Show Hints */}
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

      {/* ✅ Reveal Button after 3 hints */}
      {hintIndex === 3 && result !== "✅ Correct!" && !revealed && (
        <button style={styles.revealButton} onClick={handleReveal}>
          👀 Reveal Movie Name
        </button>
      )}

      {/* Result */}
      {result && <h2 style={styles.result}>{result}</h2>}

      {/* Show Answer if Revealed or Correct */}
      {(revealed || result === "✅ Correct!") && (
        <p style={styles.answer}>
          Answer: <b>{currentMovie.answer}</b>
        </p>
      )}

      {/* ✅ Share Button */}
      {result && (
        <button style={styles.shareButton} onClick={handleShare}>
          📲 Share Result
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
  scoreBox: {
    fontSize: "1.2rem",
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
    margin: "0 auto",
    left: 0,
    right: 0,
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
  hintButton: {
    marginTop: "15px",
    padding: "10px 16px",
    cursor: "pointer",
  },
  revealButton: {
    marginTop: "15px",
    padding: "10px 16px",
    background: "black",
    color: "white",
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
  shareButton: {
    marginTop: "20px",
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};
