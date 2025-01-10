import { fetchClanWarData } from './api.js';
import { initAuth, attemptLogin } from './auth.js';
import { fileNames } from './config.js';
import { loadAndPrintJson } from './war.js';
import { populateWarTableFromApiData } from './war.js';


document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.querySelector('.login-header form');
    const navbar = document.querySelector('.navbar');
    const loginHeader = document.querySelector('.login-header');

    await initAuth(navbar, loginHeader);
    attemptLogin(loginForm, navbar, loginHeader);
    

    const playerContainer = document.getElementById('playerContainer');
    if (playerContainer) {
        playerContainer.addEventListener('click', function () {
            this.classList.toggle('open');
            this.scrollTop = 0;
        });
    } else {
        console.error('Could not find playerContainer element');
    }

    async function processAllJsonFiles() {
        for (const fileName of fileNames) {
            await loadAndPrintJson(fileName);
        }
    }
    processAllJsonFiles();
    
    try {
         const clanWarData = await fetchClanWarData()
            if (clanWarData.state === 'notInWar') {
               return
           } else {
               await populateWarTableFromApiData(clanWarData);
           }
    } catch(e) {
        console.error(e)
    }
});