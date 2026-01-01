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

    // Parse the connection string (comma-separated values)
    // const config = {
    //     user: connectionString.split(',')[0],
    //     password: connectionString.split(',')[1],
    //     server: connectionString.split(',')[2],
    //     port: parseInt(connectionString.split(',')[3], 10),
    //     database: connectionString.split(',')[4],
    //     options: {
    //         encrypt: true, // Use encryption
    //         trustServerCertificate: true, // Required for local dev with self-signed certs
    //     },
    //     connectionTimeout: Number(connectionString.split(',')[5]),
    // };

    try {
        return token;
    } catch (err) {
        throw new Error(`Error fetching the token: ${err.message}`);
    }
}

module.exports = { getToken };
