export const parseVehicleDate = (dateInput: string | number | Date | undefined | null): Date | null => {
    if (dateInput === null || dateInput === undefined || dateInput === '') return null;

    let date: Date;

    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'number') {
        // Handle Excel serial date. 25569 is days between 1900-01-01 and 1970-01-01, accounting for Excel's 1900 leap year bug.
        date = new Date((dateInput - 25569) * 86400000);
    } else {
        // Handle various string date formats that the Date constructor can parse
        date = new Date(dateInput);
    }
    
    // Check if the created date is valid and not a ridiculous year
    if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
       return null;
    }

    return date;
};

export const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};
