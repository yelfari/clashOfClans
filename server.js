const express = require('express');
const { Client } = require('clashofclans.js');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
const port = 80; 

const client = new Client({
    keys: [
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjQ0YjEzOGRiLWRhMDAtNGNjYy1iYjRiLWE2ZmQ5N2M0ZDU3MyIsImlhdCI6MTczNTkyNzI5Nywic3ViIjoiZGV2ZWxvcGVyLzk5M2Y2NTI2LTY0NjgtNjE2OS1iMWI0LWQ3Zjk2OTcxODljNyIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjE4OC4yNDUuMTg5LjE4MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.-1Sis3D_umEwtjCXsvmtGS5t2E_prtQa7rnoeCnQG-rKK3FmvgCJbi3UOo-fX7dw36CNukYYgM-r1K-gcd-lpQ',
    ],
});

let datasaved = false;

app.use(express.static(path.join(__dirname)));



app.use('/TownHall Assets', express.static(path.join(__dirname, 'TownHall Assets')));


app.use('/Background', express.static(path.join(__dirname, 'Background')));

app.use('/ClanWarData', express.static(path.join(__dirname, 'clanWarData')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// API Endpoint
app.get('/clanwar', async (req, res) => {
    try {

        const clanWar = await client.getClanWar('#2QCQVVQG2');

        if(datasaved == false){ //clanWar.status == 'warEnded'
            const jsonString = JSON.stringify(clanWar, null, 2);
            fs.writeFileSync('clanWarData.json', jsonString, 'utf8'); 
            console.log('Clan war data saved to clanWarData.json');
            datasaved = true;
        }

        res.json(clanWar);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});



const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Try a different port.`);
    } else {
      console.error(`An unexpected error occurred:`, error);
    }
  });