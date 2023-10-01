import React, { useState } from "react";

import "../styles/addDeviceResult.css";

const addDeviceResult = ({ success }) => {
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
      <header className="App-header">
        <h1>
          {success
            ? "Your device was successfully paired"
            : "An error occured. Please try again"}
        </h1>
      </header>
    </div>
  );
};

export default addDeviceResult;
