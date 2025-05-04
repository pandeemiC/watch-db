import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import MovieDetails from "./pages/MovieDetails";
import BrowsePage from "./pages/BrowsePage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <main>
      <div className="pattern">
        <nav className="flex justify-between items-center w-screen p-5">
          <ul className="flex items-center space-x-6 ml-5">
            <li className="text-white bg-indigo-900 p-3 rounded-md cursor-pointer">
              <a href="/">Browse</a>
            </li>
            <li className="text-white cursor-pointer">About Us</li>
            <li className="text-white cursor-pointer">Contact</li>
          </ul>
          <div className="flex justify-end gap-4 mr-5">
            <button className="text-white bg-indigo-900 p-3 rounded-md cursor-pointer">
              Sign Up
            </button>
            <button className="text-white cursor-pointer">Log In</button>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:movieId" element={<MovieDetails />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
