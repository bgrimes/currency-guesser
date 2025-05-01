import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Badge } from "./catalystui/badge.tsx";
import { Button } from "./catalystui/button.tsx";
import { Input } from "./catalystui/input.tsx";
import { countryCurrencies } from "./data/countryCurrencies.ts";

function App() {
  const [currentCountry, setCurrentCountry] = useState("");
  const [userGuess, setUserGuess] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [countryQueue, setCountryQueue] = useState<string[]>([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize dark mode
  useEffect(() => {
    const isDark = localStorage.theme === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleDarkMode() {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }

  // Get the next country from the queue
  const getNextCountry = () => {
    if (countryQueue.length === 0) {
      setGameFinished(true);
      return;
    }

    // Get the first country from the queue
    const country = countryQueue[0];
    const currency = countryCurrencies.find(item => item.country === country)?.currency || "";

    // Remove the country from the queue
    setCountryQueue(prevQueue => prevQueue.slice(1));

    setCurrentCountry(country);
    setCorrectAnswer(currency);
    setUserGuess("");
    setFeedback("");
    setShowAnswer(false);
  };

  // Check the user's guess
  const checkGuess = () => {
    if (!userGuess.trim()) {
      setFeedback("Please enter a guess");
      return;
    }

    const countryData = countryCurrencies.find(
      item => item.country === currentCountry
    );
    const correctCurrency = countryData?.currency;
    const alternativeSpellings = countryData?.alternativeSpellings || [];

    // Check for exact match, if the user's guess is contained within the correct answer,
    // or if it matches any alternative spellings
    const matchesAlternativeSpelling = alternativeSpellings.some(
      spelling => spelling.toLowerCase() === userGuess.toLowerCase()
    );

    if (userGuess.toLowerCase() === correctCurrency?.toLowerCase() || 
        correctCurrency?.toLowerCase().includes(userGuess.toLowerCase()) && userGuess.length > 3 ||
        matchesAlternativeSpelling) {
      setScore(score + 1);
      setStreak(streak + 1);
      setFeedback(streak >= 2 ? `Correct! 🔥 ${streak + 1} in a row!` : "Correct! 🎉");
    } else {
      setFeedback("Incorrect. The correct answer is:");
      setStreak(0);
    }
    setShowAnswer(true);

    // Automatically move to the next round after a delay
    setTimeout(() => {
      nextRound();
    }, 2000);
  };

  // Start a new game
  const nextRound = () => {
    getNextCountry();
  };

  // Skip the current country
  const skipCountry = () => {
    setShowAnswer(true);
    setFeedback("Skipped. The correct answer is:");

    // Automatically move to the next round after a delay
    setTimeout(() => {
      nextRound();
    }, 2000);
  };

  // Finish the game early
  const finishGame = () => {
    setGameFinished(true);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press 'Alt+N' to go to next round after answering
      if (e.key === 'n' && e.ctrlKey && showAnswer) {
        nextRound();
      }
      // Press 'Alt+S' to skip the current country
      if (e.key === 's' && e.ctrlKey && !showAnswer) {
        skipCountry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAnswer]);

  // Initialize the game
  useEffect(() => {
    // Create a shuffled queue of all countries
    const allCountries = countryCurrencies.map(item => item.country);
    const shuffled = [...allCountries].sort(() => Math.random() - 0.5);
    setCountryQueue(shuffled.slice(1)); // All except the first one

    // Set the first country
    const firstCountry = shuffled[0];
    const firstCurrency = countryCurrencies.find(item => item.country === firstCountry)?.currency || "";
    setCurrentCountry(firstCountry);
    setCorrectAnswer(firstCurrency);
  }, []);

  // Focus the input field when feedback is cleared (new round starts)
  useEffect(() => {
    if (!feedback && inputRef.current && !gameFinished) {
      inputRef.current.focus();
    }
  }, [feedback, gameFinished]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Vaporwave background elements test */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM2LjYyNyAwIDEyLTUuMzczIDEyLTEyUzQyLjYyNyAxMCAzNiAxMGMtNi42MjggMC0xMiA1LjM3My0xMiAxMnM1LjM3MiAxMiAxMiAxMnptMC0zYzQuOTcxIDAgOS00LjAyOSA5LTlzLTQuMDI5LTktOS05LTkgNC4wMjktOSA5IDQuMDI5IDkgOSA5eiIgZmlsbC1vcGFjaXR5PSIuMDUiIGZpbGw9IiMwMDAiLz48L2c+PC9zdmc+')] opacity-15 dark:opacity-5" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
            Currency Guessing Game
          </h1>
          <div onClick={toggleDarkMode} className="cursor-pointer">
            <Badge color="indigo">{isDarkMode ? "Light Mode" : "Dark Mode"}</Badge>
          </div>
        </div>

        {gameFinished ? (
          <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-zinc-950 dark:text-white">Game Finished!</h2>
            <p className="text-lg mb-6 text-zinc-950 dark:text-white">Your final score: <span className="font-bold">{score} out of {countryCurrencies.length}</span></p>
            <p className="mb-6 text-zinc-950 dark:text-white">You've guessed currencies for all countries!</p>
            <Button color="indigo" onClick={() => {
              setGameFinished(false);
              setScore(0);
              setStreak(0);
              // Restart the game
              const allCountries = countryCurrencies.map(item => item.country);
              const shuffled = [...allCountries].sort(() => Math.random() - 0.5);
              setCountryQueue(shuffled.slice(1));
              const firstCountry = shuffled[0];
              const firstCurrency = countryCurrencies.find(item => item.country === firstCountry)?.currency || "";
              setCurrentCountry(firstCountry);
              setCorrectAnswer(firstCurrency);
              setUserGuess("");
              setFeedback("");
              setShowAnswer(false);
            }}>
              Play Again
            </Button>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">Score: {score} out of {countryCurrencies.length}</h2>
                <div className="flex items-center gap-2">
                  {streak >= 3 && (
                    <div className="bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-200 px-3 py-1 rounded-full flex items-center">
                      <span className="mr-1">🔥</span> {streak} streak
                    </div>
                  )}
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Countries left: {countryQueue.length + (currentCountry ? 1 : 0)}
                  </div>
                </div>
              </div>
              <p className="text-lg mb-4 text-zinc-950 dark:text-white">What currency does <span className="font-bold">{currentCountry}</span> use?</p>

              <form onSubmit={(e) => { e.preventDefault(); checkGuess(); }} className="flex gap-2 mb-4">
                <Input 
                  ref={inputRef}
                  type="text" 
                  value={userGuess} 
                  onChange={(e) => setUserGuess(e.target.value)}
                  className="flex-grow"
                  placeholder="Enter currency name"
                  autoComplete="off"
                  disabled={!!feedback}
                />
                <Button type="submit" color="indigo" disabled={!!feedback}>Submit</Button>
              </form>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex gap-2">
                <Button color="indigo" onClick={nextRound}>Next Country</Button>
                <Button color="red" onClick={skipCountry}>Skip</Button>
                <Button color="zinc" onClick={finishGame}>Finish Game</Button>
              </div>
              {feedback && (
                <div className={`w-64 p-3 rounded-md ${feedback.includes("Correct") ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200"}`}>
                  <div className="text-sm">
                    {feedback}
                    {showAnswer && (feedback.includes("Incorrect") || feedback.includes("Skipped")) && (
                      <div className="mt-1">The correct answer is:<br /><strong>{correctAnswer}</strong></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          <p>Try to guess the currency used by each country. You'll earn a point for each correct answer!</p>
          <p className="mt-2">
            <strong>Keyboard shortcuts:</strong> Press <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-950 dark:text-white">Enter</kbd> to submit your guess, 
            <span> </span><kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-950 dark:text-white">Alt+S</kbd> to skip the current country.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
