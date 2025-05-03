import React from "react";

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1}
    stroke="currentColor"
    className="w-12 h-12 text-gray-500"
  >
    {" "}
    {/* Adjust size */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);

const PlaceholderProfile = ({ className = "" }) => {
  return (
    <div
      className={`bg-slate-800 rounded-full flex items-center justify-center w-24 h-24 mx-auto mb-2 shadow-md ${className}`} // Match cast image size and style
      aria-label="Profile image placeholder"
    >
      <UserIcon />
    </div>
  );
};

export default PlaceholderProfile;
