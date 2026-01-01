// Global Paths
global.basedir = __dirname;

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const mssql = require('mssql');

//Only for Routing
const routes = require('./routes');

// Custom route modules
const menuRoutes = require('./Controller/menuRoutes');
const invoicesRoutes = require('./Controller/invoicesRoutes');

const app = express();
const fs = require('fs').promises;
const server = http.createServer(app);
const port = process.env.PORT || 3015;

app.use(cors({
    origin: '*', // Allows requests from any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.disable('etag');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', routes);

// Use these routes for API
app.use('/', menuRoutes);  // All routes in menuRoutes.js will be prefixed with /menus
app.use('/', invoicesRoutes);  // All routes in companyRoutes.js will be prefixed with /carcass

app.use(express.static(path.join(basedir, 'app')));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

server.listen(port, () => {
    console.log('Server listening at port %d', port);
    console.log('You can open the link on browser at http://localhost:%d', port);
});

app.post('/update-connection-string', async (req, res) => {
    const {
        serverName,
        serverPort,
        serverUserName,
        serverPassword,
        dbName,
        serverConnectionTimeout
    } = req.body;

    // Path to dbConnectionString.js
    const dbConnectionStringPath = path.join(__dirname, 'dbConnectionString.js');

    try {
        let dbConfig = require(dbConnectionStringPath);

        // Validate the server port (ensure it's a number between 1 and 65535)
        if (serverPort === '' || serverPort === 0) {
            serverPort = 1433;
        }
        const port = parseInt(serverPort, 10);
        if (isNaN(port) || port <= 0 || port >= 65536) {
            return res.status(400).send('Invalid port number. It must be between 1 and 65535.');
        }

        // Construct the new connection string for loginDb
        const newConnectionString = `${serverUserName},${serverPassword},${serverName},${serverPort},${dbName},${serverConnectionTimeout}`;

        // Update only the loginDb field
        dbConfig.loginDb = newConnectionString;

        // SQL Server connection configuration (for testing the new connection)
        const config = {
            user: serverUserName,
            password: serverPassword,
            server: serverName,
            port: port,
            database: dbName,
            options: {
                encrypt: false,
                trustServerCertificate: true
            },
            connectionTimeout: Number(serverConnectionTimeout),
        };

        // Test the new connection before updating the file
        console.log('Attempting to connect to the database...');
        await mssql.connect(config); // Try to connect to the new DB

        console.log('Connection successful.');

        // Write the updated dbConnectionString object back to the file
        const newDbConnectionStringContent = `module.exports = ${JSON.stringify(dbConfig, null, 4)};`;

        await fs.writeFile(dbConnectionStringPath, newDbConnectionStringContent, 'utf8');

        // Respond to the client
        res.send('Connection string updated successfully and database connection verified.');

    } catch (err) {
        console.error('Error updating connection string:', err.message);
        return res.status(500).send(`Error updating connection string: ${err.message}`);
    }
});