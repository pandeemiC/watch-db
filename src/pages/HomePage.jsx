import React, { useState, useEffect, useRef } from "react";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "../appwrite";
import { useParams, Link as RouterLink } from "react-router-dom";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";
import { faqData } from "../constants/faq.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faGithub,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [highestRatedMovies, setHighestRatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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

  const fetchHighestRatedMovies = async () => {
    if (!API_KEY) {
      if (!errorMessage)
        setErrorMessage("API KEY IS MISSING PLEASE INSERT THE KEY");
      return;
    }
    if (!isLoading) setIsLoading(true);
    setHighestRatedMovies([]);

    try {
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&include_adult=false&language=en-US&page=1`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        let errorData;
        try {
          errorData = response.json();
        } catch (err) {}
        throw new Error(
          `API ERROR ${response.status} - ${
            errorData?.status_message || "Failed to fetch highest rated movies"
          }`
        );
      }

      const data = await response.json();
      setHighestRatedMovies(data.results || []);
    } catch (err) {
      console.error(`There was an error loading the fetch: ${err}`);
      setErrorMessage(err.message || "Error fetching highest rated movies.");
      setHighestRatedMovies([]);
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
    fetchMovies();
    fetchHighestRatedMovies();
  }, []);

  const handleScrollMovies = () => {
    if (allMoviesSectionRef.current) {
      allMoviesSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleFaqToggle = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="wrapper">
      <div className="flex justify-center items-center">
        <img src="./logo.svg" width={150} height={150} alt="logo" />
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
      <section className="all-movies mb-10" ref={allMoviesSectionRef}>
        {debouncedSearchTerm ? (
          <h2>{`Results for "${debouncedSearchTerm}"`}</h2>
        ) : (
          <h2 className="3xl font-semibold mb-10 text-white">
            <span className="text-gradient">Popular </span>Movies
          </h2>
        )}

        {isLoading && movieList.length === 0 ? (
          <Spinner />
        ) : errorMessage && movieList.length === 0 ? (
          <p className="text-red-500 text-center py-6">{errorMessage}</p>
        ) : movieList.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movieList.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ul>
        ) : (
          <p className="text-white text-center py-6">
            {debouncedSearchTerm
              ? "No movies found matching your search."
              : "No popular movies found."}
          </p>
        )}
        <div className="flex justify-end mr-5">
          <RouterLink
            to="/browse"
            className="inline-block my-6 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            → View More
          </RouterLink>
        </div>
      </section>
      <section className="all-movies">
        <h2 className="mb-10 font-semibold text-3xl text-white">
          <span className="text-gradient">GOAT</span>(s)
        </h2>
        {isLoading && highestRatedMovies === 0 ? (
          <Spinner />
        ) : errorMessage && highestRatedMovies.length === 0 ? (
          <p className="text-red-500 text-center py-6">{errorMessage}</p>
        ) : highestRatedMovies.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {highestRatedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ul>
        ) : !isLoading ? (
          <p className="text-red-500 text-center py-6">
            Could not load highest rated movies.
          </p>
        ) : null}
        <div className="flex justify-end mr-5">
          <RouterLink
            to="/browse"
            className="inline-block my-6 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            → View More
          </RouterLink>
        </div>
      </section>
      {/* BROWSE SECTION */}
      <section
        className="browse-more text-center
                   relative overflow-hidden 
                   bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 
                   py-20 px-6
                   rounded-2xl 
                   border border-slate-700/50 
                   shadow-xl shadow-indigo-900/20 
                   my-10"
      >
        <div className="bg-gradient-light"></div>
        <h2 className="relative z-[1] text-4xl font-bold text-white mb-4">
          Explore <span className="text-gradient">THOUSANDS</span> More
        </h2>
        <p className="relative z-[1] text-lg max-w-xl mx-auto text-slate-300 mb-10">
          Dive deeper into the world of cinema. Browse extensive collections by
          genre, year and popularity.
        </p>
        <RouterLink
          to="/browse"
          className="relative z-[1] inline-flex items-center justify-center gap-2
          bg-gradient text-primary 
          font-semibold px-10 py-3
          rounded-lg 
          transition duration-300 ease-in-out
          transform hover:scale-[1.03] 
          hover:shadow-lg hover:shadow-purple-500/30 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-[#AB8BFF]"
        >
          Browse All Movies
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
            />
          </svg>
        </RouterLink>
      </section>

      <section className="faq my-10">
        <h2 className="text-4xl font-semibold text-center text-white mb-15">
          Literally Nobody Asked{" "}
          <span className="text-gradient">Questions</span>
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((item, index) => (
            // QUESTION SECTION
            <div
              key={index}
              className="border border-slate-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => handleFaqToggle(index)}
                className="flex justify-between items-center w-full p-4 md:p-5 text-left bg-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition"
                aria-expanded={openFaqIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-medium text-white">{item.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-5 h-5 text-indigo-400 transform transition-transform duration-300 ${
                    openFaqIndex === index ? "rotate-0" : "rotate-180"
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {/* ANSWER SECTION */}
              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openFaqIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-4 md:p-5 bg-slate-700 text-gray-300 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* FOOTER SECITON */}
      <footer className="mt-16 pt-8 border-t border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center sm:text-left">
            © {new Date().getFullYear()} WatchDB. All Rights Reserved. Powered
            by React & TMDb.
          </p>

          {/* ICONS */}
          <div className="flex items-center space-x-4">
            <a
              href="*"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
            >
              <FontAwesomeIcon
                icon={faDiscord}
                className="text-gray-400 hover:text-indigo-400 transition-colors text-xl"
              />
            </a>

            <a
              href="[YOUR_GITHUB_LINK_HERE]"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FontAwesomeIcon
                icon={faGithub}
                className="text-gray-400 hover:text-white transition-colors text-xl"
              />
            </a>

            <a
              href="[YOUR_LINKEDIN_LINK_HERE]"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon
                icon={faLinkedin}
                className="text-gray-400 hover:text-blue-500 transition-colors text-xl"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
