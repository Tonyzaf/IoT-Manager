import React, { Component, useState } from "react";
import axios from "axios";
import Router from "next/router";

import "../styles/addDeviceLanding.css";

const addDeviceLanding = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const CallEndpoint = async () => {
    console.log("called");
    try {
      const response = await axios.get(
        `http://localhost:5000/verify_device/${username}/${password}`
      );
      // Handle the response here
      console.log(response.data);
      setSuccess(response.data);
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

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can perform your login logic here with this.state.username and this.state.password
    // For example, you can make an API request to authenticate the user
    console.log("Username: ", username);
    console.log("Password: ", password);
    // Reset the form after submission
    setUsername("");
    setPassword("");
    Router.push("/addDeviceResult", { success: success });
  };

  return (
    <div>
      <div className="App">
        <header className="App-header">
          <h1>Pair New Device</h1>
        </header>
      </div>
      <h2>Please run the following command on the device you want to pair.</h2>
      <h2 className="sshCommand">
        ssh -R 1234:localhost:22 antonis@192.168.1.15
      </h2>
      <h2>
        After that, please enter the username and password to your local account
        and press next to establish a connection.
      </h2>

      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <div className="usernameForm">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div>
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="buttonRow">
            <button
              className={
                isButtonHovered ? "highlighted-button" : "normal-button"
              }
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              type="submit"
              onClick={CallEndpoint}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default addDeviceLanding;
