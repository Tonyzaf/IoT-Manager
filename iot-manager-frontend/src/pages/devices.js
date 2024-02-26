import React, { useEffect, useState } from "react";
import NavBar from "@/components/Navbar/Navbar";
import Select from "react-select";
import PlayerControls from "@/components/PlayerControls/PlayerControls";
import DeleteIcon from "@/assets/DeleteIcon.png";

import "../styles/devices.css";
import { checkSession, getUserId } from "@/utilities/user";
import axios from "axios";
import Image from "next/image";

function Devices() {
  const [devices, setDevices] = useState([]);

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

  const removeDevice = (id) => {
    axios
      .delete("http://localhost:5000/removeDevice?deviceId=" + id)
      .then((response) => {
        console.log(response);
        getUserDevices();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const DeviceItem = ({ name, id, port, status }) => {
    console.log(status);
    var displayedStatus = status;
    if (status.includes("playing")) {
      displayedStatus = "Playing";
    } else if (status.includes("paused")) {
      displayedStatus = "Paused";
    } else if (status != "Offline") {
      displayedStatus = "Online";
    }
    return (
      <div className="device-container">
        <p>{name}</p>
        <p>Port = {port}</p>
        <p>{displayedStatus}</p>
        <Image
          src={DeleteIcon}
          height={16}
          alt="delete"
          onClick={() => removeDevice(id)}
        />
      </div>
    );
  };

  console.log(devices);

  return (
    <div className="App">
      <NavBar /> {/* Render the NavBar component */}
      <header className="App-header">
        <h1>Manage Your Devices</h1>
      </header>
      <div className="device-list-container">
        {devices.map((device) => (
          <DeviceItem
            name={device.label}
            id={device.value}
            port={device.port}
            status={device.status}
          />
        ))}
      </div>
    </div>
  );
}

export default Devices;
