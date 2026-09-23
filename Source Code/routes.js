//#region "Declaration"

var express = require('express');
const jwt = require('jsonwebtoken');
var mssql = require('mssql');
var router = express.Router();
const fs = require('fs');
const path = require('path');
const { secretKey, verifyToken } = require('./GeneralFunctions/verifyToken');
const { getDbConnection } = require('./dbUtils'); // Import the utility function

//#endregion

//#region "Page Routing"

router.get('/', function (req, res) {
    res.sendFile(global.basedir + '/app/login.html');
});

router.get('/index', function (req, res) {
    res.sendFile(global.basedir + '/app/index.html');
});

router.get('/invoices', function (req, res) {

    res.sendFile(global.basedir + '/app/html/invoices.html');
});

//#endregion

//#region "Dual Connection String Login API"

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Use the generic function to get a connection to the loginDb
        const pool = await getDbConnection('loginDb');

        const mssql_request = new mssql.Request(pool);
        mssql_request.input('LoginName', email);
        mssql_request.input('Pass', password);

        mssql_request.execute('dbo.SP_UserLogin2').then(function (dataset) {
            if (dataset && dataset.recordset && dataset.recordset.length > 0) {
                const user = dataset.recordset[0];
                jwt.sign({ user }, secretKey, { expiresIn: '24h' }, (err, token) => {
                    if (err) {
                        return res.status(500).send({ message: "Error generating token", error: err });
                    }
                    res.status(user.Status).json({
                        token,
                        user
                    });
                });
            } else {
                res.status(401).json({
                    message: "Invalid credentials"
                });
            }
        }).catch(function (err) {
            res.status(400).send("Error in Route... " + err.message);
        });

    } catch (err) {
        res.status(500).json({
            message: "Error connecting to the database.",
            error: err.message
        });
    }
});

//#endregion

//#region "For Transaction"

router.post('/transaction', function (req, res) {

    const path = require('path');

    // Force clear the cache for the dbConnectionString.js file
    delete require.cache[require.resolve(path.join(__dirname, 'dbConnectionString.js'))];

    var dbConnectionString = require(path.join(__dirname, 'dbConnectionString.js'));

    if (!dbConnectionString || !dbConnectionString.transactionDb) {
        return res.status(500).send({ message: "Connection string is missing!" });
    }

    // Choose the connection string for transactions
    const connectionString = dbConnectionString.transactionDb;

    const config = {
        user: connectionString.split(',')[0],
        password: connectionString.split(',')[1],
        server: connectionString.split(',')[2],
        port: parseInt(connectionString.split(',')[3]),
        database: connectionString.split(',')[4],
        options: {
            encrypt: true,
            trustServerCertificate: true
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        connectionTimeout: Number(connectionString.split(',')[5]),
    };

    // Create a new mssql request for transaction-related queries
    var mssql_request = new mssql.Request();
    mssql_request.input('TransactionId', req.body.transactionId);
    mssql_request.input('Amount', req.body.amount);

    mssql.connect(config).then(function () {
        // Transaction-related stored procedure or query
        mssql_request.execute('dbo.SP_Transaction').then(function (dataset) {
            res.status(200).json(dataset.recordset);
        }).catch(function (err) {
            res.status(400).json({ message: 'Transaction failed', error: err.message });
        });
    }).catch(function (err) {
        res.status(500).json({
            message: "Error connecting to the transaction database.",
            error: err.message
        });
    });
});

//#endregion

module.exports = router;