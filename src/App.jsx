import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MovieDetails from "./pages/MovieDetails";
import BrowsePage from "./pages/BrowsePageMovie";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <main className="min-h-screen bg-primary overflow-x-hidden">
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
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-label="Expand Menu"
              aria-expanded={isMobileOpen}
              onClick={toggleMobileMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            <RouterLink to="/" className="flex-shrink-0">
              <img
                src="/logo.svg"
                alt="WatchDBLogo"
                className="h-8 md:h-15 w-auto"
              />
            </RouterLink>
          </div>

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
            <button className="sm:inline-block text-white font-medium px-4 py-1.5 rounded-md hover:bg-slate-700/50 transition">
              Log In
            </button>
            <button className="bg-gradient text-primary font-semibold px-4 py-1.5 rounded-md text-sm hover:opacity-90 transition">
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      {/* MOBILE HAMBURGER */}
      <div
        className={`fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
        aria-hidden={!isMobileOpen}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`fixed top-1/4 left-1/4 z-[80] w-[90%] max-w-xs transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-lg shadow-xl p-6 transition-all duration-300 ease-in-out ${
            isMobileOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closeMobileMenu}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>

          <ul className="flex flex-col items-center space-y-8 pt-6">
            <li>
              <RouterLink
                onClick={closeMobileMenu}
                to="/categories"
                className="text-lg font-bold uppercase text-gray-200 hover:text-gradient transition"
              >
                Categories
              </RouterLink>
            </li>
            <li>
              <RouterLink
                onClick={closeMobileMenu}
                to="/browse"
                className="text-lg font-bold uppercase text-gray-200 hover:text-gradient transition-colors"
              >
                Browse
              </RouterLink>
            </li>
            <li>
              <RouterLink
                onClick={closeMobileMenu}
                to="/about"
                className="text-lg text-gray-200 font-bold uppercase hover:text-gradient transition-colors"
              >
                About Us
              </RouterLink>
            </li>
            <li>
              <RouterLink
                onClick={closeMobileMenu}
                to="/contact"
                className="text-lg text-gray-200 font-bold uppercase hover:text-gradient transition-colors"
              >
                Contact
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

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
