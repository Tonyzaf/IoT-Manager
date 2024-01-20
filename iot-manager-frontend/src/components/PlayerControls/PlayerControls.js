import React, { useState } from "react";
import "./playerControls.css";
import PlayButton from "../../assets/PlayButton.png";
import PauseButton from "../../assets/PauseButton.png";
import ForwardButton from "../../assets/ForwardButton.png";
import BackwardButton from "../../assets/BackwardButton.png";
import Image from "next/image";

function PlayerControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <div className="Player-Controls">
      <Image src={BackwardButton} alt="Play Button" height={96} />
      <Image
        src={isPlaying ? PauseButton : PlayButton}
        className="Play-Pause-Button"
        onClick={() => setIsPlaying(!isPlaying)}
        height={96}
      />
      <Image src={ForwardButton} alt="Play Button" height={96} />
    </div>
  );
}

export default PlayerControls;
