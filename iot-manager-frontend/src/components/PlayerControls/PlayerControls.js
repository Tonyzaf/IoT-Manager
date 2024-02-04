import React, { useState } from "react";
import "./playerControls.css";
import PlayButton from "../../assets/PlayButton.png";
import PauseButton from "../../assets/PauseButton.png";
import ForwardButton from "../../assets/ForwardButton.png";
import BackwardButton from "../../assets/BackwardButton.png";
import Image from "next/image";
import axios from "axios";

export const PlayerControls = ({ selectedDevices }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const play = async () => {
    const deviceIds = selectedDevices?.map((device) => device.value);
    console.log(deviceIds);
    if (deviceIds.length > 0) {
      try {
        const response = await axios.post(`http://localhost:5000/play`, {
          deviceIds: deviceIds,
        });
        console.log(response?.data);
        setIsPlaying(!isPlaying);
      } catch (error) {
        // Handle errors
        console.error(error);
      }
    }
  };

  const next = async () => {
    const deviceIds = selectedDevices?.map((device) => device.value);
    console.log(deviceIds);
    if (deviceIds.length > 0) {
      try {
        const response = await axios.post(`http://localhost:5000/next`, {
          deviceIds: deviceIds,
        });
        console.log(response?.data);
      } catch (error) {
        // Handle errors
        console.error(error);
      }
    }
  };

  const prev = async () => {
    const deviceIds = selectedDevices?.map((device) => device.value);
    if (deviceIds.length > 0) {
      try {
        const response = await axios.post(`http://localhost:5000/prev`, {
          deviceIds: deviceIds,
        });
        console.log(response?.data);
      } catch (error) {
        // Handle errors
        console.error(error);
      }
    }
  };

  console.log(selectedDevices);

  return (
    <div className="Player-Controls">
      <Image
        src={BackwardButton}
        alt="Previous Button"
        height={96}
        onClick={prev}
      />
      <Image
        src={isPlaying ? PauseButton : PlayButton}
        className="Play-Pause-Button"
        onClick={play}
        height={96}
      />
      <Image src={ForwardButton} alt="Next Button" height={96} onClick={next} />
    </div>
  );
};

export default PlayerControls;
