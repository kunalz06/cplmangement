import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'c:\\Users\\kunal\\Desktop\\Officeapp\\Book1.xlsx';

try {
    console.log(`Reading file from: ${filePath}`);
    const buf = fs.readFileSync(filePath);
    const workbook = XLSX.read(buf, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    console.log(`Sheet Name: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    console.log('Parsed Data Sample (first 2 rows):');
    console.log(JSON.stringify(jsonData.slice(0, 2), null, 2));
    console.log(`Total rows: ${jsonData.length}`);
} catch (err) {
    console.error('Error parsing file:', err);
}
