import React from "react";

const ImageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1} // Thinner stroke
    stroke="currentColor"
    className="w-20 h-20 text-gray-500" // Adjust size and color
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm16.5-1.5H3.75V6h16.5v12Z"
    />
  </svg>
);

const PlaceholderBackdrop = ({ className = "" }) => {
  return (
    <div
      className={`bg-slate-800 rounded-lg flex items-center justify-center aspect-video w-full ${className}`} // Enforce 16:9 aspect ratio
      aria-label="Movie backdrop placeholder"
    >
      <ImageIcon />
    </div>
  );
};

export default PlaceholderBackdrop;
