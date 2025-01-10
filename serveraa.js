const express = require('express');
const { Client } = require('clashofclans.js');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
app.use(cors({
    origin: 'http://localhost:5500', // Allow requests from your client URL
    credentials: true // Allow cookies to be sent
}));

app.use(bodyParser.json());
app.use(cookieParser());
const port = 3000;

const client = new Client({
    keys: [
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjQ0YjEzOGRiLWRhMDAtNGNjYy1iYjRiLWE2ZmQ5N2M0ZDU3MyIsImlhdCI6MTczNTkyNzI5Nywic3ViIjoiZGV2ZWxvcGVyLzk5M2Y2NTI2LTY0NjgtNjE2OS1iMWI0LWQ3Zjk2OTcxODljNyIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjE4OC4yNDUuMTg5LjE4MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.-1Sis3D_umEwtjCXsvmtGS5t2E_prtQa7rnoeCnQG-rKK3FmvgCJbi3UOo-fX7dw36CNukYYgM-r1K-gcd-lpQ',
    ],
});
let datasaved = false;
// app.use(express.static(path.join(__dirname))); //remove this
app.use('/TownHallAssets', express.static(path.join(__dirname, 'TownHallAssets')));
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

const sessions = {}; //In memory session storage

function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

function createSession(username) {
    const sessionID = generateSessionId();
    sessions[sessionID] = {
        username: username,
        timestamp: Date.now()
    };
    return sessionID;
}

function removeSession(sessionID) {
   delete sessions[sessionID];
}

function isValidSession(sessionID) {
    if(sessions[sessionID]){
      return true;
    } else {
      return false;
    }
}

function getUsername(sessionID) {
   return sessions[sessionID]?.username;
}

const adminUsers = {
  "jaglonger": "bra",
  "Freund": "Freund",
  "nurexx": "nurexx"
};

app.post('/loginInformation', (req, res) => {
    const { username, password } = req.body;
     if (adminUsers[username] && adminUsers[username] === password) {
        const sessionID = createSession(username);

        res.cookie('sessionID', sessionID, {
          httpOnly: true,
          secure: false,  //auf true setzen wenn auf https
          sameSite: 'strict'
        });
        res.json({ success: true, message: 'Logged in successfully' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/checkLogin', (req, res) => {
    const sessionID = req.cookies.sessionID;
    if(sessionID && isValidSession(sessionID)){
        const username = getUsername(sessionID);
        res.json({loggedIn: true, username: username})
    } else {
        res.json({loggedIn: false})
    }
})

app.post('/logout', (req, res) => {
  const sessionID = req.cookies.sessionID;
    if(sessionID){
      removeSession(sessionID)
      res.clearCookie('sessionID');
      res.json({success: true})
    } else {
      res.status(401).json({ success: false, message: 'Not logged in' })
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