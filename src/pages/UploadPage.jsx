import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { saveOrders } from '../services/orderService';
import { useNavigate } from 'react-router-dom';
import { parseDate, normalizeKey } from '../utils/formatters';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setError('');

        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    // Parse and key-normalize data
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { range: 5 });

                    // Whitelisted columns to display
                    const ALLOWED_COLUMNS = [
                        'SERIAL NO.', 'ORDER NO.', 'ORDER DATE', 'ISSUED TO',
                        'VENDOR LOCATION', 'SUBJECT', 'BASIC ORDER VALUE',
                        'GST', 'TOTAL ORDER VALUE', 'DEALING OFFICER'
                    ];

                    const COLUMN_ALIASES = {
                        'SERIAL NO.': ['SERIAL NO', 'SL NO', 'S.NO'],
                        'ORDER NO.': ['ORDER NO', 'PO NO', 'PO NUMBER'],
                        'ORDER DATE': ['PO DATE', 'DATE'],
                        'ISSUED TO': ['VENDOR NAME', 'PARTY NAME', 'NAME'],
                        'BASIC ORDER VALUE': ['BASIC VALUE'],
                        'TOTAL ORDER VALUE': ['TOTAL VALUE']
                    };

                    const processedData = jsonData.map((row, index) => {
                        const newRow = { _tempId: index };
                        // Create a map of normalized keys to values for easier lookup
                        const normalizedRow = {};
                        Object.keys(row).forEach(k => normalizedRow[normalizeKey(k)] = row[k]);

                        ALLOWED_COLUMNS.forEach(col => {
                            // Try exact match first
                            let val = normalizedRow[normalizeKey(col)];

                            // If not found, try aliases
                            if (val === undefined && COLUMN_ALIASES[col]) {
                                for (const alias of COLUMN_ALIASES[col]) {
                                    const aliasVal = normalizedRow[normalizeKey(alias)];
                                    if (aliasVal !== undefined) {
                                        val = aliasVal;
                                        break;
                                    }
                                }
                            }

                            val = val === undefined ? '' : val; // Default to empty string if still undefined

                            // Special formatting for Date columns
                            if (col === 'ORDER DATE') {
                                val = parseDate(val);
                            }
                            newRow[col] = val;
                        });
                        return newRow;
                    });

                    // Filter empty rows (must have at least Order No or Order Date)
                    const validData = processedData.filter(row => row['ORDER NO.'] || row['ORDER DATE']);

                    setParsedData(validData);
                } catch (err) {
                    setError('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
                    console.error(err);
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const toggleSelection = (id) => {
        const newSelection = new Set(selectedOrders);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedOrders(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedOrders.size === parsedData.length) {
            setSelectedOrders(new Set());
        } else {
            const allIds = parsedData.map(row => row._tempId);
            setSelectedOrders(new Set(allIds));
        }
    };

    const handleSave = async () => {
        if (selectedOrders.size === 0) {
            setError('Please select at least one order to import.');
            return;
        }

        setLoading(true);
        try {
            const ordersToSave = parsedData
                .filter(row => selectedOrders.has(row._tempId))
                .map(({ _tempId, ...rest }) => rest); // Remove temp ID

            await saveOrders(ordersToSave);
            navigate('/');
        } catch (err) {
            console.error("Import Error:", err);
            // Display the actual error message to the user for better debugging
            setError(`Failed to save orders: ${err.message || 'Unknown error'}. Check console for details.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Orders</h2>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        name="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                            <Upload size={24} />
                        </div>
                        <span className="text-gray-600 font-medium">Click to upload Excel file</span>
                        <span className="text-sm text-gray-400">.xlsx or .xls files supported</span>
                    </label>
                    {file && <p className="mt-2 text-sm text-indigo-600 font-medium">{file.name}</p>}
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}
            </div>

            {parsedData.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Select Orders to Import</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">{selectedOrders.size} selected</span>
                            <button
                                onClick={handleSave}
                                disabled={loading || selectedOrders.size === 0}
                                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${loading || selectedOrders.size === 0
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                            >
                                {loading ? 'Importing...' : 'Import Selected'}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm">
                                    <th className="p-3 border-b border-gray-200 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.size === parsedData.length && parsedData.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            aria-label="Select all orders"
                                            title="Select all orders"
                                        />
                                    </th>
                                    {Object.keys(parsedData[0]).filter(k => k !== '_tempId').map(key => (
                                        <th key={key} className="p-3 border-b border-gray-200 font-medium capitalize">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {parsedData.map((row) => (
                                    <tr
                                        key={row._tempId}
                                        className={`hover:bg-gray-50 transition-colors ${selectedOrders.has(row._tempId) ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <td className="p-3 border-b border-gray-100">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.has(row._tempId)}
                                                onChange={() => toggleSelection(row._tempId)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                aria-label={`Select order row ${row._tempId}`}
                                                title={`Select order row ${row._tempId}`}
                                            />
                                        </td>
                                        {Object.entries(row).filter(([k]) => k !== '_tempId').map(([key, value], i) => (
                                            <td key={i} className="p-3 border-b border-gray-100">
                                                {String(value)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadPage;
