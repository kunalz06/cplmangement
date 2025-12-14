import xlsx from 'xlsx';

const workbook = xlsx.readFile('Book1.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

if (data.length > 5) {
    console.log('Row 5 Headers:', JSON.stringify(data[5], null, 2));
} else {
    console.log('File too short');
}
