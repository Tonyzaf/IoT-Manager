import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import "./navbar.css";

function NavBar({ setResult }) {
  const { logout } = useAuth0();

  const CallEndpoint = async () => {
    console.log("called");
    try {
      const response = await axios.get("http://localhost:5000/verify_device");
      // Handle the response here
      console.log(response.data);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">Home</li>
        <li className="navbar-item" onClick={() => CallEndpoint()}>
          Add Device
        </li>
        <li className="navbar-item" onClick={logout}>
          Logout
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
