const fs = require('fs').promises;
const path = require('path');

async function writeInvoicePayloadToFile(finalPayload) {
    if (!finalPayload?.length) {
        throw new Error('finalPayload is empty');
    }

    // const invoiceRefNo = finalPayload[0].invoiceRefNo;

    const invoiceRefNo = finalPayload.find(item => item.invoiceRefNo)?.invoiceRefNo || finalPayload.find(item => item.USIN)?.USIN;

    const now = new Date();
    const formattedDate =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '_' +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');

    const fileName = `${invoiceRefNo}_${formattedDate}.json`;
    const outputDir = path.join(__dirname, '../output');

    await fs.mkdir(outputDir, { recursive: true });

    const filePath = path.join(outputDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(finalPayload, null, 2));

    console.log(`File saved successfully: ${filePath}`);
}

module.exports = { writeInvoicePayloadToFile };