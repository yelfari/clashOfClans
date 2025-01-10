// backend/config.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  cocApiKey: process.env.COC_API_KEY,
  clanTag: process.env.CLAN_TAG,
    adminUsers: {
        "jaglonger": process.env.ADMIN_PASSWORD_1,
        "Freund": process.env.ADMIN_PASSWORD_2,
        "nurexx": process.env.ADMIN_PASSWORD_3
    },
};