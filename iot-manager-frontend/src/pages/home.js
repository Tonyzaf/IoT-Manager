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
  const [displayedDevices, setDisplayedDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [file, setFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    checkSession();
    getUserDevices();
  }, []);

  useEffect(() => {
    if (devices.length > 0) {
      getUserGroups();
    }
  }, [devices]);

  const mergeDeviceGroups = (objects) => {
    const mergedObjects = {};

    objects.forEach((obj) => {
      const groupName = obj.groupName;

      if (!mergedObjects[groupName]) {
        mergedObjects[groupName] = { ...obj, label: groupName };
      } else {
        mergedObjects[groupName].devices = [
          ...mergedObjects[groupName].devices,
          ...obj.devices,
        ];
      }
    });

    return Object.values(mergedObjects);
  };

  const getUserGroups = async () => {
    console.log("called");
    const userId = getUserId();
    try {
      const response = await axios.get(
        `http://localhost:5000/getUserGroups?userId=${userId}`
      );
      setDisplayedDevices((previousValue) => [
        ...devices,
        ...mergeDeviceGroups(response.data),
      ]);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

  const getUserDevices = async () => {
    console.log("called");
    const userId = getUserId();
    try {
      const response = await axios.get(
        `http://localhost:5000/getUserDevices?userId=${userId}`
      );
      console.log(response.data);
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

      // Reset file input
      document.getElementById("file").value = null;
      setFile(null); // Also reset file state
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

  const handleDeviceSelection = (values) => {
    var selectedDevices = [];
    function hasDevices(obj) {
      return obj.hasOwnProperty("devices") && Array.isArray(obj.devices);
    }
    if (values.length > 0) {
      selectedDevices = [];
      values.forEach((obj) => {
        if (hasDevices(obj)) {
          obj.devices.forEach((device) => {
            const deviceToAdd = devices.find(
              (d) => d.label === device.deviceId
            );
            if (selectedDevices) selectedDevices.push(deviceToAdd);
          });
        } else {
          selectedDevices.push(obj);
        }
      });
      setSelectedDevices(selectedDevices);
    }
    if (
      selectedDevices.find((device) => {
        if (device.status.includes("playing")) {
          return true;
        } else return false;
      })
    ) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
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
          onChange={(values) => handleDeviceSelection(values)}
          isMulti
          // options={devices.filter((device) => device.status != "Offline")}
          options={displayedDevices}
          placeholder="No Devices Selected..."
        />
      </div>
      <div className="Player-Controls">
        <h2>Select A File Or Playlist To Upload</h2>
        <input
          id="file"
          type="file"
          accept=".mp3,.m3u"
          onChange={handleChange}
        />
        <button className="Upload-Button" onClick={handleFileUpload}>
          <h3>Upload</h3>
        </button>
        <PlayerControls
          selectedDevices={selectedDevices}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      </div>
    </div>
  );
}

export default HomePage;
