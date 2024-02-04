import React, { useEffect, useState } from "react";
import NavBar from "@/components/Navbar/Navbar";
import Select from "react-select";
import PlayerControls from "@/components/PlayerControls/PlayerControls";

import "../styles/home.css";
import { checkSession, getUserId } from "@/utilities/user";
import axios from "axios";

function HomePage() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [result, setResult] = useState();
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    checkSession();
    getUserDevices();
  }, []);

  const getUserDevices = async () => {
    console.log("called");
    const userId = getUserId();
    try {
      const response = await axios.get(
        `http://localhost:5000/getUserDevices?userId=${userId}`
      );
      setDevices(response.data);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

  const handleButtonHover = () => {
    setIsButtonHovered(true);
  };

  const handleButtonLeave = () => {
    setIsButtonHovered(false);
  };

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  const handleFileUpload = async () => {
    const formData = new FormData();
    const deviceIds = selectedDevices?.map((device) => device.value);
    formData.append("file", file);
    console.log("ids", deviceIds);
    console.log("form", formData);

    try {
      const response = await axios.post(
        `http://localhost:5000/addTrack?deviceIds=${deviceIds.join(",")}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response?.data);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

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
          options={devices}
          placeholder="No Devices Selected..."
        />
      </div>
      <div className="Player-Controls">
        <h2>Select A File To Upload</h2>
        <input
          id="file"
          type="file"
          accept=".mp3,.mp4"
          onChange={handleChange}
        />
        <button className="Upload-Button" onClick={handleFileUpload}>
          <h3>Upload</h3>
        </button>
        <PlayerControls selectedDevices={selectedDevices} />
      </div>
    </div>
  );
}

export default HomePage;
