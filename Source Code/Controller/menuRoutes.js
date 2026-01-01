const express = require('express');
const jwt = require('jsonwebtoken');
var mssql = require('mssql');
const router = express.Router();
const { secretKey, verifyToken } = require('../GeneralFunctions/verifyToken');
const { getDbConnection } = require('../dbUtils'); // Import the utility function

const getMenuAgainstRoleID = "[dbo].[SP_getMenuAgainstRoleID]";

//#region Get All Menus Against Role ID

router.post('/getMenuAgainstRoleID', verifyToken, async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, authData) => {
        if (err){
            res.status(404).send({
                result: "Invalid Token"
            })
        }

        try {
            // Use the generic function to get a connection to the transactionDb
            const pool = await getDbConnection('loginDb');

            const mssql_request = new mssql.Request(pool);  // Pass the connection pool to the request
            mssql_request.execute(getMenuAgainstRoleID).then(function (dataset) {
                if (dataset && dataset.recordsets && dataset.recordsets.length > 0) {
                    authData.iat = new Date(authData.iat * 1000).toLocaleString();
                    authData.exp = new Date(authData.exp * 1000).toLocaleString();
                    res.status(200).send({
                        actualData: dataset.recordset,
                        authData,
                    });
                } else {
                    res.status(404).send("No data found.");
                }
            }).catch(function (err) {
                res.status(400).send("Error executing stored procedure: " + err.message);
            });

        } catch (err) {
            res.status(500).send({
                message: "Database connection failed",
                error: err.message,
            });
        }

        // else {
        //     var mssql_request = new mssql.Request();
        //     mssql_request.execute(getMenuAgainstRoleID).then(function (dataset) {
        //         authData.iat = new Date(authData.iat * 1000).toLocaleString();
        //         authData.exp = new Date(authData.exp * 1000).toLocaleString();
        //         res.status(200).send({
        //             actualData: dataset.recordset,
        //             authData
        //         });
        //     }).catch(function (err) {
        //         res.status(400).send("Error in Route... " + err.message);
        //     });
        // }
    })
});

//#endregion

module.exports = router;