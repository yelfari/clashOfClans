// backend/db.js

const fs = require('fs').promises;;
const path = require('path');
const directoryToScan = './clanWarData/'; 
const configPath = '../frontend/js/config.js';; 
let jsonFileName = ""

async function saveClanWarData(clanWarData) {
    try {
        jsonFileName = clanWarData.startTime.toISOString().slice(0,10); 
        clanWarDataPath = path.join(__dirname, 'clanWarData', jsonFileName +'.json')
        const jsonString = JSON.stringify(clanWarData, null, 2);
        await fs.writeFile(clanWarDataPath, jsonString, 'utf8');
        console.log('Clan war data saved to clanWarData Folder');
        console.log('Updating Config....');
        await updateConfigFile(directoryToScan,configPath)
    } catch (error) {
        console.error('Error saving clan war data:', error);
        throw error;
    }
}


async function updateConfigFile(directoryPath, configFilePath) {
    try {
          const files = await fs.readdir(directoryPath);
          const jsonFileNames = files
              .filter(file => {
                  const datePattern = /^\d{4}-\d{2}-\d{2}\.json$/;
                  return path.extname(file) === '.json' && datePattern.test(file);
              })
              .sort();        
          const fileNamesString = JSON.stringify(jsonFileNames, null, 4);
          const configFileContent = `
              export const fileNames = ${fileNamesString};
          `;
      await fs.writeFile(configFilePath, configFileContent);
    } catch (err) {
      throw err; 
    }
  }

module.exports = { saveClanWarData};