import React, { useState } from "react";
import "./navbar.css";
import { clearSession } from "@/utilities/user";

function NavBar() {
  const openAddDeviceFlow = () => {
    const url = "/addDeviceLanding";
    const width = 800;
    const height = 600;

    // Calculate the center of the screen for positioning the window
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    // Use window.open to open a new window with custom dimensions and centered position
    window.open(
      url,
      "_blank",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">Home</li>
        <li className="navbar-item" onClick={openAddDeviceFlow}>
          Add Device
        </li>
        <li className="navbar-item" onClick={clearSession}>
          Logout
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
