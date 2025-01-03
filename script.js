// ==========================================================
// --- Global Variables ---
// ==========================================================

let clanWarData; // Stores clan war data fetched from the API.
const playerDataByWar = {}; // Stores player-specific data, organized by war date and player name.

// ==========================================================
// --- Functions for Managing Player Data ---
// ==========================================================

/**
 * Updates or adds a player's data to the playerDataByWar dictionary.
 * Also updates the player's display in the 'playerParticipant-list' table.
 * @param {string} playerName The name of the player.
 * @param {string} warDate The date of the war.
 */
function updateWarParticipantData(playerName = "default", warDate, townHallLevel = 1) {
    // Initialize player entry if it doesn't exist for this war date.
        // Initialize war entry if it doesn't exist.
        if (!playerDataByWar[warDate]) {
            playerDataByWar[warDate] = {};
        }
        // Initialize player entry if it doesn't exist for this war date.
        if (!(playerName in playerDataByWar[warDate])) {
            playerDataByWar[warDate][playerName] = {
                townHallLevel: townHallLevel,
                reachedStars: 0,    // Total stars earned by the player in this war
                maxStars: 0,        // Maximum possible stars for the player in this war
                attacks: [false, false],        // Number of attacks made
                participatedWars: 0, // Count of wars this player has participated in.
            };
        } else {
            playerDataByWar[warDate][playerName].participatedWars++;
        }

    // Access the table body for our player participant list
    const playerParticipantListBody = document.querySelector('.playerParticipant-list tbody');
    if(!playerParticipantListBody)
    {
        console.error("Could not find the .playerParticipant-list tbody element")
        return;
    }
     // Check if a row already exists for the player in the table
    const existingRow = playerParticipantListBody.querySelector(`tr[data-player="${playerName}"]`);
    if (existingRow) {
         // If a row exists, update the displayed data for this player
        const warParticipatedDisplay = existingRow.querySelector('.numberWarParticipated-display');
        if(!warParticipatedDisplay){
            console.error("Could not find the .numberWarParticipated-display element");
            return;
        }
        // Increment wars participated and update display
        warParticipatedDisplay.textContent = playerDataByWar[warDate][playerName].participatedWars;
        // Update the reached stars
         const reachedNumberStarsDisplay = existingRow.querySelector(`.reachedNumberStars-display[data-player="${playerName}"]`);
        if (reachedNumberStarsDisplay) {
           reachedNumberStarsDisplay.textContent = playerDataByWar[warDate][playerName].reachedStars;
        }
           // Update the max stars
         const maxNumberStarsDisplay = existingRow.querySelector(`.maxNumberStars-display[data-player="${playerName}"]`);
        if (maxNumberStarsDisplay) {
            maxNumberStarsDisplay.textContent = playerDataByWar[warDate][playerName].participatedWars * 6;
        }

    } else {
        // If no row exists for this player, create a new one.
        const newRow = playerParticipantListBody.insertRow(); // Create row element
        newRow.setAttribute('data-player', playerName); // Store player name as a data attribute
        newRow.classList.add('player-row')
        newRow.innerHTML = ` 
            <td>
                <div style="position:relative;display:inline-block">
                <img src="TownHall Assets/TownHall${playerDataByWar[warDate][playerName].townHallLevel}.jpg" width="35" height="35">
                <div class="delete-player-overlay">X</div>
            </div>
            </td>
            <td>${playerName}</td>
            <td><div class="reachedNumberStars-display" data-player="${playerName}">${playerDataByWar[warDate][playerName].reachedStars}</div></td>
            <td><div class="maxNumberStars-display" data-player="${playerName}">${playerDataByWar[warDate][playerName].participatedWars * 6}</div></td>
            <td><div class="numberWarParticipated-display">${playerDataByWar[warDate][playerName].participatedWars}</div></td>
        `; // Insert row with all relevant player data
        //Event listener
        const deleteOverlay = newRow.querySelector('.delete-player-overlay');
         deleteOverlay.addEventListener('click', function () {
           if (confirm(`Soll der Spieler ${playerName} wirklich gelöscht werden?`)) {
                 // Delete from data
                delete playerDataByWar[warDate][playerName];
                 // Delete from table
                 newRow.remove();
                 console.log(playerDataByWar)
            }
         })
    }

    //console.log("Updated Player Data:", playerDataByWar); // Log for debugging.
}

// ==========================================================
// --- Functions for Fetching and Displaying API Data ---
// ==========================================================

/**
 * Fetches clan war data from the backend API.
 */
async function fetchClanWarData() {
    try {
        const response = await fetch('http://localhost:3000/clanwar'); 
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


/**
 * Populates the main war table with data from the API.
 */
async function populateWarTableFromApiData(clanWarDataa) {

    if (!clanWarDataa || !clanWarDataa.clan || !clanWarDataa.clan.members) {
        console.error("Invalid API data or data missing.");
        return;
    }
    const warList = document.getElementById('warList');
    if(!warList){
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

         if (!playerDataByWar[clanWarDataa.startTime.slice(0,10)]) {
              playerDataByWar[clanWarDataa.startTime.slice(0,10)] = {};
            }

        if (!(playerName in playerDataByWar[clanWarDataa.startTime.slice(0,10)])){
            updateWarParticipantData(playerName, clanWarDataa.startTime.slice(0,10));
        }

        const playerListBody = newWarEntry.querySelector('.player-list tbody'); 
        if(!playerListBody){
            console.error("Could not find the .player-list tbody element");
            return;
        }

        const newRow = playerListBody.insertRow();
        newRow.innerHTML = `
            <td>${playerName}</td>
            <td><input type="checkbox" ${member.attacks.length > 0 ? 'checked' : ''}></td>
            <td><input type="checkbox" ${member.attacks.length > 1 ? 'checked' : ''}></td>
            <td>
                <select class="sternSelector" name = "sternSelector">
                    <option value = "0" ${member.attacks.length == 0 ? 'selected' : ''}>0</option>
                    <option value = "1" ${member.attacks.length >= 1 && member.attacks[0].stars == 1 ? 'selected' : ''}>1</option>
                    <option value = "2" ${member.attacks.length >= 1 && member.attacks[0].stars == 2 ? 'selected' : ''}>2</option>
                    <option value = "3" ${member.attacks.length >= 1 && member.attacks[0].stars == 3 ? 'selected' : ''}>3</option>
                    <option value = "4" ${member.attacks.length == 2 && member.attacks[1].stars == 1 ? 'selected' : ''}>4</option>
                    <option value = "5" ${member.attacks.length == 2 && member.attacks[1].stars == 2 ? 'selected' : ''}>5</option>
                    <option value = "6" ${member.attacks.length == 2 && member.attacks[1].stars == 3 ? 'selected' : ''}>6</option>
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
        const response = await fetch(`./ClanWarData/${fileName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText} for file: ${fileName}`);
        }
        clanWarData = await response.json();
        if (!clanWarData){
          throw new Error(`The JSON object does not contain valid data in file: ${fileName}`);
         }
    } catch (error) {
        console.error('Error loading or parsing JSON:', error);
        return;
    }

    // Check if the data was loaded correctly.
    if(!clanWarData){
       console.error("Failed to retrieve ClanWarData, can not continue.");
       return;
    }

      // Get the war list element
      const warList = document.getElementById('warList');
      if(!warList){
        console.error("Could not find warList Element");
        return;
      }
  
      // Create a new war entry element.
      const newWarEntry = document.createElement('div');
      newWarEntry.classList.add('war-entry');
      newWarEntry.classList.add('collapsed');
      newWarEntry.innerHTML = `
          <h2>
              <span>Klankrieg </span>
              <span>${clanWarData.startTime.slice(0,10)} </span>
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
  
      // Delete button functionality
      const deleteButton = newWarEntry.querySelector('.delete-war-button');
      deleteButton.addEventListener('click', () => {
          if (confirm('Soll dieser Kriegseintrag wirklich gelöscht werden?')) {
              newWarEntry.remove();
          }
      });
  
        // Toggle collapsed state on click
      const warEntryHeader = newWarEntry.querySelector('h2');
      warEntryHeader.addEventListener('click', () => {
          newWarEntry.classList.toggle('collapsed');
      });


      for (const member of clanWarData.clan.members) {
          const playerName = member.name;

           if (!playerDataByWar[clanWarData.startTime.slice(0,10)]) {
                playerDataByWar[clanWarData.startTime.slice(0,10)] = {};
              }

          if (!(playerName in playerDataByWar[clanWarData.startTime.slice(0,10)])){
              updateWarParticipantData(playerName, clanWarData.startTime.slice(0,10), member.townHallLevel);
          }
  
          const playerListBody = newWarEntry.querySelector('.player-list tbody'); // Get the table body for our player
          if(!playerListBody){
              console.error("Could not find the .player-list tbody element");
              return;
          }
  
          const newRow = playerListBody.insertRow();// Create table row
          newRow.innerHTML = `
              <td>${playerName}</td>
              <td><input type="checkbox" ${member.attacks.length > 0 ? 'checked' : ''}></td>
              <td><input type="checkbox" ${member.attacks.length > 1 ? 'checked' : ''}></td>
              <td>
                  <select class="sternSelector" name = "sternSelector">
                      <option value = "0" ${member.attacks.length == 0 ? 'selected' : ''}>0</option>
                      <option value = "1" ${member.attacks.length >= 1 && member.attacks[0].stars == 1 ? 'selected' : ''}>1</option>
                      <option value = "2" ${member.attacks.length >= 1 && member.attacks[0].stars == 2 ? 'selected' : ''}>2</option>
                      <option value = "3" ${member.attacks.length >= 1 && member.attacks[0].stars == 3 ? 'selected' : ''}>3</option>
                      <option value = "4" ${member.attacks.length == 2 && member.attacks[1].stars == 1 ? 'selected' : ''}>4</option>
                      <option value = "5" ${member.attacks.length == 2 && member.attacks[1].stars == 2 ? 'selected' : ''}>5</option>
                      <option value = "6" ${member.attacks.length == 2 && member.attacks[1].stars == 3 ? 'selected' : ''}>6</option>
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
        playerDataByWar[clanWarData.startTime.slice(0,10)][member.name].reachedStars += (member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0);
        updateWarParticipantData(member.name,clanWarData.startTime.slice(0,10), member.townHallLevel);
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

// ==========================================================
// --- DOMContentLoaded Event Listener ---
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    const playerContainer = document.getElementById('playerContainer');

    if(playerContainer){
        playerContainer.addEventListener('click', function () {
            this.classList.toggle('open');
            this.scrollTop = 0;
        });
    } else {
        console.error('Could not find playerContainer element');
    }
     // Fetch data when page is loaded
    processAllJsonFiles();
    fetchClanWarData();
});