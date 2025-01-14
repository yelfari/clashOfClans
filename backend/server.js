// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { fetchClanWarData } = require('./api');
const { createSession, removeSession, isValidSession, getUsername, validateUser } = require('./auth');
const { saveClanWarData} = require('./db');
const config = require('./config');

const app = express();

app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());
// app.use(express.static(path.join(__dirname))); //remove this
app.use('/TownHallAssets', express.static(path.join(__dirname, '../TownHallAssets')));
app.use('/Background', express.static(path.join(__dirname, '../Background')));
app.use('/ClanWarData', express.static(path.join(__dirname, 'clanWarData')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/clanwar', async (req, res) => {
    try {
        const clanWar = await fetchClanWarData();
        console.log("hii")
        if (clanWar.state === "notInWar") {
             return res.json(clanWar);
         } else {
            await saveClanWarData(clanWar);
            //if(!savedData || savedData.state != clanWar.state || savedData.startTime != clanWar.startTime){
             //   await saveClanWarData(clanWar);
            console.log('Clan war data updated');
           //  }
             return res.json(clanWar);
         }
    } catch (error) {
        console.error('Error fetching or saving data:', error);
        res.status(500).json({ error: 'Failed to fetch or save data' });
    }
});

app.post('/loginInformation', (req, res) => {
    const { username, password } = req.body;
    if (validateUser(username, password)) {
      const sessionID = createSession(username);
      res.cookie('sessionID', sessionID, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });
      console.log('Logged in successfully')
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

const server = app.listen(config.port, () => {
  console.log(`Server listening at http://localhost:${config.port}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} is already in use. Try a different port.`);
    } else {
      console.error(`An unexpected error occurred:`, error);
    }
  });