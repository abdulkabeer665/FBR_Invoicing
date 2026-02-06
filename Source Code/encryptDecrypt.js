
const CryptoJS = require("crypto-js");
const secretKey = "TestSecretKey";

// 🔐 Encrypt function
function encryptData(plainText) {
    
    return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};

// 🔓 Decrypt function
function decryptData(cipherText) {
    
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports= {encryptData, decryptData}