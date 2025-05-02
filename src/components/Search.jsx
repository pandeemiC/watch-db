import React from "react";

const Search = ({ setSearchTerm, searchTerm, onSearchClick }) => {
  return (
    <div className="search">
      <div>
        <img src="./search.svg" alt="SearchSVG" />
        <input
          type="text"
          placeholder="Search through 1000+ movies online..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearchClick) {
              e.prevent.Default();

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
