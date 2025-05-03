import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom"; // Import useParams and Link
import Spinner from "../components/Spinner"; // Adjust path

// Constants (could be shared in a config file)
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/"; // Base for images

function MovieDetails() {
  const { movieId } = useParams(); // Get the movieId from the URL parameter
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!movieId) return; // Don't fetch if movieId is missing

      setIsLoading(true);
      setError("");
      setMovie(null); // Clear previous movie data

      // Construct the URL for fetching movie details, including videos and credits
      const endpoint = `${API_BASE_URL}/movie/${movieId}?append_to_response=videos,credits,images`;

      try {
        const response = await fetch(endpoint, API_OPTIONS);
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {}
          throw new Error(
            `API Error: ${response.status} - ${
              errorData?.status_message || "Failed to fetch details"
            }`
          );
        }
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError(err.message || "Could not load movie details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [movieId]); // Re-run effect if movieId changes

  // --- Helper Functions for Display ---
  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return `$${amount.toLocaleString()}`;
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPosterUrl = (path, size = "w500") => {
    return path ? `${IMAGE_BASE_URL}${size}${path}` : "/placeholder-poster.png";
  };
  const getBackdropUrl = (path, size = "w1280") => {
    return path
      ? `${IMAGE_BASE_URL}${size}${path}`
      : "/placeholder-backdrop.png"; // Add a placeholder
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (!movie) {
    return (
      <div className="text-white text-center py-10">
        Movie details not found.
      </div>
    );
  }

  // --- Main Detail View ---
  return (
    <div className="wrapper px-4 md:px-8 lg:px-16 py-8 text-white">
      {/* Back Button */}
      <RouterLink
        to="/"
        className="inline-block mb-6 text-indigo-400 hover:text-indigo-300"
      >
        ← Back to List
      </RouterLink>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
          <div className="flex items-center space-x-3 text-gray-400 text-sm mb-4">
            <span>{movie.release_date?.substring(0, 4)}</span>
            {movie.adult && <span className="border px-1 rounded">18+</span>}
            {/* You might need mapping for certification if available */}
            {/* <span>PG-13</span>  */}
            {movie.runtime > 0 && <span>{formatRuntime(movie.runtime)}</span>}
          </div>
        </div>
        {/* Ratings/Actions */}
        <div className="flex space-x-3 mt-4 md:mt-0">
          {movie.vote_average > 0 && (
            <div className="bg-gray-700 px-3 py-1 rounded-md flex items-center space-x-1 text-sm">
              <span className="text-yellow-400">⭐</span>
              <span>{movie.vote_average.toFixed(1)}</span>
              <span className="text-gray-400">
                ({movie.vote_count.toLocaleString()})
              </span>
            </div>
          )}
          {/* Add other buttons like watchlist if needed */}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Left Column (Poster) */}
        <div className="md:col-span-1">
          <img
            src={getPosterUrl(movie.poster_path, "w780")}
            alt={`${movie.title} Poster`}
            className="rounded-lg shadow-lg w-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-poster.png";
            }}
          />
        </div>

        {/* Right Column (Backdrop, Info) */}
        <div className="md:col-span-2 lg:col-span-3">
          {/* Backdrop Image */}
          <div className="mb-6 relative">
            <img
              src={getBackdropUrl(movie.backdrop_path, "w1280")}
              alt={`${movie.title} Backdrop`}
              className="rounded-lg shadow-lg w-full max-h-[400px] object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-backdrop.png";
              }}
            />
            {/* Optional: Trailer Button Overlay */}
            {movie.videos?.results?.find(
              (v) =>
                v.site === "YouTube" &&
                (v.type === "Trailer" || v.type === "Teaser")
            ) && (
              <a
                href={`https://www.youtube.com/watch?v=${
                  movie.videos.results.find(
                    (v) =>
                      v.site === "YouTube" &&
                      (v.type === "Trailer" || v.type === "Teaser")
                  ).key
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 bg-black bg-opacity-70 px-4 py-2 rounded-md text-white hover:bg-opacity-90 transition flex items-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Trailer</span>
              </a>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Genres */}
            {movie.genres?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-400">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-400">
                  Overview
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {movie.overview}
                </p>
              </div>
            )}

            {/* Visit Homepage Button */}
            {movie.homepage && (
              <div className="pt-4">
                <a
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-md transition"
                >
                  Visit Homepage
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 ml-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </a>
              </div>
            )}

            {/* Other Details Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {movie.release_date && (
                <div>
                  <strong className="text-gray-400 block">Release Date</strong>{" "}
                  {new Date(movie.release_date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  {movie.production_countries?.length > 0
                    ? `(${movie.production_countries[0].name})`
                    : ""}{" "}
                </div>
              )}
              {movie.production_countries?.length > 0 && (
                <div>
                  <strong className="text-gray-400 block">Countries</strong>{" "}
                  {movie.production_countries.map((c) => c.name).join(" · ")}
                </div>
              )}
              {movie.status && (
                <div>
                  <strong className="text-gray-400 block">Status</strong>{" "}
                  {movie.status}
                </div>
              )}
              {movie.spoken_languages?.length > 0 && (
                <div>
                  <strong className="text-gray-400 block">Language</strong>{" "}
                  {movie.spoken_languages
                    .map((l) => l.english_name)
                    .join(" · ")}
                </div>
              )}
              {movie.budget > 0 && (
                <div>
                  <strong className="text-gray-400 block">Budget</strong>{" "}
                  {formatCurrency(movie.budget)}
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <strong className="text-gray-400 block">Revenue</strong>{" "}
                  {formatCurrency(movie.revenue)}
                </div>
              )}
              {movie.tagline && (
                <div>
                  <strong className="text-gray-400 block">Tagline</strong>{" "}
                  <em className="text-gray-300">"{movie.tagline}"</em>
                </div>
              )}
              {movie.production_companies?.length > 0 && (
                <div className="sm:col-span-2">
                  <strong className="text-gray-400 block">
                    Production Companies
                  </strong>{" "}
                  {movie.production_companies.map((c) => c.name).join(" · ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Cast Section */}
      {movie.credits?.cast?.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movie.credits.cast.slice(0, 12).map(
              (
                person // Limit displayed cast
              ) => (
                <div key={person.cast_id} className="text-center">
                  <img
                    src={getPosterUrl(person.profile_path, "w185")}
                    alt={person.name}
                    className="rounded-full w-24 h-24 object-cover mx-auto mb-2 shadow-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-profile.png";
                    }} // Add placeholder
                  />
                  <p className="text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {person.character}
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Optional: More Images/Backdrops */}
      {movie.images?.backdrops?.length > 1 && ( // Show only if more than the main one
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {movie.images.backdrops.slice(1, 7).map(
              (
                img,
                index // Show a few more
              ) => (
                <img
                  key={index}
                  src={getBackdropUrl(img.file_path, "w780")}
                  alt={`Backdrop ${index + 1}`}
                  className="rounded-lg shadow-md w-full h-auto"
                />
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default MovieDetails;
