import React, { useState, useEffect, useRef } from "react";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import { useDebounce } from "react-use";
import MovieCard from "../components/MovieCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "applicaton/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const getImageUrl = (path, size = "w500") => {
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
  return path ? `${IMAGE_BASE_URL}${size}${path}` : null;
};

function BrowsePage() {
  // FILTER
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [sortBy, setSortBy] = useState("trending.desc");
  // SEARCH
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // UI
  const [movies, setMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [genresList, setGenresList] = useState([]);

  const filterBoxRef = useRef(null);

  useDebounce(
    () => {
      if (debouncedSearchTerm !== searchTerm && searchTerm !== "") {
        setMovies([]);
        setCurrentPage(1);
      }
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  useEffect(() => {
    const fetchAllGenres = async () => {
      if (!API_KEY) {
        setErrorMessage("API Key is missing for genres.");
        return;
      }

      try {
        const endpoint = `${API_BASE_URL}/genre/movie/list?language=en`;
        const response = await fetch(endpoint, API_OPTIONS);
        if (!response.ok) {
          throw new Error("Failed to fetch genres list.");
        }
        const data = await response.json();
        setGenresList(data.genres || []);
      } catch (error) {
        console.error("Error fetching genres", error);
        setErrorMessage("Could not load genre options");
      }
    };
    fetchAllGenres();
  }, []);

  useEffect(() => {
    setMovies([]);
    setCurrentPage(1);
    fetchMoviesFS(1, false);
  }, [selectedGenres, selectedYear, sortBy, debouncedSearchTerm]);

  async function fetchMoviesFS(pageToFetch = 1, loadMore = false) {
    if (!API_KEY) {
      setErrorMessage("API Key is missing.");
      return;
    }
    if (loadMore) setIsLoadingMore(true);
    else setIsLoading(true);
    if (!loadMore) setErrorMessage("");

    let endpoint = "";
    const queryParams = new URLSearchParams({
      page: pageToFetch.toString(),
      include_adult: false,
      language: "en-US",
    });

    if (debouncedSearchTerm) {
      queryParams.append("query", debouncedSearchTerm);
      endpoint = `${API_BASE_URL}/search/movie?${queryParams.toString()}`;
    } else {
      queryParams.append(
        "sort_by",
        sortBy === "trending.desc" ? "popularity.desc" : sortBy
      );
      if (selectedGenres.length > 0) {
        queryParams.append("with_genres", selectedGenres.join(","));
      }
      if (selectedYear) {
        queryParams.append("primary_release_year", selectedYear);
      }
      if (sortBy.includes("vote_average") || sortBy.includes("popularity")) {
        queryParams.append("vote_count.gte", "1000");
      }
      endpoint = `${API_BASE_URL}/discover/movie?${queryParams.toString()}`;
    }

    try {
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (err) {}
        throw new Error(
          `API ERROR ${response.status}: ${
            errorData?.status_message ||
            response.statusText ||
            "Failed to fetch movies"
          } `
        );
      }

      const data = await response.json();
      const newMovies = data.results || [];

      setMovies((prevMovies) =>
        loadMore ? [...prevMovies, ...newMovies] : newMovies
      );
      setTotalPages(data.total_pages || 0);
      setCurrentPage(data.page || 1);
    } catch (error) {
      console.error("Failed to fetch the filtered results", error);
      setErrorMessage(error.message || "Failed to load movies");
      if (!loadMore) setMovies([]);
    } finally {
      if (loadMore) setIsLoadingMore(false) && setIsLoading(false);
    }
  }

  // utils
  // load More
  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      const nextPage = currentPage + 1;
      fetchMoviesFS(nextPage, true);
    }
  };

  // filter box

  const toggleFilterBox = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleGenreFilter = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleYearChange = (e) => setSelectedYear(e.target.value);
  const handleSortChange = (e) => setSortBy(e.target.value);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (filterBoxRef.current && !filterBoxRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isFilterOpen]);

  return (
    <main className="wrapper px-4 md:px-8 lg:px-12 py-8 min-h-screen">
      <section className="gap-4 mb-8 all-movies">
        <h2 className="text-gradient text-3xl md:text-4xl font-bold">
          Browse All Movies
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-start gap-4 sm:gap-6">
          <div className="relative w-full sm:w-auto" ref={filterBoxRef}>
            <button
              onClick={toggleFilterBox}
              className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer text-white 
              bg-gradient font-semibold px-6 py-3 rounded-lg transition duration-300 ease-in-out 
              transform hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/30 focus:outline-none 
              focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-[#AB8BFF]"
              aria-expanded={isFilterOpen}
            >
              <FontAwesomeIcon icon={faFilter} className="text-xl" />
              <span>Filter</span>
            </button>
            {/* dropdown */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[24rem] sm:min-w-[30rem] md:w-auto md:max-w-md lg:max-w-lg bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 z-20 space-y-4">
                <button
                  onClick={toggleFilterBox}
                  className="absolute top-2 right-2 text-slate-400 hover:text-white p-1"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>

                <div>
                  <label
                    htmlFor="sort-filter"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Sort By
                  </label>
                  <select
                    id="sort-filter"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="trending.desc">Trending</option>
                    <option value="popularity.desc">Most Popular</option>
                    <option value="popularity.asc">Leaset Popular</option>
                    <option value="vote_average.desc">Highest Rated</option>
                    <option value="release_date.desc">Newest Releases</option>
                  </select>
                </div>

                {/* year */}
                <div>
                  <label
                    htmlFor="year-input"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Release Year
                  </label>
                  <input
                    type="number"
                    id="year-input"
                    placeholder="e.g 2014"
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* genre */}
                {genresList.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border border-slate-600 rounded">
                      {genresList.map((genre) => (
                        <button
                          key={genre.id}
                          onClick={() => handleGenreFilter(genre.id)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                            selectedGenres.includes(genre.id)
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-slate-600 text-slate-200 hover:bg-slate-500"
                          }`}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    fetchMoviesFS(1, false); //pagefetch
                    setIsFilterOpen(false);
                  }}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto sm:flex-grow">
            <Search
              search={searchTerm}
              setSearchTerm={setSearchTerm}
              className="mx-0"
              onSearchClick={() => fetchMoviesFS(1, false)}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default BrowsePage;
