
//#region "Declaration"

const fs = require('fs');
const path = require('path');

const express = require('express');
const jwt = require('jsonwebtoken');
var mssql = require('mssql');
const router = express.Router();
const { secretKey, verifyToken } = require('../GeneralFunctions/verifyToken');
const { getDbConnection } = require('../dbUtils'); // Import the utility function
const { writeInvoicePayloadToFile } = require('../fileWriter');


const { getToken } = require('../tokenUtils'); // Import the utility function
const { encryptData, decryptData } = require('../encryptDecrypt');

const SP_Sales_Report = "[dbo].[SP_GetDataOfInvoices]";
const SP_GetScenarios = "[dbo].[SP_GetScenarios]";
const SP_GetProvinces = "[dbo].[SP_GetProvinces]";
const SP_GetPaymentTypes = "[dbo].[SP_GetPaymentTypes]";
const SP_GetInvoiceTypes = "[dbo].[SP_GetInvoiceTypes]";
const SP_ZUL_Insert_FBR_Invoice_Response = "[dbo].[sp_zul_Insert_FBR_Invoice_Response]";

//#endregion

//#region "Get Scenarios"

router.get('/getScenarios', verifyToken, (req, res) => {
    jwt.verify(req.token, secretKey, async (err, authData) => {
        if (err) {
            return res.status(400).send({
                result: 'Invalid Token',
            });
        }

        try {
            // Use the generic function to get a connection to the transactionDb
            const pool = await getDbConnection('loginDb');

            const mssql_request = new mssql.Request(pool);  // Pass the connection pool to the request
            mssql_request.execute(SP_GetScenarios).then(function (dataset) {
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
     });
});

//#endregion

//#region "Get Provinces"

router.get('/getProvinces', verifyToken, (req, res) => {
    jwt.verify(req.token, secretKey, async (err, authData) => {
        if (err) {
            return res.status(400).send({
                result: 'Invalid Token',
            });
        }

        try {
            // Use the generic function to get a connection to the transactionDb
            const pool = await getDbConnection('loginDb');

            const mssql_request = new mssql.Request(pool);  // Pass the connection pool to the request
            mssql_request.execute(SP_GetProvinces).then(function (dataset) {
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
     });
});

//#endregion

//#region "Get Payment Types"

router.get('/getPaymentTypes', verifyToken, (req, res) => {
    jwt.verify(req.token, secretKey, async (err, authData) => {
        if (err) {
            return res.status(400).send({
                result: 'Invalid Token',
            });
        }

        try {
            // Use the generic function to get a connection to the transactionDb
            const pool = await getDbConnection('loginDb');

            const mssql_request = new mssql.Request(pool);  // Pass the connection pool to the request
            mssql_request.execute(SP_GetPaymentTypes).then(function (dataset) {
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
     });
});

//#endregion

//#region "Get Invoice Types"

router.get('/getInvoiceTypes', verifyToken, (req, res) => {
    jwt.verify(req.token, secretKey, async (err, authData) => {
        if (err) {
            return res.status(400).send({
                result: 'Invalid Token',
            });
        }

        try {
            // Use the generic function to get a connection to the transactionDb
            const pool = await getDbConnection('loginDb');

            const mssql_request = new mssql.Request(pool);  // Pass the connection pool to the request
            mssql_request.execute(SP_GetInvoiceTypes).then(function (dataset) {
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
     });
});

//#endregion

//#region "Get Data from GP"

router.post('/getSalesReport', verifyToken, async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, authData) => {
        if (err) {
            return res.status(400).send({
                result: 'Invalid Token',
            });
        }

        try {
            // Use the generic function to get a connection to the transactionDb
            const pool = await getDbConnection('transactionDb');

            const mssql_request = new mssql.Request(pool);  // Pass the connection pool to the request
            mssql_request.input("FROMDATE", req.body.fromDate);
            mssql_request.input("TODATE", req.body.toDate);
            mssql_request.execute(SP_Sales_Report).then(function (dataset) {
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
    });
});

//#endregion

//#region "Insert FBR Response"

router.post('/InsertFBR_Response', verifyToken, async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, authData) => {
        if (err) {
            return res.status(400).send({
                result: 'Invalid Token',
            });
        }

        try {
            // Use the generic function to get a connection to the transactionDb
            const pool = await getDbConnection('transactionDb');

            const mssql_request = new mssql.Request(pool);  // Pass the connection pool to the request
            mssql_request.input("Sopnumbr", req.body.Sopnumbr);
            mssql_request.input("FBR_InvoiceNo", req.body.FBR_InvoiceNo);
            mssql_request.input("Dated", req.body.Dated);
            mssql_request.input("Status", req.body.Status);
            mssql_request.input("StatusCode", req.body.StatusCode);
            mssql_request.input("ScenarioID", req.body.ScenarioID);
            mssql_request.input("ScenarioDesc", req.body.ScenarioDesc);
            mssql_request.input("Environment", req.body.Environment);

            // ✅ -------- IMAGE HANDLING START --------
            let imageBuffer = null;

            if (req.body.QRImage) {
                let base64Data = req.body.QRImage;
            
                // Remove prefix if exists (data:image/png;base64,...)
                const matches = base64Data.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
            
                if (matches) {
                    base64Data = matches[2];
                }
            
                imageBuffer = Buffer.from(base64Data, 'base64');
            
                if (!imageBuffer || imageBuffer.length === 0) {
                    return res.status(400).send("Invalid image data");
                }
            }
        
            // Pass to SQL (NULL if no image)
            mssql_request.input("QRImage", mssql.VarBinary(mssql.MAX), imageBuffer);
            // ✅ -------- IMAGE HANDLING END --------

            mssql_request.execute(SP_ZUL_Insert_FBR_Invoice_Response).then(function (dataset) {
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
    });
});

//#endregion

//#region "Get Token Call Encrypted"

router.post('/getTokenCallEncrypted', async (req, res) => {
    // const { email, password } = req.body;
    const tokenKey = req.body.tokenKey;

    try {
        // Use the generic function to get a connection to the loginDb
        const tokenValue = await getToken(tokenKey);
        var enc = encryptData(tokenValue);
        return res.status(200).send({
            token: enc
        });
    } catch (err) {
        res.status(500).json({
            message: "Error connecting to the database.",
            error: err.message
        });
    }
});

//#endregion

//#region "Get Token Call Decrypted"

router.post('/getTokenCallDecrypted', async (req, res) => {
    // const { email, password } = req.body;
    const decTokenKey = req.body.decTokenKey;

    try {
        // Use the generic function to get a connection to the loginDb
        // const tokenValue = await getToken(decTokenKey);
        var dec = await decryptData(decTokenKey);
        return res.status(200).send({
            token: dec
        });
    } catch (err) {
        res.status(500).json({
            message: "Error connecting to the database.",
            error: err.message
        });
    }
});

//#endregion

//#region "Save Invoice in a File"

router.post('/save-invoice', async (req, res) => {
    try {
        const filePath = await writeInvoicePayloadToFile(req.body);
        res.status(200).json({
            message: 'Saved successfully',
            file: filePath
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error saving file',
            error: error.message
        });
    }
});

//#endregion

//#region "Save QR Code in folder"

router.post('/save-qr', async (req, res) => {

    const { invoiceNo, image} = req.body;
    if (!image) {
        return res.status(400).json({ message: "No image received" });
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");

    const dirPath = path.join(__dirname, "../qrCodes");

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const fileName = `qr_${invoiceNo}.png`;
    const filePath = path.join(dirPath, fileName);

    fs.writeFile(filePath, base64Data, "base64", (err) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error saving QR" });
        }

        res.json({
            message: "QR saved successfully",
            file: `/qr/${fileName}`
        });

    });
});

//#endregion

module.exports = router;