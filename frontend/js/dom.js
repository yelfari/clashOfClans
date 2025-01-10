// dom.js

export function updateDeleteButtonVisibility(loggedInUser) {
    const deleteOverlays = document.querySelectorAll('.delete-player-overlay');
    deleteOverlays.forEach(overlay => {
        if (loggedInUser) {
            overlay.classList.remove('hidden');
           overlay.style.pointerEvents = 'auto';
        } else {
            overlay.classList.add('hidden');
            overlay.style.pointerEvents = 'none';
        }
    });
}

export function renderWelcomeLogoutContainer(navbar, username, logoutCallback){
    const welcomeLogoutContainer = document.createElement('div');
    welcomeLogoutContainer.classList.add('welcome-logout-container')
    navbar.appendChild(welcomeLogoutContainer);

    const welcomeMessage = document.createElement('div');
    welcomeMessage.classList.add('welcome-message');
    welcomeMessage.textContent = `Willkommen, ${username}!`;
    welcomeLogoutContainer.appendChild(welcomeMessage);

    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.classList.add('logout-button'); 
    welcomeLogoutContainer.appendChild(logoutButton);
    logoutButton.addEventListener('click', logoutCallback);
}


export function hideLoginHeader(loginHeader) {
    loginHeader.style.display = 'none';
}