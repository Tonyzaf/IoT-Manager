import React, { useEffect, useState } from "react";
import NavBar from "@/components/Navbar/Navbar";
import Select from "react-select";
import PlayerControls from "@/components/PlayerControls/PlayerControls";
import DeleteIcon from "@/assets/DeleteIcon.png";

import "../styles/groups.css";
import { checkSession, getUserId } from "@/utilities/user";
import axios from "axios";
import Image from "next/image";

function DeviceGroups() {
  const [devices, setDevices] = useState([]);
  const [deviceGroups, setDeviceGroups] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const statusRegex = /\[(.*?)\]/;

  useEffect(() => {
    checkSession();
    getUserDevices();
    getUserGroups();
  }, []);

  const mergeDeviceGroups = (objects) => {
    const mergedObjects = {};

    objects.forEach((obj) => {
      const groupName = obj.groupName;

      if (!mergedObjects[groupName]) {
        mergedObjects[groupName] = { ...obj };
      } else {
        mergedObjects[groupName].devices = [
          ...mergedObjects[groupName].devices,
          ...obj.devices,
        ];
      }
    });

    return Object.values(mergedObjects);
  };

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

  const getUserGroups = async () => {
    console.log("called");
    const userId = getUserId();
    try {
      const response = await axios.get(
        `http://localhost:5000/getUserGroups?userId=${userId}`
      );
      setDeviceGroups(mergeDeviceGroups(response.data));
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

  const removeGroup = (groupName) => {
    axios
      .delete("http://localhost:5000/deleteDeviceGroup?groupName=" + groupName)
      .then((response) => {
        console.log(response);
        getUserGroups();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const removeDevice = (groupId) => {
    axios
      .delete("http://localhost:5000/removeDeviceFromGroup?groupId=" + groupId)
      .then((response) => {
        console.log(response);
        getUserGroups();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const createDeviceGroup = async () => {
    const deviceIds = selectedDevices?.map((device) => device.value);
    console.log(deviceIds);
    if (deviceIds.length > 0 && name) {
      for (const device of deviceIds) {
        try {
          const response = await axios.post(
            `http://localhost:5000/addToGroup`,
            {
              deviceId: device,
              groupName: name,
              userId: getUserId(),
            }
          );
          console.log(response?.data);
        } catch (error) {
          // Handle errors
          console.error(error);
        }
      }

      setName("");
      setDevices([]);
      setExpanded(false);
      getUserGroups();
    }
  };

  const DeviceGroupItem = (group) => {
    let expanded = false; // Call the hook unconditionally

    const toggleExpanded = () => {
      expanded = !expanded;
    };

    return (
      <>
        <div onClick={toggleExpanded} className="device-group-item">
          <h2>{group.groupName}</h2>
          <Image
            height={16}
            src={DeleteIcon}
            alt="Delete Icon"
            onClick={() => removeGroup(group.groupName)}
          />
        </div>
        <div className="device-group-devices">
          {group.devices.map((device) => {
            return (
              <div className="device-group-item-device">
                <h3>{device.deviceId}</h3>
                <p>{device.port}</p>
                <Image
                  onClick={() => removeDevice(device.groupId)}
                  height={16}
                  src={DeleteIcon}
                  alt="Delete Icon"
                />
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderDeviceGroups = () => {
    if (deviceGroups.length === 0) {
      return <p>No device groups found</p>;
    }

    return deviceGroups.map((group) => {
      return DeviceGroupItem(group);
    });
  };

  console.log(name);

  return (
    <div className="App">
      <NavBar /> {/* Render the NavBar component */}
      <header className="App-header">
        <h1>Manage Your Device Groups</h1>
      </header>
      <div className="device-list-container">{renderDeviceGroups()}</div>
      <div className="Create-Group-Widget">
        <h2 onClick={() => setExpanded(!expanded)}>Create a Device Group</h2>
        {expanded && (
          <>
            <p>Group Name</p>
            <input
              className="Group-Name-Input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></input>
            <Select
              className="Group-Name-Input"
              onChange={(values) => setSelectedDevices(values)}
              isMulti
              options={devices}
              placeholder="No Devices Selected..."
            />
            <button onClick={createDeviceGroup}>Create Group</button>
          </>
        )}
      </div>
    </div>
  );
}

export default DeviceGroups;
