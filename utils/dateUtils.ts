export const parseVehicleDate = (dateInput: string | number | Date | undefined | null): Date | null => {
    if (dateInput === null || dateInput === undefined || dateInput === '') return null;

    // If it's already a valid Date object, return it.
    if (dateInput instanceof Date) {
        if (!isNaN(dateInput.getTime())) {
            return dateInput;
        }
        return null;
    }

    // Handle Excel serial numbers
    if (typeof dateInput === 'number') {
        // Excel's epoch starts on 1900-01-01, which it incorrectly thinks is a leap year.
        // The number of days between 1970-01-01 and 1900-01-01 is 25569.
        const date = new Date((dateInput - 25569) * 86400000);
        // Check for validity
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    
    // Handle string dates robustly
    if (typeof dateInput === 'string') {
        const dateStr = dateInput.trim();
        
        // Try parsing DD-MM-YYYY or DD/MM/YYYY
        const dmyMatch = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
        if (dmyMatch) {
            const day = parseInt(dmyMatch[1], 10);
            const month = parseInt(dmyMatch[2], 10); // Month is 1-based
            const year = parseInt(dmyMatch[3], 10);
            
            // Construct date in local timezone. Month in constructor is 0-indexed.
            const date = new Date(year, month - 1, day);
            
            // Validate that the constructor didn't roll over (e.g., Feb 30 -> Mar 1/2)
            if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
                return date;
            }
        }

        // Fallback for other formats that new Date() handles reliably (like ISO 8601)
        const fallbackDate = new Date(dateStr);
        if (!isNaN(fallbackDate.getTime())) {
            return fallbackDate;
        }
    }

    return null;
};


export const formatDate = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return 'N/A';
    
    // Use local date parts to display
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    
    // A simple sanity check to avoid displaying nonsensical years
    if (year < 1900) {
       return 'Invalid Date';
    }

    return `${day}-${month}-${year}`;
};
