// dbUtils.js
const mssql = require('mssql');
const path = require('path');

// Generic function to establish SQL Server connection
async function getDbConnection(dbKey) {
    
    const dbConnectionString = require(path.join(__dirname, 'dbConnectionString.js'));
    const connectionString = dbConnectionString[dbKey];
    if (!connectionString) {
        throw new Error(`Invalid dbKey provided: ${dbKey}`);
    }
    const [user, password, server, port, database, timeout] = connectionString.split(',');
    const config = {
        user,
        password,
        server,
        port: parseInt(port, 10),
        database,
        options: {
            encrypt: false,
            trustServerCertificate: true,
        },
        connectionTimeout: Number(timeout),
    };

    try {
        const pool = new mssql.ConnectionPool(config); // <-- new pool instance
        await pool.connect();
        return pool;
    } catch (err) {
        throw new Error(`Error connecting to the database: ${err.message}`);
    }
}

module.exports = { getDbConnection };
