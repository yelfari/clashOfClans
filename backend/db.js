// backend/db.js

const fs = require('fs');
const path = require('path');

const clanWarDataPath = path.join(__dirname, 'clanWarData', 'clanWarData.json')

async function saveClanWarData(clanWarData) {
    try {
        const jsonString = JSON.stringify(clanWarData, null, 2);
        fs.writeFileSync(clanWarDataPath, jsonString, 'utf8');
        console.log('Clan war data saved to clanWarData.json');
    } catch (error) {
        console.error('Error saving clan war data:', error);
        throw error;
    }
}

async function readClanWarData(){
   try {
    const data = fs.readFileSync(clanWarDataPath, 'utf8')
    return JSON.parse(data)
    } catch(e) {
     console.log(e)
     return undefined
    }
}
module.exports = { saveClanWarData, readClanWarData };