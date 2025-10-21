import { Vehicle } from '../types';

// This makes TypeScript aware of the XLSX library loaded from the CDN
declare var XLSX: any;

// This service now contains pure functions that operate on the data passed to them.
// The vehicle data is managed in the App component's state after being loaded from the user's Excel file.

export const searchVehicle = (query: string, vehicles: Vehicle[]): Promise<Vehicle | null> => {
  return new Promise((resolve) => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = vehicles.find(
      (v) =>
        (v && v.regNo && v.regNo.toString().toLowerCase() === normalizedQuery) ||
        (v && v.fleetNo && v.fleetNo.toString().toLowerCase() === normalizedQuery)
    );
    resolve(result || null);
  });
};

export const getSearchSuggestions = (vehicles: Vehicle[]): Promise<{ regNos: string[], fleetNos:string[] }> => {
    return new Promise((resolve) => {
        const regNos = vehicles
            .filter(v => v && v.regNo)
            .map(v => v.regNo.toString());
        const fleetNos = vehicles
            .filter(v => v && v.fleetNo)
            .map(v => v.fleetNo.toString());
        resolve({ regNos, fleetNos });
    });
};

/**
 * A robust normalization function to handle different kinds of whitespace and casing.
 * @param value The value to normalize.
 * @returns A trimmed, lowercase string with all whitespace collapsed.
 */
const normalizeValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  // Convert to string, replace all sequences of whitespace characters (including non-breaking spaces)
  // with a single space, then trim and convert to lowercase.
  return String(value)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

const getUniqueValues = (vehicles: Vehicle[], key: keyof Vehicle): string[] => {
    const uniqueMap = new Map<string, string>();
    vehicles.forEach(vehicle => {
        const originalValue = vehicle[key];
        // Ensure there is a non-empty value to process
        if (originalValue !== null && originalValue !== undefined && String(originalValue).trim() !== '') {
            const normalized = normalizeValue(originalValue);
            
            // Use the normalized value as the key to ensure uniqueness against different casings/whitespaces.
            // Store the first-seen, trimmed, original-cased value to display in the dropdown.
            if (!uniqueMap.has(normalized)) {
                uniqueMap.set(normalized, String(originalValue).trim());
            }
        }
    });
    // Return the display values, sorted alphabetically.
    return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};


export const getUniqueBusinessUnits = (vehicles: Vehicle[]): string[] => {
    return getUniqueValues(vehicles, 'businessUnit');
};

export const getUniqueStatuses = (vehicles: Vehicle[]): string[] => {
    return getUniqueValues(vehicles, 'status');
};

export const getUniqueVehicleOwners = (vehicles: Vehicle[]): string[] => {
    return getUniqueValues(vehicles, 'vehicleOwner');
};

export const getUniqueRentedOrOwned = (vehicles: Vehicle[]): string[] => {
    return getUniqueValues(vehicles, 'rentedOrOwned');
};

export const filterVehicles = (
  vehicles: Vehicle[],
  filters: { businessUnit: string; status: string; vehicleOwner: string; rentedOrOwned: string; }
): Vehicle[] => {

  // A filter is considered "active" if it's not the default 'All' value.
  const activeFilters = Object.entries(filters)
    .filter(([, value]) => value !== 'All' && value !== '')
    .map(([key, value]) => ({
      key: key as keyof Vehicle,
      value: normalizeValue(value) // Normalize the selected filter value for comparison
    }));

  // If no filters are active, return all vehicles.
  if (activeFilters.length === 0) {
    return vehicles;
  }

  return vehicles.filter(vehicle => {
    // A vehicle is a match if it satisfies ALL active filters.
    // The .every() method ensures that all conditions must be true.
    return activeFilters.every(filter => {
      const vehicleValue = normalizeValue(vehicle[filter.key]);
      return vehicleValue === filter.value;
    });
  });
};


export const exportToExcel = (data: any[], fileName: string): void => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};