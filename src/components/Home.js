import React from 'react'
import { useAuth0 } from '@auth0/auth0-react';

const {NodeSSH} = require('node-ssh')

const ssh = new NodeSSH()

ssh.connect({
    host: process.env.INT_IP,
    username: process.env.PIUSR,
    privateKey: process.env.PIPASS
  })

const Home = () => {

    const { user, logout, isAuthenticated } = useAuth0();

    return (
        isAuthenticated && (
            <div>
                <div class="Home">
                <button type="button" class="PlayButton" onclick="Play()">Play</button>
                <button type="button" class="SkipButton" onclick="Skip()">&#62;&#62;</button>
                <button type="button" class="PreviousButton" onclick="Previous()">&#60;&#60;</button>
                </div>
            </div>
        )
    )
}

export default Home
