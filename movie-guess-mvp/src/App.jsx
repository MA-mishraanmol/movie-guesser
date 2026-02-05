import { useState } from "react";
import movies from "./data/movies.json";

export default function App() {
  const [currentMovie, setCurrentMovie] = useState(
  movies[Math.floor(Math.random() * movies.length)]
);


  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState([]);

  // ✅ NEW: Hint system state
  const [hintIndex, setHintIndex] = useState(0);

  // Handle typing + suggestions
  function handleInputChange(e) {
    const value = e.target.value;
    setGuess(value);

    if (value.length === 0) {
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

  // Click suggestion
  function handleSuggestionClick(movieName) {
    setGuess(movieName);
    setSuggestions([]);
  }

  // Submit answer
  function handleSubmit() {
    if (
      guess.trim().toLowerCase() ===
      currentMovie.answer.trim().toLowerCase()
    ) {
      setResult("✅ Correct!");
    } else {
      setResult("❌ Wrong guess. Try again.");
    }
  }

  // ✅ Reveal next hint
  function handleHint() {
    if (hintIndex < currentMovie.hints.length) {
      setHintIndex(hintIndex + 1);
    }
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
}


  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎬 Guess The Movie</h1>

      {/* Summary */}
      <div style={styles.card}>
        <p style={styles.summary}>{currentMovie.summary}</p>
      </div>

      {/* Input + Autocomplete */}
      <div style={{ position: "relative" }}>
        <input
          style={styles.input}
          value={guess}
          onChange={handleInputChange}
          placeholder="Type your movie guess..."
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

      {/* ✅ Hint Button */}
      <div style={{ marginTop: "15px" }}>
        <button
          style={styles.hintButton}
          onClick={handleHint}
          disabled={hintIndex >= currentMovie.hints.length}
        >
          💡 Hint ({hintIndex}/{currentMovie.hints.length})
        </button>
      </div>

      {/* ✅ Show revealed hints */}
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

      {/* Result */}
      {result && <h2 style={styles.result}>{result}</h2>}

      {/* Reveal Answer */}
      {result === "✅ Correct!" && (
        <p style={styles.answer}>
          Answer: <b>{currentMovie.answer}</b>
        </p>
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
  card: {
    margin: "30px auto",
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
    left: "0",
    right: "0",
    margin: "0 auto",
    width: "320px",
    border: "1px solid gray",
    borderRadius: "8px",
    background: "white",
    textAlign: "left",
    zIndex: 10,
  },
  dropdownItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },

  buttonRow: {
    marginTop: "20px",
  },
  button: {
    padding: "10px 18px",
    margin: "0 10px",
    fontSize: "1rem",
    cursor: "pointer",
  },

  // ✅ Hint button style
  hintButton: {
    padding: "10px 16px",
    fontSize: "1rem",
    cursor: "pointer",
    borderRadius: "8px",
  },

  // ✅ Hints box
  hintsBox: {
    marginTop: "20px",
    maxWidth: "400px",
    marginInline: "auto",
    textAlign: "left",
    padding: "15px",
    border: "1px solid gray",
    borderRadius: "10px",
  },

  result: {
    marginTop: "25px",
  },
  answer: {
    fontSize: "1.1rem",
    marginTop: "10px",
  },
};
