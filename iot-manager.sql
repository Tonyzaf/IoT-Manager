CREATE DATABASE iot_mgr;
use iot_mgr;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT,
    username VARCHAR(255),
    password VARCHAR(255),
    PRIMARY KEY (user_id)
);

CREATE TABLE devices (
    id INT AUTO_INCREMENT,
    device_id VARCHAR(255),
    user_id INT,
    username VARCHAR(255),
    pass VARCHAR(255),
    port INT,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE deviceGroups (
    group_id INT AUTO_INCREMENT,
    groupName VARCHAR(255),
    device_id INT,
    user_id INT,
    PRIMARY KEY (group_id),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);