const express = require('express');
const { Client } = require('clashofclans.js');
const cors = require('cors');
const fs = require('fs');
const path = require('path'); // Import path module

const app = express();
app.use(cors());
const port = 80; // Changed to port 80

const client = new Client({
    keys: [
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjQ0YjEzOGRiLWRhMDAtNGNjYy1iYjRiLWE2ZmQ5N2M0ZDU3MyIsImlhdCI6MTczNTkyNzI5Nywic3ViIjoiZGV2ZWxvcGVyLzk5M2Y2NTI2LTY0NjgtNjE2OS1iMWI0LWQ3Zjk2OTcxODljNyIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjE4OC4yNDUuMTg5LjE4MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.-1Sis3D_umEwtjCXsvmtGS5t2E_prtQa7rnoeCnQG-rKK3FmvgCJbi3UOo-fX7dw36CNukYYgM-r1K-gcd-lpQ',
    ],
});

let datasaved = false;
// Serve static files from the same directory as server.js
app.use(express.static(path.join(__dirname)));


// Serve static files from the 'TownHall Assets' folder.
app.use('/TownHall Assets', express.static(path.join(__dirname, 'TownHall Assets')));

// Serve static files from the 'Background' folder.
app.use('/Background', express.static(path.join(__dirname, 'Background')));
// Serve static files from the 'ClanWarData' folder.
app.use('/ClanWarData', express.static(path.join(__dirname, 'ClanWarData')));

// Serve index.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// API Endpoint
app.get('/clanwar', async (req, res) => {
    try {
        // Fetch the clan war data
        const clanWar = await client.getClanWar('#2QCQVVQG2');
        // Save the fetched data to a JSON file
        if(datasaved == false){ //clanWar.status == 'warEnded'
            const jsonString = JSON.stringify(clanWar, null, 2); // Pretty-print JSON with indentation
            fs.writeFileSync('clanWarData.json', jsonString, 'utf8');  // Save to 'clanWarData.json'
            console.log('Clan war data saved to clanWarData.json');
            datasaved = true;
        }

        res.json(clanWar);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});


// Start the server
const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Error handling for the server
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Try a different port.`);
    } else {
      console.error(`An unexpected error occurred:`, error);
    }
  });