import React, { Component, useEffect, useState } from "react";
import axios from "axios";
import Router from "next/router";

import "../styles/addDeviceLanding.css";
import { getUserId } from "@/utilities/user";

const addDeviceLanding = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [credentials, setCredentials] = useState("");
  const [success, setSuccess] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [error, setError] = useState();

  let headers = new Headers();

  headers.append("Content-Type", "application/json");
  headers.append("Accept", "application/json");

  const getCredentials = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/getCredentials`);
      console.log(response.data);
      setCredentials(response.data);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

  const CallEndpoints = async () => {
    console.log("called");
    try {
      const response = await axios.post(`http://localhost:5000/verifyDevice`, {
        username: username,
        password: password,
      });
      console.log("response", response);
      // Handle the response here
      if (response.data === "True") {
        console.log("Connected to device");
        await axios.post(`http://localhost:5000/addDevice`, {
          username: username,
          password: password,
          deviceId: deviceName,
          userId: getUserId(),
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      // Handle errors
      console.error(error);
    }
    // Reset the form after submission
    clearFields();
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

  const handleDeviceNameChange = (e) => {
    setDeviceName(e.target.value);
  };

  const clearFields = () => {
    setUsername("");
    setPassword("");
    setDeviceName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // You can perform your login logic here with this.state.username and this.state.password
    // For example, you can make an API request to authenticate the user
    console.log("Username: ", username);
    console.log("Password: ", password);
    console.log("Device Name: ", deviceName);
    const result = await CallEndpoints();
    console.log(result);
    if (!result) {
      setError("An Error Has Occured. Please Try Again.");
      return;
    }
    Router.push({
      pathname: "/addDeviceResult",
      query: { result: result },
    });
  };

  useEffect(() => {
    getCredentials();
  }, []);

  if (credentials == null) return;

  return (
    <div>
      <div className="App">
        <header className="App-header">
          <h1>Pair New Device</h1>
        </header>
      </div>
      <h2>Please run the following command on the device you want to pair.</h2>
      <h2 className="sshCommand">{credentials}</h2>
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
          <div className="usernameForm">
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <div>
            <label htmlFor="deviceName">Device Name: </label>
            <input
              type="text"
              id="deviceName"
              name="deviceName"
              value={deviceName}
              onChange={handleDeviceNameChange}
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
            >
              Next
            </button>
          </div>
          {error && <p>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default addDeviceLanding;
