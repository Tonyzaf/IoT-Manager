import React from 'react'
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();

    return (
        !isAuthenticated && (

            <>
            <div class = "Welcome">
                <h2>Καλωσήρθατε στον IoT-Manager</h2>
            </div>
            <div class="container">
                    <div class="center">
                        <button class="btn" onClick={() => loginWithRedirect()}>
                            <svg width="180px" height="60px" viewBox="0 0 180 60" class="border">
                                <polyline points="179,1 179,59 1,59 1,1 179,1" class="bg-line" />
                                <polyline points="179,1 179,59 1,59 1,1 179,1" class="hl-line" />
                            </svg>
                            <span>ΣΥΝΔΕΘΕΙΤΕ ΕΔΩ</span>
                        </button>
                    </div>
                </div>
            </>
        )
    )
}

export default LoginButton
