// auth.js

import { checkLoginStatus, getLoginInformation, handleLogout } from './api.js';
import { updateDeleteButtonVisibility, renderWelcomeLogoutContainer, hideLoginHeader } from "./dom.js";


let loggedInUser = null;

export async function initAuth(navbar, loginHeader) {
    try {
        const loginStatus = await checkLoginStatus();
        if(loginStatus && loginStatus.loggedIn === true && loginStatus.username) {
            loggedInUser = loginStatus.username
            hideLoginHeader(loginHeader);
            renderWelcomeLogoutContainer(navbar, loggedInUser, handleLogoutEvent);
            updateDeleteButtonVisibility(loggedInUser)
        } else {
            loggedInUser = null
        }
    } catch (error) {
        console.error("Error checking login status:", error);
        loggedInUser = null
    }
}

export async function attemptLogin(loginForm, navbar, loginHeader) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const usernameInput = document.getElementById('fname');
        const passwordInput = document.getElementById('lname');
        const username = usernameInput.value;
        const password = passwordInput.value;
        if (!username || !password) {
            alert("Please enter a username and password.");
            return;
        }

        try {
        const loginattempt = await getLoginInformation(username, password);
            if (loginattempt.success === true) {
                 loggedInUser = username;
                 hideLoginHeader(loginHeader);
                 renderWelcomeLogoutContainer(navbar, loggedInUser, handleLogoutEvent);
                 updateDeleteButtonVisibility(loggedInUser);

            } else {
                alert('Falsche Anmeldedaten.');
            }
        } catch (error) {
          console.error("Login failed", error);
          alert("An error occurred during login.",error);
        }
    });
}


async function handleLogoutEvent() {
    try {
      await handleLogout();
      loggedInUser = null;
      window.location.reload();
    } catch (error) {
        console.error('Logout failed: ', error)
      alert('Logout fehlgeschlagesn');
    }
}

export function getLoggedInUser() {
    return loggedInUser
}