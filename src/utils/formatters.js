export const parseDate = (dateVal) => {
    if (!dateVal) return '';

    // Check if it's already in format dd/mm/yyyy (simple regex check)
    if (typeof dateVal === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateVal)) {
        return dateVal; // already correct
    }

    let dateObj;

    // Handle Excel serial number
    if (typeof dateVal === 'number') {
        // Excel base date is Dec 30 1899. 
        // 25569 is the number of days between 1899-12-30 and 1970-01-01
        dateObj = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    } else {
        // Handle "12th December 2024" or standard strings
        // Remove 'st', 'nd', 'rd', 'th' from day numbers to help standard parsing
        const cleanDateStr = String(dateVal).replace(/(\d+)(st|nd|rd|th)/, '$1');
        dateObj = new Date(cleanDateStr);
    }

    if (isNaN(dateObj.getTime())) {
        return String(dateVal); // Return original if parsing failed
    }

    // Format to dd/mm/yyyy
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
};

export const normalizeKey = (key) => String(key).replace(/[\r\n]+/g, ' ').trim();
