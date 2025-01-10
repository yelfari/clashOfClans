// ==========================================================
// --- Global Variables ---
// ==========================================================

let clanWarData;
const playerDataByWar = {};
let loggedInUser = null; // Removed localStorage

// ==========================================================
// --- Functions for Managing Player Data ---
// ==========================================================

function updateWarParticipantData(playerName = "default", warDate, townHallLevel = 1) {
    if (!playerDataByWar[warDate]) {
        playerDataByWar[warDate] = {};
    }
    if (!(playerName in playerDataByWar[warDate])) {
        playerDataByWar[warDate][playerName] = {
            townHallLevel: townHallLevel,
            reachedStars: 0,
            maxStars: 0,
            attacks: [false, false],
            participatedWars: 0,
        };
    } else {
        playerDataByWar[warDate][playerName].participatedWars++;
    }

    const playerParticipantListBody = document.querySelector('.playerParticipant-list tbody');
    if (!playerParticipantListBody) {
        console.error("Could not find the .playerParticipant-list tbody element");
        return;
    }

    const existingRow = playerParticipantListBody.querySelector(`tr[data-player="${playerName}"]`);
    if (existingRow) {
        const warParticipatedDisplay = existingRow.querySelector('.numberWarParticipated-display');
        if (!warParticipatedDisplay) {
            console.error("Could not find the .numberWarParticipated-display element");
            return;
        }
        warParticipatedDisplay.textContent = playerDataByWar[warDate][playerName].participatedWars;

        const reachedNumberStarsDisplay = existingRow.querySelector(`.reachedNumberStars-display[data-player="${playerName}"]`);
        if (reachedNumberStarsDisplay) {
            reachedNumberStarsDisplay.textContent = playerDataByWar[warDate][playerName].reachedStars;
        }

        const maxNumberStarsDisplay = existingRow.querySelector(`.maxNumberStars-display[data-player="${playerName}"]`);
        if (maxNumberStarsDisplay) {
            maxNumberStarsDisplay.textContent = playerDataByWar[warDate][playerName].participatedWars * 6;
        }
        updateDeleteButtonVisibility();


    } else {
        const newRow = playerParticipantListBody.insertRow();
        newRow.setAttribute('data-player', playerName);
        newRow.classList.add('player-row');
        newRow.innerHTML = `
            <td>
                <div style="position:relative;display:inline-block">
                    <img src="TownHallAssets/TownHall${playerDataByWar[warDate][playerName].townHallLevel}.jpg" width="35" height="35">
                    <div class="delete-player-overlay ${loggedInUser ? '' : 'hidden'}">X</div>
                </div>
            </td>
            <td>${playerName}</td>
            <td><div class="reachedNumberStars-display" data-player="${playerName}">${playerDataByWar[warDate][playerName].reachedStars}</div></td>
            <td><div class="maxNumberStars-display" data-player="${playerName}">${playerDataByWar[warDate][playerName].participatedWars * 6}</div></td>
            <td><div class="numberWarParticipated-display">${playerDataByWar[warDate][playerName].participatedWars}</div></td>
        `;
         const deleteOverlay = newRow.querySelector('.delete-player-overlay');
         if (deleteOverlay) {
             if (!loggedInUser) {
                deleteOverlay.style.pointerEvents = 'none';
              } else {
                  deleteOverlay.style.pointerEvents = 'auto'
                  deleteOverlay.addEventListener('click', function () {
                    if (confirm(`Soll der Spieler ${playerName} wirklich gelöscht werden?`)) {
                        delete playerDataByWar[warDate][playerName];
                        newRow.remove();
                        console.log(playerDataByWar);
                    }
                 });
               }
        }
    }
}

// ==========================================================
// --- Functions for Fetching and Displaying API Data ---
// ==========================================================

async function fetchClanWarData() {
    try {
        const response = await fetch('/clanwar', {
          credentials: 'include' // important: Allows sending of cookies
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const clanWarData = await response.json();
        if (clanWarData.state === 'notInWar') {
            return;
        } else {
            await populateWarTableFromApiData(clanWarData);
        }
    } catch (error) {
        console.error("Error fetching clan war data:", error);
    }
}

async function populateWarTableFromApiData(clanWarDataa) {
    if (!clanWarDataa || !clanWarDataa.clan || !clanWarDataa.clan.members) {
        console.error("Invalid API data or data missing.");
        return;
    }
    const warList = document.getElementById('warList');
    if (!warList) {
        console.error("Could not find warList Element");
        return;
    }

    const newWarEntry = document.createElement('div');
    newWarEntry.classList.add('war-entry');
    newWarEntry.classList.add('collapsed');
    newWarEntry.innerHTML = `
        <h2>
            <span>Klankrieg </span>
            <button class="delete-war-button">Löschen</button>
        </h2>
        <table class="player-list">
            <thead>
                <tr>
                    <th>Spieler</th>
                    <th>Angriff 1</th>
                    <th>Angriff 2</th>
                    <th>Sterne</th>
                    <th>Angriffszeit</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    warList.appendChild(newWarEntry);

    const deleteButton = newWarEntry.querySelector('.delete-war-button');
    deleteButton.addEventListener('click', () => {
        if (confirm('Soll dieser Kriegseintrag wirklich gelöscht werden?')) {
            newWarEntry.remove();
        }
    });

    const warEntryHeader = newWarEntry.querySelector('h2');
    warEntryHeader.addEventListener('click', () => {
        newWarEntry.classList.toggle('collapsed');
    });

    for (const member of clanWarDataa.clan.members) {
        const playerName = member.name;

        if (!playerDataByWar[clanWarDataa.startTime.slice(0, 10)]) {
            playerDataByWar[clanWarDataa.startTime.slice(0, 10)] = {};
        }
        if (!(playerName in playerDataByWar[clanWarDataa.startTime.slice(0, 10)])) {
            updateWarParticipantData(playerName, clanWarDataa.startTime.slice(0, 10));
        }

        const playerListBody = newWarEntry.querySelector('.player-list tbody');
        if (!playerListBody) {
            console.error("Could not find the .player-list tbody element");
            return;
        }

        const newRow = playerListBody.insertRow();
        newRow.innerHTML = `
            <td>${playerName}</td>
            <td><input type="checkbox" ${member.attacks.length > 0 ? 'checked' : ''}></td>
            <td><input type="checkbox" ${member.attacks.length > 1 ? 'checked' : ''}></td>
            <td>
                <select class="sternSelector" name="sternSelector">
                    <option value="0" ${member.attacks.length == 0 ? 'selected' : ''}>0</option>
                    <option value="1" ${member.attacks.length >= 1 && member.attacks[0].stars == 1 ? 'selected' : ''}>1</option>
                    <option value="2" ${member.attacks.length >= 1 && member.attacks[0].stars == 2 ? 'selected' : ''}>2</option>
                    <option value="3" ${member.attacks.length >= 1 && member.attacks[0].stars == 3 ? 'selected' : ''}>3</option>
                    <option value="4" ${member.attacks.length == 2 && member.attacks[1].stars == 1 ? 'selected' : ''}>4</option>
                    <option value="5" ${member.attacks.length == 2 && member.attacks[1].stars == 2 ? 'selected' : ''}>5</option>
                    <option value="6" ${member.attacks.length == 2 && member.attacks[1].stars == 3 ? 'selected' : ''}>6</option>
                </select>
            </td>
            <td>
                <select id="angriffszeit" name="angriffszeit">
                    <option value="k.A">k.A</option>
                    <option value="früh">früh</option>
                    <option value="mittel">mittel</option>
                    <option value="spät">spät</option>
                </select>
            </td>
        `;
    }
}

async function loadAndPrintJson(fileName) {
    let clanWarData;
    try {
        const response = await fetch(`./clanWarData/${fileName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText} for file: ${fileName}`);
        }
        clanWarData = await response.json();
        if (!clanWarData) {
            throw new Error(`The JSON object does not contain valid data in file: ${fileName}`);
        }
    } catch (error) {
        console.error('Error loading or parsing JSON:', error);
        return;
    }

    if (!clanWarData) {
        console.error("Failed to retrieve ClanWarData, can not continue.");
        return;
    }

    const warList = document.getElementById('warList');
    if (!warList) {
        console.error("Could not find warList Element");
        return;
    }

    const newWarEntry = document.createElement('div');
    newWarEntry.classList.add('war-entry');
    newWarEntry.classList.add('collapsed');
    newWarEntry.innerHTML = `
        <h2>
            <span>Klankrieg </span>
            <span>${clanWarData.startTime.slice(0, 10)} </span>
            <span>${clanWarData.state} </span>
            <button class="delete-war-button">Löschen</button>
        </h2>
        <table class="player-list">
            <thead>
                <tr>
                    <th>Spieler</th>
                    <th>Angriff 1</th>
                    <th>Angriff 2</th>
                    <th>Sterne</th>
                     <th>Angriffszeit</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    warList.appendChild(newWarEntry);

    const deleteButton = newWarEntry.querySelector('.delete-war-button');
    deleteButton.addEventListener('click', () => {
        if (confirm('Soll dieser Kriegseintrag wirklich gelöscht werden?')) {
            newWarEntry.remove();
        }
    });

    const warEntryHeader = newWarEntry.querySelector('h2');
    warEntryHeader.addEventListener('click', () => {
        newWarEntry.classList.toggle('collapsed');
    });

    for (const member of clanWarData.clan.members) {
        const playerName = member.name;

        if (!playerDataByWar[clanWarData.startTime.slice(0, 10)]) {
            playerDataByWar[clanWarData.startTime.slice(0, 10)] = {};
        }
        if (!(playerName in playerDataByWar[clanWarData.startTime.slice(0, 10)])) {
            updateWarParticipantData(playerName, clanWarData.startTime.slice(0, 10), member.townHallLevel);
        }

        const playerListBody = newWarEntry.querySelector('.player-list tbody');
        if (!playerListBody) {
            console.error("Could not find the .player-list tbody element");
            return;
        }

        const newRow = playerListBody.insertRow();
        newRow.innerHTML = `
            <td>${playerName}</td>
            <td><input type="checkbox" ${member.attacks.length > 0 ? 'checked' : ''}></td>
            <td><input type="checkbox" ${member.attacks.length > 1 ? 'checked' : ''}></td>
            <td>
                <select class="sternSelector" name="sternSelector">
                    <option value="0" ${member.attacks.length == 0 ? 'selected' : ''}>0</option>
                    <option value="1" ${member.attacks.length >= 1 && member.attacks[0].stars == 1 ? 'selected' : ''}>1</option>
                    <option value="2" ${member.attacks.length >= 1 && member.attacks[0].stars == 2 ? 'selected' : ''}>2</option>
                    <option value="3" ${member.attacks.length >= 1 && member.attacks[0].stars == 3 ? 'selected' : ''}>3</option>
                    <option value="4" ${member.attacks.length == 2 && member.attacks[1].stars == 1 ? 'selected' : ''}>4</option>
                    <option value="5" ${member.attacks.length == 2 && member.attacks[1].stars == 2 ? 'selected' : ''}>5</option>
                     <option value="6" ${member.attacks.length == 2 && member.attacks[1].stars == 3 ? 'selected' : ''}>6</option>
                </select>
            </td>
            <td>
                <select id="angriffszeit" name="angriffszeit">
                    <option value="k.A">k.A</option>
                    <option value="früh">früh</option>
                    <option value="mittel">mittel</option>
                    <option value="spät">spät</option>
                </select>
            </td>
        `;
        playerDataByWar[clanWarData.startTime.slice(0, 10)][member.name].reachedStars += (member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0);
        updateWarParticipantData(member.name, clanWarData.startTime.slice(0, 10), member.townHallLevel);
    }
}

const fileNames = [
    "2024-12-31.json",
    "2024-13-31.json"
];

async function processAllJsonFiles() {
    for (const fileName of fileNames) {
        await loadAndPrintJson(fileName);
    }
}

function updateDeleteButtonVisibility() {
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

async function checkLoginStatus() {
    try {
      const response = await fetch('/checkLogin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.loggedIn === true) {
           loggedInUser = data.username;
          return true;
        } else {
           loggedInUser = null;
          return false;
        }
      } else {
          loggedInUser = null;
        console.error(`HTTP error! status: ${response.status}`);
        return false;
      }
    } catch (error) {
        loggedInUser = null;
      console.error('Error checking login status:', error);
      return false;
    }
  }


async function getLoginInformation(username, password) {
    try {
        const response = await fetch('/loginInformation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password }),
            credentials: 'include'
          });
  
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data["success"] === true) {
        return true
      }
      return false
  
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


// ==========================================================
// --- DOMContentLoaded Event Listener ---
// ==========================================================

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.querySelector('.login-header form');
    const navbar = document.querySelector('.navbar');
    const loginHeader = document.querySelector('.login-header');


    const isLoggedIn = await checkLoginStatus();
    if(isLoggedIn){
        loginHeader.style.display = 'none';
        const welcomeLogoutContainer = document.createElement('div');
        welcomeLogoutContainer.classList.add('welcome-logout-container')
        navbar.appendChild(welcomeLogoutContainer);

        // Create and display the welcome message
        const welcomeMessage = document.createElement('div');
        welcomeMessage.classList.add('welcome-message');
        welcomeMessage.textContent = `Willkommen, ${loggedInUser}!`;
        welcomeLogoutContainer.appendChild(welcomeMessage);

  
        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'Logout';
        logoutButton.classList.add('logout-button'); 
        welcomeLogoutContainer.appendChild(logoutButton);
        logoutButton.addEventListener('click', handleLogout);
        updateDeleteButtonVisibility();
    }


    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById('fname');
        const passwordInput = document.getElementById('lname');
        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
        const loginattempt = await getLoginInformation(username, password);

            if (loginattempt === true) {
                loggedInUser = username;
                loginHeader.style.display = 'none';


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
                logoutButton.addEventListener('click', handleLogout);
                updateDeleteButtonVisibility();
            } else {
                alert('Falsche Anmeldedaten.');
            }
        } catch (error) {
          console.error("Login failed", error);
          alert("An error occurred during login.");
        }
    });



    const playerContainer = document.getElementById('playerContainer');
    if (playerContainer) {
        playerContainer.addEventListener('click', function () {
            this.classList.toggle('open');
            this.scrollTop = 0;
        });
    } else {
        console.error('Could not find playerContainer element');
    }
    processAllJsonFiles();
    fetchClanWarData();
});

async function handleLogout(){
    try {
        const response = await fetch('/logout', {
          method: 'POST',
            credentials: 'include'
        });
  
        if (response.ok) {
            loggedInUser = null;
             window.location.reload();
          } else {
            console.error('Logout failed:', response.status);
            alert('Logout fehlgeschlagen');
          }
      } catch(error) {
        console.error('Error during logout:', error);
        alert('Logout fehlgeschlagen');
      }
}