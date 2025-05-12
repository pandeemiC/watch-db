import React, { useState, useEffect, useRef } from "react";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import { useDebounce } from "react-use";
import MovieCard from "../components/MovieCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

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
      setIsLoading(true);
      setErrorMessage("");
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

  return (
    <main className="wrapper px-4 md:px-8 lg:px-12 py-8 min-h-screen">
      <section className="gap-4 mb-8 all-movies">
        <h2 className="text-gradient text-3xl md:text-4xl font-bold">
          Browse All Movies
        </h2>
        <div className="flex flex-row items-center justify-start gap-4 sm:gap-6">
          <button className="cursor-pointer inline-flex text-white justify-center items-center bg-gradient font-semibold px-6 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-[#AB8BFF]">
            <FontAwesomeIcon
              icon={faFilter}
              className="transition-colors text-xl"
            />
            Filter
          </button>
          <Search
            search={searchTerm}
            setSearchTerm={setSearchTerm}
            className="mx-0"
            // onSearchClick={handleScrollMovies}
          />
        </div>
      </section>
    </main>
  );
}

export default BrowsePage;
