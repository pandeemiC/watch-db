import React, { useState, useEffect } from "react";

const Search = ({ setSearchTerm, searchTerm, onSearchClick }) => {
  const [placeholderText, setPlaceholderText] = useState(
    "Search through 1000+ movies online..."
  );

  useEffect(() => {
    const updatedPlaceholder = () => {
      if (window.innerWidth >= 640) {
        setPlaceholderText("Search through 1000+ movies online...");
      } else {
        setPlaceholderText("Search movies..");
      }
    };
    updatedPlaceholder;
    window.addEventListener("resize", updatedPlaceholder);

    return () => {
      window.removeEventListener("resize", updatedPlaceholder);
    };
  }, []);

  return (
    <div className="search">
      <div>
        <img src="./search.svg" alt="SearchSVG" />
        <input
          type="text"
          placeholder={placeholderText}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearchClick) {
              e.preventDefault();

              onSearchClick();
            }
          }}
        />
        <button
          className="w-[100px] bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-black h-[45px] cursor-pointer rounded ml-2 px-4 py-1"
          onClick={onSearchClick}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default Search;
