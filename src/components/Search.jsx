import React from "react";

const Search = ({ setSearchTerm, searchTerm }) => {
  return (
    <div className="search">
      <div>
        <img src="./search.svg" alt="SearchSVG" />
        <input
          type="text"
          placeholder="Search through 1000+ movies online..."
          value={searchTerm}
          onClick={(e) => setSearchTerm(e.target.value)}
        />
        <button className="w-[100px] bg-linear-to-r from-[#D6C7FF] to-[#AB8BFF] bg-clip-text text-transparent h-[45px] cursor-pointer">
          Search
        </button>
      </div>
    </div>
  );
};

export default Search;
