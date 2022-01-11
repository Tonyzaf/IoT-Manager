import React from 'react'
import { useAuth0 } from '@auth0/auth0-react';

const Sidenav = () => {

    const { user, logout, isAuthenticated } = useAuth0();

    console.log('Navbar');

    return (
        isAuthenticated && (
        <div>
            <div class="sidenav">
            <img class = "profilepic" src = { user.picture } alt = { user.name } ></img>
            <a href="#">Home</a>
            <a href="#">Devices</a>
            <a href="#" class= "LogoutButton" onClick={() => logout()}>Logout</a>
            </div>
        </div>
        )
    )
}

export default Sidenav
