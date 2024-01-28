import React, { useState } from "react";

import "../styles/login.css";

function LoginPage() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleButtonHover = () => {
    setIsButtonHovered(true);
  };

  const handleButtonLeave = () => {
    setIsButtonHovered(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to IoT-Manager</h1>
        <p>
          This project was developed as part of a Master's thesis for the
          Department of Computer Engineering and Informatics of the University
          of Patras.
        </p>
        <button
          className={isButtonHovered ? "highlighted-button" : "normal-button"}
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
          onClick={loginWithRedirect}
        >
          Login
        </button>
      </header>
    </div>
  );
}

export default LoginPage;
