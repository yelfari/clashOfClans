// backend/auth.js
const crypto = require('crypto');
const config = require('./config');

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

function validateUser(username, password) {
    if (config.adminUsers[username] && config.adminUsers[username] === password) {
        console.log(config.adminUsers[username])
        console.log(config.adminUsers[username] === password)
        return true
    }
    return false;
}
  
module.exports = { createSession, removeSession, isValidSession, getUsername, validateUser };