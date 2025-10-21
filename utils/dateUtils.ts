/**
 * Parses a variety of date inputs (string, number, Date) and returns a reliable Date object set to midnight UTC.
 * This function is designed to work with the normalized date strings (YYYY-MM-DD) from the app's cleaning step.
 * Using UTC throughout the app prevents timezone-related bugs.
 * @param dateInput The date value from the vehicle data.
 * @returns A Date object set to midnight UTC, or null if the input is invalid.
 */
export const parseVehicleDate = (dateInput: string | number | Date | undefined | null): Date | null => {
    if (dateInput === null || dateInput === undefined || dateInput === '') return null;

    // If it's already a valid Date object from the initial Excel parsing
    if (dateInput instanceof Date) {
        if (!isNaN(dateInput.getTime())) {
            // Standardize to midnight UTC to remove time-of-day and timezone effects
            return new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
        }
        return null;
    }

    // Handle string dates (normalized to YYYY-MM-DD by the cleaning step)
    if (typeof dateInput === 'string') {
        const dateStr = dateInput.trim().split('T')[0]; // Get only the date part
        
        // This regex is strict for YYYY-MM-DD to ensure consistency.
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // Month for Date.UTC is 0-indexed
            const day = parseInt(match[3], 10);

            if (year > 1900) { // Sanity check
                const date = new Date(Date.UTC(year, month, day));
                // Final validation to ensure parts form a real date
                if (!isNaN(date.getTime()) && date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
                    return date;
                }
            }
        }
    }
    
    // Fallback for Excel serial numbers (less common if sheetjs `cellDates` works, but good for safety)
    if (typeof dateInput === 'number') {
        // Excel's epoch starts on 1900-01-01. Days between 1970-01-01 and 1900-01-01 is 25569.
        const date = new Date((dateInput - 25569) * 86400000);
        if (!isNaN(date.getTime())) {
            // Standardize to UTC midnight
            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        }
    }

    return null;
};


/**
 * Formats a Date object into a DD-MM-YYYY string for display.
 * It reads UTC date parts to prevent the displayed date from being a day off due to local timezone.
 * @param date A Date object (expected to be UTC).
 * @returns A formatted string e.g., "25-12-2024", or "N/A".
 */
export const formatDate = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return 'N/A';
    
    // Use getUTC... methods to read the date components without timezone conversion.
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getUTCFullYear();
    
    if (year < 1900) {
       return 'Invalid Date';
    }

    return `${day}-${month}-${year}`;
};