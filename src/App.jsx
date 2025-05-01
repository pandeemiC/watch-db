import React, { useState } from "react";
import Search from "./components/Search";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src="./hero-img.png" alt="hero-banner" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              Without the Hassle
            </h1>
          </header>
          <Search search={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>
    </main>
  );
}

export default App;
