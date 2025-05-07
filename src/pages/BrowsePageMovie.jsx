import React, { useState, useEffect } from "react";
import Search from "../components/Search";
import { useDebounce } from "react-use";
import MovieCard from "../components/MovieCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  // useEffect(() => {
  //   fetchMovies(debouncedSearchTerm);
  // }, [debouncedSearchTerm]);

  // const handleScrollMovies = () => {
  //   if (allMoviesSectionRef.current) {
  //     allMoviesSectionRef.current.scrollIntoView({
  //       behavior: "smooth",
  //       block: "start",
  //     });
  //   }
  // };

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
