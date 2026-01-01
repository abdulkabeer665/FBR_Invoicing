
const secretKey = "BY8gXJuRK/urlGL7Ah5dvjl81x4WGNeNCcO4nCu8f9+10YH8IVbtBPGBu7mLCDuO8m+mkWLZhK2hgZliYxvWiQ==";

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];
        req.token = token;
        next();
    } else {
        res.status(403).send({
            result: 'Token is required!'
        })
    }
};

module.exports = { secretKey, verifyToken };