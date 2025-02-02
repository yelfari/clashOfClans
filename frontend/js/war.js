import { updateWarParticipantData } from './player.js';
import { fetchClanWarData } from './api.js';
let playerDataByWar = {};

export async function loadAndPrintJson(fileName) {
    let clanWarData;
    let clanWarResult = 0;
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
    console.log("warentry created")
    newWarEntry.classList.add('collapsed');
    newWarEntry.innerHTML = `
        <h2>
            <span>Klankrieg </span>
            <span>${clanWarData.clan.stars}-${clanWarData.opponent.stars} </span>
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

    // Determine the war result based on stars and destruction
    const h2Entry = newWarEntry.querySelector("h2")
    h2Entry.style.display = "flexbox"
    if (clanWarData.clan.stars > clanWarData.opponent.stars || 
        (clanWarData.clan.stars === clanWarData.opponent.stars && clanWarData.clan.destruction > clanWarData.opponent.destruction)) {
        clanWarResult = 1;
        h2Entry.style.backgroundColor = '#99e599'; // Victory
    } else if (clanWarData.clan.stars < clanWarData.opponent.stars || 
            (clanWarData.clan.stars === clanWarData.opponent.stars && clanWarData.clan.destruction < clanWarData.opponent.destruction)) {
        clanWarResult = 2;
        h2Entry.style.backgroundColor = '#ffcccb'; // Loss
    }


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

    await Promise.all(clanWarData.clan.members.map(async member => {
        const playerName = member.name;
        const warDate = clanWarData.startTime.slice(0, 10);
        const townHallLevel = member.townHallLevel;
        const reachedStars = (member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0);


        if (!playerDataByWar[warDate]) {
            playerDataByWar[warDate] = {};
        }

        if (!(playerName in playerDataByWar[warDate])) {
            // Initialize reachedStars to 0 when adding new player
            playerDataByWar[warDate][playerName] = { reachedStars: 0 };
             
        }
           playerDataByWar[warDate][playerName].reachedStars += reachedStars
          //await updateWarParticipantData(playerName, warDate, townHallLevel, reachedStars);

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
                    <option value="0" ${member.attacks.length === 0 || ((member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0)) === 0  ? 'selected' : ''}>0</option>
                    <option value="1" ${((member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0)) === 1 ? 'selected' : ''}>1</option>
                    <option value="2" ${((member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0)) === 2 ? 'selected' : ''}>2</option>
                    <option value="3" ${((member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0)) === 3 ? 'selected' : ''}>3</option>
                    <option value="4" ${((member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0)) === 4 ? 'selected' : ''}>4</option>
                    <option value="5" ${((member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0)) === 5 ? 'selected' : ''}>5</option>
                     <option value="6" ${((member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0)) === 6 ? 'selected' : ''}>6</option>
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
        updateWarParticipantData(member.name, clanWarData.startTime.slice(0, 10), member.townHallLevel,(member.attacks?.[0]?.stars || 0) + (member.attacks?.[1]?.stars || 0));
    }));

    console.log(playerDataByWar);
}

export async function populateWarTableFromApiData(clanWarData) {

}