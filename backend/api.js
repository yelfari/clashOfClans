// backend/api.js

const { Client } = require('clashofclans.js');
const config = require('./config');

const client = new Client({
    keys: [ config.cocApiKey ],
});

async function fetchClanWarData() {
    try {
        const clanWar = await client.getClanWar(config.clanTag);
      return clanWar
    } catch (error) {
        console.error('Error fetching data from CoC API:', error);
        throw new Error('Failed to fetch clan war data');
    }
}
module.exports = { fetchClanWarData }