import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "@/components/navbar/navbar";

import "../styles/home.css";

function HomePage() {
  const { logout } = useAuth0();
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [result, setResult] = useState();

  const handleButtonHover = () => {
    setIsButtonHovered(true);
  };

  const handleButtonLeave = () => {
    setIsButtonHovered(false);
  };

  return (
    <div className="App">
      <NavBar setResult={setResult} /> {/* Render the NavBar component */}
      <header className="App-header">
        <h1>Welcome to IoT Manager</h1>
        <h1>{result}</h1>
      </header>
    </div>
  );
}

export default HomePage;
