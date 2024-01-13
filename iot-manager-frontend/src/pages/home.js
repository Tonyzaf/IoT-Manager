import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "@/components/Navbar/Navbar";
import Select from "react-select";
import PlayerControls from "@/components/PlayerControls/PlayerControls";

import "../styles/home.css";

function HomePage() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [result, setResult] = useState();
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [file, setFile] = useState(null);

  const handleButtonHover = () => {
    setIsButtonHovered(true);
  };

  const handleButtonLeave = () => {
    setIsButtonHovered(false);
  };

  const options = [
    {
      value: "device1",
      label: "Raspberry Pi Zero W",
    },
    {
      value: "device2",
      label: "Raspberry Pi 4",
    },
    {
      value: "device3",
      label: "Macbook Pro",
    },
  ];

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  console.log(selectedDevices, file);

  return (
    <div className="App">
      <NavBar setResult={setResult} /> {/* Render the NavBar component */}
      <header className="App-header">
        <h1>Welcome to IoT Manager</h1>
      </header>
      <div className="Device-Selector">
        <h2>Select Devices</h2>
        <Select
          onChange={(values) => setSelectedDevices(values)}
          isMulti
          options={options}
          placeholder="No Devices Selected..."
        />
      </div>
      <div className="Player-Controls">
        <h2>Select A File To Upload</h2>
        <input id="file" type="file" accept=".mp3,.mp4" onChange={handleChange} />
        <button className="Upload-Button">
          <h3>Upload</h3>
        </button>
        <PlayerControls />
      </div>
    </div>
  );
}

export default HomePage;
