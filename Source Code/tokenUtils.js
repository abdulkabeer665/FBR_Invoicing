// dbUtils.js
const mssql = require('mssql');
const path = require('path');

// Generic function to establish SQL Server connection
async function getToken(tokenKey) {
    const tokenString = require(path.join(__dirname, 'token.js'));

    // Get the correct connection string based on the dbKey
    const token = tokenString[tokenKey];

    if (!token) {
        throw new Error(`Invalid tokenKey provided: ${tokenKey}`);
    }

    try {
        return token;
    } catch (err) {
        throw new Error(`Error fetching the token: ${err.message}`);
    }
}

module.exports = { getToken };
