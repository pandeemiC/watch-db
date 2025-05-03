import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-white text-center px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-3xl mb-6">Page Not Found</h2>
      <p className="text-lg mb-8">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-md transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
