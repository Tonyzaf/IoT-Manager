import React from 'react'
import { DropdownButton } from 'react-bootstrap'
import { useAuth0 } from '@auth0/auth0-react';

const Dropdown = () => {

    const { loginWithRedirect, isAuthenticated } = useAuth0();

    return (
        isAuthenticated && (
            <DropdownButton id="Dropdown" title="Dropdown" class = "Dropdown" >
            <Dropdown.Item>Action</Dropdown.Item>
            <Dropdown.Item>Another action</Dropdown.Item>
            <Dropdown.Item>Something else</Dropdown.Item>
          </DropdownButton>
        )
    )
}

export default Dropdown
