import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

import "../styles/addDeviceResult.css";

const addDeviceResult = () => {
  const searchParams = useSearchParams();

  const success = searchParams.get("result");
  console.log("s", success);

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          {success === "true"
            ? "Your device was successfully paired"
            : "An error occured. Please try again"}
        </h1>
      </header>
    </div>
  );
};

export default addDeviceResult;
