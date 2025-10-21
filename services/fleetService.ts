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

const getUniqueValues = (vehicles: Vehicle[], key: keyof Vehicle): string[] => {
    // Use a Map to store unique values case-insensitively while preserving the original casing of the first encountered value.
    const uniqueMap = new Map<string, string>();
    vehicles.forEach(v => {
        const value = v[key];
        if (value !== null && value !== undefined) {
            const trimmedValue = String(value).trim();
            if (trimmedValue !== '') {
                const lowercasedValue = trimmedValue.toLowerCase();
                if (!uniqueMap.has(lowercasedValue)) {
                    uniqueMap.set(lowercasedValue, trimmedValue); // Store lowercase as key, original as value
                }
            }
        }
    });
    // Return the original-cased values, sorted alphabetically
    return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
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
  // Normalize filter values to lowercase once for efficiency and case-insensitive comparison.
  const cleanFilters = {
      businessUnit: filters.businessUnit.toLowerCase(),
      status: filters.status.toLowerCase(),
      vehicleOwner: filters.vehicleOwner.toLowerCase(),
      rentedOrOwned: filters.rentedOrOwned.toLowerCase(),
  };

  return vehicles.filter(v => {
    // Compare vehicle data (also normalized) against the cleaned filter values.
    const unitMatch = cleanFilters.businessUnit === 'all' || 
                      (String(v.businessUnit || '').trim().toLowerCase() === cleanFilters.businessUnit);
    
    const statusMatch = cleanFilters.status === 'all' || 
                        (String(v.status || '').trim().toLowerCase() === cleanFilters.status);

    const ownerMatch = cleanFilters.vehicleOwner === 'all' || 
                       (String(v.vehicleOwner || '').trim().toLowerCase() === cleanFilters.vehicleOwner);
    
    const rentedOrOwnedMatch = cleanFilters.rentedOrOwned === 'all' || 
                               (String(v.rentedOrOwned || '').trim().toLowerCase() === cleanFilters.rentedOrOwned);

    return unitMatch && statusMatch && ownerMatch && rentedOrOwnedMatch;
  });
};


export const exportToExcel = (data: any[], fileName: string): void => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};