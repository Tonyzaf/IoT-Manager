import React, { useState } from "react";

import "../styles/login.css";
import axios from "axios";
import Router from "next/router";
import { setSession } from "@/utilities/user";

function LoginPage() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    console.log("called");
    try {
      const response = await axios.get(
        `http://localhost:5000/login?username=${username}&password=${password}`
      );
      console.log("response", response);
      // Handle the response here
      if (response.data) {
        console.log("logged in");
        setSession(response.data);
        clearFields();
        Router.push("/home");
      } else {
        clearFields();
        setError(true);
      }
    } catch (error) {
      // Handle errors
      setError(true);
      console.error(error);
    }
  };

  const clearFields = () => {
    setUsername("");
    setPassword("");
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to IoT-Manager</h1>
        <p>
          This project was developed as part of a Master's thesis for the
          Department of Computer Engineering and Informatics of the University
          of Patras.
        </p>
        <div className="formContainer">
          <form onSubmit={login}>
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
            <div className="buttonRow">
              <button
                className={
                  isButtonHovered ? "highlighted-button" : "normal-button"
                }
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                type="submit"
              >
                Login
              </button>
              <p onClick={() => Router.push("/register")}>Register</p>
              {error && <p>An error has occured. Please try again</p>}
            </div>
          </form>
        </div>
      </header>
    </div>
  );
}

export default LoginPage;
