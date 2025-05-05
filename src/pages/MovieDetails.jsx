import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom"; // Import useParams and Link
import Spinner from "../components/Spinner";

import PlaceholderPoster from "../components/PlaceholderPoster";
import PlaceholderBackdrop from "../components/PlaceholderBackdrop";
import PlaceholderProfile from "../components/PlaceholderProfile";

// Constants
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

function MovieDetails() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!movieId) return;

      setIsLoading(true);
      setError("");
      setMovie(null);

      // fetching movie details, including videos and credits
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
  }, [movieId]);

  useEffect(() => {
    if (!isLightBoxOpen) return;

    const handleKeyDown = (e) => {
      console.log("Keydown:", e.key);
      if (e.key === "Escape" || e.code === "Escape") {
        closeLightBox();
      } else if (e.key === "ArrowLeft") {
        showPrevImage({ stopPropagation: () => {} }); // dummy event ?
      } else if (e.key === "ArrowRight") {
        showNextImage({ stopPropagation: () => {} }); // " " " " " "
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightBoxOpen]);

  // Helperssss
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

  const getImageUrl = (path, size = "w500") => {
    return path ? `${IMAGE_BASE_URL}${size}${path}` : null;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = "none";
  };

  // Lightbox Functions

  const lightboxImages =
    movie?.images?.backdrops?.filter((img) => img.file_path) || [];

  const openLightBox = (index) => {
    setCurrentImageIndex(index);
    setIsLightBoxOpen(true);
  };

  const closeLightBox = () => {
    setIsLightBoxOpen(false);
  };

  const showPrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === null || lightboxImages.length === 0) return prevIndex;
      return (prevIndex - 1 + lightboxImages.length) % lightboxImages.length;
    });
  };

  const showNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === null || lightboxImages.length === 0) return prevIndex;
      return (prevIndex + 1) % lightboxImages.length;
    });
  };

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

  return (
    <div className="wrapper px-4 md:px-8 lg:px-16 py-8 text-white">
      {/* Back Button */}
      <RouterLink
        to="/"
        className="inline-block mb-6 text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        ← Back to List
      </RouterLink>

      <div className="relative mb-10">
        <div
          className="absolute -inset-4 md:-inset-6 lg:-inset-8 -z-10
                       bg-gradient-to-br from-indigo-800/30 via-purple-600/20 to-pink-600/30
                       blur-3xl opacity-60
                       rounded-3xl"
          aria-hidden="true"
        ></div>

        {/* Header Section */}
        <div className="relative bg-gradient-br from-slate-900 via-slate-800 to-indigo-950 p6 md:p-10 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {movie.title}
              </h1>
              <div className="flex items-center space-x-3 text-gray-400 text-sm mb-4">
                <span>{movie.release_date?.substring(0, 4)}</span>
                {movie.adult && (
                  <span className="border px-1 rounded">18+</span>
                )}

                {movie.runtime > 0 && (
                  <span>{formatRuntime(movie.runtime)}</span>
                )}
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
              <div className="flex space-x-3 mt-4 md:mt-0">
                <div className="bg-indigo-800 px-3 py-1 rounded-md flex items-center text-md cursor-pointer">
                  <svg
                    className="w-3 h-3 mr-2 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 8"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"
                    />
                  </svg>
                  <span className="text-white">Add to Watchlist</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Left Column (Poster) */}
            <div className="md:col-span-1">
              {movie.poster_path ? (
                <img
                  src={getImageUrl(movie.poster_path, "w780")}
                  alt={`${movie.title} Poster`}
                  className="rounded-lg shadow-lg w-full"
                  onError={handleImageError}
                />
              ) : (
                <PlaceholderPoster />
              )}
            </div>

            {/* Right Column (Backdrop, Info) */}
            <div className="md:col-span-2 lg:col-span-3">
              {/* Backdrop Image */}
              <div className="mb-6 relative">
                {movie.backdrop_path ? (
                  <img
                    src={getImageUrl(movie.backdrop_path, "w1280")}
                    alt={`${movie.title} Backdrop`}
                    className="rounded-lg shadow-lg w-full max-h-[450px] object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <PlaceholderBackdrop className="max-h-[450px]" />
                )}

                {movie.videos?.results?.find(
                  (vod) =>
                    vod.site === "YouTube" &&
                    (vod.type === "Trailer" || vod.type === "Teaser")
                ) && (
                  <a
                    href={`https://www.youtube.com/watch?v=${
                      movie.videos.results.find(
                        (vod) =>
                          vod.site === "YouTube" &&
                          (vod.type === "Trailer" || vod.type === "Teaser")
                      ).key
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 left-4 bg-black bg-opacity-70 px-4 py-2 rounded-md text-white hover:bg-opacity-30 transition flex items-center space-x-2"
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
              <div className="space-y-8">
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
                <div className="border-t border-slate-700 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {movie.release_date && (
                    <div>
                      <strong className="text-gray-400 block">
                        Release Date
                      </strong>{" "}
                      {new Date(movie.release_date).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}{" "}
                      {movie.production_countries?.length > 0
                        ? `(${movie.production_countries[0].name})`
                        : ""}{" "}
                    </div>
                  )}
                  {movie.production_countries?.length > 0 && (
                    <div>
                      <strong className="text-gray-400 block">Countries</strong>{" "}
                      {movie.production_countries
                        .map((country) => country.name)
                        .join(" · ")}
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
                        .map((lang) => lang.english_name)
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
                      {movie.production_companies
                        .map((c) => c.name)
                        .join(" · ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cast Section */}
          {movie.credits?.cast?.length > 0 && (
            <section className="mt-12 border-t border-slate-700 pt-8">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-300">
                Top Billed Cast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
                {movie.credits.cast.slice(0, 12).map((person) => (
                  <div
                    key={person.cast_id || person.id}
                    className="text-center"
                  >
                    {person.profile_path ? (
                      <img
                        src={getImageUrl(person.profile_path, "w185")}
                        alt={person.name}
                        className="rounded-full w-24 h-24 object-cover mx-auto mb-2 shadow-md border-2 border-transparent hover:border-indigo-500 transition"
                        onError={handleImageError}
                      />
                    ) : (
                      <PlaceholderProfile />
                    )}
                    <p className="text-sm font-medium text-white mt-1">
                      {person.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {person.character}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {lightboxImages.length > 1 && (
            <section className="mt-12 border-t border-slate-700 pt-8">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-300">
                Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lightboxImages.slice(0, 6).map(
                  (
                    img,
                    index // Show a few more
                  ) => (
                    <button
                      key={img.file_path}
                      onClick={() => openLightBox(index)}
                      className="block w-full h-auto rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 group"
                      aria-label={`View ${index + 1} enlarged`}
                    >
                      <img
                        src={getImageUrl(img.file_path, "w780")}
                        alt={`Backdrop ${index + 1}`}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    </button>
                  )
                )}
              </div>
            </section>
          )}
        </div>
      </div>
      {/* LIGHTBOX */}
      {isLightBoxOpen && currentImageIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300"
          onClick={closeLightBox}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-image"
        >
          <div
            className="relative w-full h-full flex items-center justify-center" // Adjusted to use full overlay space for button positioning
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative inline-block max-w-[90vw] max-h-[90vh] align-middle">
              <img
                id="lightbox-image"
                src={getImageUrl(
                  lightboxImages[currentImageIndex].file_path,
                  "original" // Fetch original size
                )}
                alt={`Enlarged backdrop ${currentImageIndex + 1}`}
                className="block w-auto h-auto max-w-full z-[110] max-h-full object-contain rounded-lg shadow-2xl"
              />

              <button
                onClick={closeLightBox}
                className="absolute cursor-pointer xl:top-15 xl:right-15 top-2 right-2 z-[120] bg-slate-800/70 text-white rounded-full p-1.5 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close Image"
              >
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Prev button */}
            {lightboxImages.length > 1 && (
              <button
                onClick={showPrevImage}
                className="absolute cursor-pointer z-[110] bg-slate-800/70 text-white rounded-full p-2 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out bottom-4 left-4 md:left-2 md:sm:left-4 md:top-1/2 md:-translate-y-1/2 md:bottom-auto"
                aria-label="Previeous Image"
                disabled={currentImageIndex === 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
            )}

            {lightboxImages.length > 0 && (
              <button
                onClick={showNextImage}
                className="absolute z-[110] bg-slate-800/70 text-white rounded-full p-2 cursor-pointer hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out bottom-4 right-4 md:right-2 md:sm:right-4 md:top-1/2 md:-translate-y-1/2 md:bottom-auto"
                aria-label="Next image"
                disabled={currentImageIndex === lightboxImages.length - 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
