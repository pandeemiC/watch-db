import React, { useState, useEffect, useRef } from "react";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "./appwrite";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const allMoviesSectionRef = useRef(null);

  // Debounced the search term to prevent API making too many requests.
  // by waiting for user to stop typing for 500 milliseconds.
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    if (!API_KEY) {
      setIsLoading(false);
      setErrorMessage("API KEY IS MISSING PLEASE INSERT THE KEY");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    setMovieList([]);
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { status_message: response.statusText };
        }
        throw new Error(
          `API ERROR: ${response.status} - ${
            errorData?.status_message || "Failed to fetch movies."
          }`
        );
      }

      const data = await response.json();

      setMovieList(data.results || []);

      if (query && data.results && data.results.length > 0) {
        if (typeof updateSearchCount === "function") {
          await updateSearchCount(query, data.results[0]);
        } else {
          console.warn("updateSearchCount function is not available");
        }
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  const handleScrollMovies = () => {
    if (allMoviesSectionRef.current) {
      allMoviesSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <main>
      <div className="pattern">
        <nav className="flex justify-between items-center w-screen p-5">
          <ul className="flex items-center space-x-6 ml-5">
            <li className="text-white bg-indigo-900 p-3 rounded-md cursor-pointer">
              Browse
            </li>
            <li className="text-white cursor-pointer">About Us</li>
            <li className="text-white cursor-pointer">Contact</li>
          </ul>
          <div className="flex justify-end gap-4 mr-5">
            <button className="text-white bg-indigo-900 p-3 rounded-md cursor-pointer">
              Sign Up
            </button>
            <button className="text-white cursor-pointer">Log In</button>
          </div>
        </nav>
        <div className="wrapper">
          <div className="flex justify-center items-center">
            <img src="./logo.svg" width={87} height={87} alt="logo" />
          </div>
          <header>
            <img src="./hero-img.png" alt="hero-banner" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              Without the Hassle
            </h1>
            <Search
              search={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearchClick={handleScrollMovies}
            />
          </header>
          {trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="all-movies" ref={allMoviesSectionRef}>
            <h2>All Movies</h2>
            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
