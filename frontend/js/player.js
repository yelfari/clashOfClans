// player.js

let playerDataByWar = {};
import { getLoggedInUser } from "./auth.js";
import { updateDeleteButtonVisibility } from "./dom.js";

export function updateWarParticipantData(playerName = "default", warDate, townHallLevel = 1, reachedStars) {
    if (!playerDataByWar[warDate]) {
        playerDataByWar[warDate] = {};
    }
    if (!(playerName in playerDataByWar[warDate])) {
        playerDataByWar[warDate][playerName] = {
            townHallLevel: townHallLevel,
            reachedStars: reachedStars,
            maxStars: 0,
            attacks: [false, false],
            participatedWars: 1,
        };
    } else {
        playerDataByWar[warDate][playerName].participatedWars++;
        playerDataByWar[warDate][playerName].reachedStars += reachedStars
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
        updateDeleteButtonVisibility(getLoggedInUser());
    } else {
        const newRow = playerParticipantListBody.insertRow();
        newRow.setAttribute('data-player', playerName);
        newRow.classList.add('player-row');
        newRow.innerHTML = `
            <td>
                <div style="position:relative;display:inline-block">
                    <img src="./TownHallAssets/TownHall${playerDataByWar[warDate][playerName].townHallLevel}.jpg" width="35" height="35">
                    <div class="delete-player-overlay ${getLoggedInUser() ? '' : 'hidden'}">X</div>
                </div>
            </td>
            <td>${playerName}</td>
            <td><div class="reachedNumberStars-display" data-player="${playerName}">${playerDataByWar[warDate][playerName].reachedStars}</div></td>
            <td><div class="maxNumberStars-display" data-player="${playerName}">${playerDataByWar[warDate][playerName].participatedWars * 6}</div></td>
            <td><div class="numberWarParticipated-display">${playerDataByWar[warDate][playerName].participatedWars}</div></td>
        `;
         const deleteOverlay = newRow.querySelector('.delete-player-overlay');
         if (deleteOverlay) {
             if (!getLoggedInUser()) {
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