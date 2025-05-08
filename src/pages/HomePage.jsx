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
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

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
  const [currentHeroIndex, setCurrentHeroIndex] = useState(null);
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [highestRatedMovies, setHighestRatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const allMoviesSectionRef = useRef(null);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    if (!API_KEY) {
      setErrorMessage("API KEY IS MISSING.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    if (query) {
      setMovieList([]);
      setCurrentHeroIndex(null);
    }

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
            query
          )}&page=1`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=1`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        let errorData;

        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = {
            status_message: response.statusText || "Unknown API error",
          };
        }

        throw new Error(
          `API Error ${response.status}: ${
            errorData?.status_message || "Failed to fetch movies."
          }`
        );
      }

      const data = await response.json();
      const results = data.results || [];

      setMovieList(results);

      if (!query && results.length > 0 && currentHeroIndex === null) {
        const moviesWithBackdrops = results.filter(
          (movie) => movie.backdrop_path
        );
        if (moviesWithBackdrops.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * moviesWithBackdrops.length
          );
          const randomMovie = moviesWithBackdrops[randomIndex];
          const originalIndex = results.findIndex(
            (movie) => movie.id === randomMovie.id
          ); //fallback

          setCurrentHeroIndex(originalIndex >= 0 ? originalIndex : 0);
        } else {
          setCurrentHeroIndex(0);
        }
      }
      // Appwrite search count update
      if (query && results.length > 0) {
        if (typeof updateSearchCount === "function") {
          await updateSearchCount(query, results[0]);
        }
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(
        error.message || "Error fetching movies. Please try again."
      );
      setMovieList([]);
      setCurrentHeroIndex(null);
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

  // general fetch
  useEffect(() => {
    loadTrendingMovies();
    fetchMovies();
    fetchHighestRatedMovies();
  }, []);
  // heroIndex
  useEffect(() => {
    if (movieList.length > 0 && currentHeroIndex !== null) {
      const intervalId = setInterval(() => {
        handleNextHero();
      }, 8000); // 8 secs
      // cleaning up of the interval
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [movieList, currentHeroIndex]);

  const handleScrollMovies = () => {
    if (allMoviesSectionRef.current) {
      allMoviesSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handlePrevHero = () => {
    setCurrentHeroIndex((prevIndex) => {
      if (prevIndex === null || movieList.length === 0) return prevIndex;
      return (prevIndex - 1 + movieList.length) % movieList.length;
    });
  };

  const handleNextHero = () => {
    setCurrentHeroIndex((prevIndex) => {
      if (prevIndex === null || movieList.length === 0) return prevIndex;
      return (prevIndex + 1) % movieList.length;
    });
  };

  const getImageUrl = (path, size = "w500") => {
    return path ? `${IMAGE_BASE_URL}${size}${path}` : null;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = "none";
  };

  const handleFaqToggle = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <>
      {currentHeroIndex !== null &&
        movieList.length > 0 &&
        (() => {
          const heroMovie = movieList[currentHeroIndex]; // first time ever trying IIFE
          if (!heroMovie) return null; // so the currentHero doesn't derive on its private scope

          return (
            <section className="hero relative w-full h-[70vh] md:h-[85vh] lg:h-[90vh] overflow-hidden mb-16 text-white transition-all duration-300 ease-in-out">
              {heroMovie.backdrop_path ? (
                <img
                  key={heroMovie.id}
                  src={getImageUrl(heroMovie.backdrop_path, "original")}
                  alt={`${heroMovie.title} backdrop`}
                  className="absolute inset-0 w-full h-full object-cover -z-10 transition-opacity opacity-100 duration-1000 ease-in-out"
                  onError={handleImageError}
                />
              ) : (
                // fallback
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 to-indigo-900 -z-10"></div>
              )}

              {/* Darkening Gradient */}
              <div
                className="absolute inset-x-0 bottom-0 z-0 h-2/3 bg-gradient-to-t from-primary via-primary/80 to-transparent"
                aria-hidden="true"
              ></div>
              <div
                className="absolute inset-y-0 left-0 z-0 w-2/3 md:w-1/2 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent"
                aria-hidden="true"
              ></div>

              {/* HERO CONTENT */}
              <div className="relative z-10 h-full grid grid-cols-2 items-end p-6 sm:p-10 md:p-16 max-w-7xl mx-auto max-sm:ml-5">
                <div className="col-span-2 md:col-span-1 max-w-xl lg:max-w-2xl transition-opacity duration-500 ease-in-out">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 leading-tight lg:leading-snug shadow-black/60 [text-shadow:_0_2px_6px_var(--tw-shadow-color)] text-start">
                    {heroMovie.title}
                  </h1>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mb-5 text-slate-200 text-sm md:text-base font-medium">
                    {heroMovie.release_date && (
                      <span>{heroMovie.release_date.substring(0, 4)}</span>
                    )}
                    {heroMovie.vote_average > 0 && (
                      <span className="flex items-center gap-1.5 backdrop-blur-sm bg-black/20 px-2 py-0.5 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-yellow-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {heroMovie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="hidden md:block text-slate-300 text-base leading-relaxed line-clamp-3 mb-8">
                    {heroMovie.overview}
                  </p>
                  <RouterLink
                    to={`/movie/${heroMovie.id}`}
                    className="inline-flex items-center justify-center gap-2 bg-gradient text-primary font-semibold px-8 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-[#AB8BFF]"
                  >
                    View Details
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
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </RouterLink>
                </div>

                {/* NAV BUTTONS */}
                {movieList.length > 1 && (
                  <div className="hidden md:flex col-span-1 justify-end items-center pb-6">
                    <div className="flex flex-row gap-10 backdrop-blur-sm bg-black/20 p-2 rounded-full">
                      <button
                        onClick={handlePrevHero}
                        className="text-white/80 cursor-pointer hover:text-white disabled:text-white/30 transition-colors duration-200 focus:outline-none"
                        aria-label="Previous hero movie"
                        disabled={movieList.length <= 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5 8.25 12l7.5-7.5"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={handleNextHero}
                        className="text-white/80 cursor-pointer hover:text-white disabled:text-white/30 transition-colors duration-200 focus:outline-none"
                        aria-label="Next hero movie"
                        disabled={movieList.length <= 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })()}
      {/* REST OF LAYOUT W SEARCH */}
      <div className="wrapper px-4 md:px-8 lg:px-12 pt-10">
        <div className="text-center mb-12 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h2>
          <Search
            search={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearchClick={handleScrollMovies}
          />
        </div>
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
              → Browse More
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
              → Browse More
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
            Dive deeper into the world of cinema. Browse extensive collections
            by genre, year and popularity.
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
                  <span className="font-medium text-white">
                    {item.question}
                  </span>
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
              <a target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <FontAwesomeIcon
                  icon={faDiscord}
                  className="text-gray-400 hover:text-indigo-400 transition-colors text-xl"
                />
              </a>

              <a
                href="https://github.com/pandeemiC"
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
                href="https://www.linkedin.com/in/jeff-bezos-879307323"
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
    </>
  );
}

export default HomePage;
