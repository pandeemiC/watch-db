import React from "react";
import { Link } from "react-router-dom";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({ movie }) => {
  const imageUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : "/placeholder-poster.png"; //fallback

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = "none";
  };

  return (
    <Link to={`/movie/${movie.id}`} className="block group">
      <li className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl">
        <img
          src={imageUrl}
          alt={`${movie.title} Poster`}
          className="w-full h-auto object-cover"
          onError={handleImageError}
        />
        <div className="p-3">
          <h3
            className="text-white font-semibold text-sm truncate"
            title={movie.title}
          >
            {movie.title}
          </h3>

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
