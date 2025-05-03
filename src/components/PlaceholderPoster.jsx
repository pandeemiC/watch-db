import React from "react";

const MovieIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1} // Thinner stroke
    stroke="currentColor"
    className="w-16 h-16 text-gray-500" // Adjust size and color
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z"
    />
  </svg>
);

const PlaceholderPoster = ({ className = "" }) => {
  return (
    <div
      className={`bg-slate-800 rounded-lg flex items-center justify-center aspect-[2/3] w-full ${className}`}
      aria-label="Poster placeholder"
    >
      <MovieIcon />
    </div>
  );
};

export default PlaceholderPoster;
