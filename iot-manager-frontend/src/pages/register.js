import React, { useState } from "react";

import "../styles/register.css";
import axios from "axios";
import Router from "next/router";

function RegisterPage() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

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

  const register = async (e) => {
    e.preventDefault();
    console.log("called");
    try {
      const response = await axios.post(`http://localhost:5000/register`, {
        username: username,
        password: password,
      });
      console.log("response", response);
      // Handle the response here
      if (response.status === 200) {
        console.log("Registered");
        clearFields();
        Router.push("/login");
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Register to IoT-Manager</h1>
        <div className="formContainer">
          <form onSubmit={register}>
            <div className="usernameForm">
              <label htmlFor="username">Username: </label>
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
                Register
              </button>
              {error && <p>An error has occured. Please try again</p>}
            </div>
          </form>
        </div>
      </header>
    </div>
  );
}

export default RegisterPage;
