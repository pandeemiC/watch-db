import React from "react";
import { Link } from "react-router-dom"; // Import Link

// Base URL for TMDb images
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // w500 is a common size

const MovieCard = ({ movie }) => {
  // Handle cases where movie or poster_path might be missing
  const imageUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : "/placeholder-poster.png"; // Provide a fallback image path in your public folder

  return (
    // Wrap the entire list item content (or the card div) in a Link
    // The 'to' prop constructs the URL for the detail page
    <Link to={`/movie/${movie.id}`} className="block group">
      {" "}
      {/* Use block and group for styling */}
      <li className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl">
        <img
          src={imageUrl}
          alt={`${movie.title} Poster`}
          className="w-full h-auto object-cover" // Adjust height/object-fit as needed
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-poster.png";
          }} // Handle image load errors
        />
        <div className="p-3">
          <h3
            className="text-white font-semibold text-sm truncate"
            title={movie.title}
          >
            {movie.title}
          </h3>
          {/* Optional: Add release year or rating */}
          <p className="text-gray-400 text-xs">
            {movie.release_date ? movie.release_date.substring(0, 4) : "N/A"}
          </p>
          {/* <p className="text-yellow-400 text-xs">⭐ {movie.vote_average?.toFixed(1)}</p> */}
        </div>
      </li>
    </Link>
  );
};

export default MovieCard;
