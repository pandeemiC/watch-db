import React from "react";
import { Routes, Route } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MovieDetails from "./pages/MovieDetails";
import BrowsePage from "./pages/BrowsePage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <main className="min-h-screen bg-primary">
      {/* <div className="pattern absolute inset-0 z-0"></div> */}

      <nav
        className="sticky top-0 z-50 w-full
                   px-4 md:px-8 lg:px-12 py-3 
                   bg-primary/80 
                   backdrop-blur-md 
                   border-b border-slate-700/50 
                   "
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <RouterLink to="/" className="flex-shrink-0">
            <img
              src="/logo.svg"
              alt="WatchDBLogo"
              className="h-8 md:h-15 w-auto"
            />
          </RouterLink>

          <ul className="hidden md:flex justify-center items-center gap-6 lg:gap-8">
            <li>
              <RouterLink
                to="/categories"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Categories
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/browse"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Browse
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/contact"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact
              </RouterLink>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-block text-white font-medium px-4 py-1.5 rounded-md hover:bg-slate-700/50 transition">
              Log In
            </button>
            <button className="bg-gradient text-primary font-semibold px-4 py-1.5 rounded-md text-sm hover:opacity-90 transition">
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      <div className="relative z-10">
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
