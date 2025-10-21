import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types';
import { 
  filterVehicles, 
  exportToExcel,
  getUniqueBusinessUnits,
  getUniqueRentedOrOwned,
  getUniqueStatuses,
  getUniqueVehicleOwners,
  normalizeValue
} from '../services/fleetService';
import VehicleReportTable from './VehicleReportTable';
import { Download, RotateCcw } from './Icons';

interface ReportViewProps {
  vehicles: Vehicle[];
}

const ReportView: React.FC<ReportViewProps> = ({ vehicles }) => {
  const initialFilters = {
    businessUnit: '',
    status: '',
    vehicleOwner: '',
    rentedOrOwned: '',
  };
  
  const [filters, setFilters] = useState(initialFilters);
  const [displayedVehicles, setDisplayedVehicles] = useState<Vehicle[]>([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  const availableOptions = useMemo(() => {
      const getFilteredVehicles = (exclude: keyof typeof filters | null) => {
          return vehicles.filter(v =>
              (exclude === 'businessUnit' || !filters.businessUnit || normalizeValue(v.businessUnit) === normalizeValue(filters.businessUnit)) &&
              (exclude === 'status' || !filters.status || normalizeValue(v.status) === normalizeValue(filters.status)) &&
              (exclude === 'vehicleOwner' || !filters.vehicleOwner || normalizeValue(v.vehicleOwner) === normalizeValue(filters.vehicleOwner)) &&
              (exclude === 'rentedOrOwned' || !filters.rentedOrOwned || normalizeValue(v.rentedOrOwned) === normalizeValue(filters.rentedOrOwned))
          );
      };

      return {
          businessUnits: getUniqueBusinessUnits(getFilteredVehicles('businessUnit')),
          statuses: getUniqueStatuses(getFilteredVehicles('status')),
          vehicleOwners: getUniqueVehicleOwners(getFilteredVehicles('vehicleOwner')),
          rentedOrOwnedValues: getUniqueRentedOrOwned(getFilteredVehicles('rentedOrOwned')),
      };
  }, [filters, vehicles]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  
  const handleApplyFilters = () => {
    const results = filterVehicles(vehicles, filters);
    setDisplayedVehicles(results);
    setHasAppliedFilters(true);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setDisplayedVehicles([]);
    setHasAppliedFilters(false);
  };

  const handleExport = () => {
    const dataToExport = displayedVehicles.map((vehicle, index) => ({
      'Serial Number': index + 1,
      'Fleet No': vehicle.fleetNo,
      'Reg No': vehicle.regNo,
      'Vehicle Description': vehicle.vehicleDescription,
      'User': vehicle.user,
      'Project': vehicle.project,
      'Status': vehicle.status,
      'Rent Amount (QAR)': vehicle.rentAmount,
      'Business Unit': vehicle.businessUnit,
      'Vehicle Owner': vehicle.vehicleOwner,
      'Rented or Owned': vehicle.rentedOrOwned,
    }));

    const filterParts = Object.entries(filters)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key.replace('Unit', '')}-${value}`)
      .join('_');
    const fileName = `Fleet_Report_${filterParts || 'Current'}_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(dataToExport, fileName);
  };

  const isAnyFilterSelected = Object.values(filters).some(val => val !== '');

  return (
    <div className="animate-fade-in">
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label htmlFor="businessUnitFilter" className="text-sm font-medium text-gray-400 mb-1">
              Business Unit
            </label>
            <select
              id="businessUnitFilter"
              value={filters.businessUnit}
              onChange={(e) => handleFilterChange('businessUnit', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            >
              <option value="" disabled>Select Business Unit</option>
              {availableOptions.businessUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="statusFilter" className="text-sm font-medium text-gray-400 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            >
              <option value="" disabled>Select Status</option>
              {availableOptions.statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="ownerFilter" className="text-sm font-medium text-gray-400 mb-1">
              Vehicle Owner
            </label>
            <select
              id="ownerFilter"
              value={filters.vehicleOwner}
              onChange={(e) => handleFilterChange('vehicleOwner', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            >
              <option value="" disabled>Select Owner</option>
              {availableOptions.vehicleOwners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="rentedOrOwnedFilter" className="text-sm font-medium text-gray-400 mb-1">
              Rented or Owned
            </label>
            <select
              id="rentedOrOwnedFilter"
              value={filters.rentedOrOwned}
              onChange={(e) => handleFilterChange('rentedOrOwned', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            >
              <option value="" disabled>Select Type</option>
              {availableOptions.rentedOrOwnedValues.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
            >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Filters
            </button>
            <div className="flex-grow flex flex-col sm:flex-row justify-end items-center gap-4 w-full sm:w-auto">
                 <button
                    onClick={handleApplyFilters}
                    disabled={!isAnyFilterSelected}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                    Apply Filters
                </button>
                <button
                onClick={handleExport}
                disabled={displayedVehicles.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                </button>
            </div>
        </div>
      </div>

      <div className="mb-4 text-gray-400 flex items-center gap-4">
        {hasAppliedFilters ? (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-cyan-500/20 border-2 border-cyan-500/50 rounded-full">
                <span className="text-3xl font-bold text-white">{displayedVehicles.length}</span>
            </div>
            <p className="text-lg">
                Vehicles found <span className="text-gray-500 font-light">out of {vehicles.length} total.</span>
            </p>
          </>
        ) : (
          <p className="text-base">Please select at least one filter and click "Apply Filters" to view the report.</p>
        )}
      </div>
      
      {hasAppliedFilters ? (
        <VehicleReportTable vehicles={displayedVehicles} />
      ) : (
        <div className="text-center text-gray-500 py-16 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
            <p>The report data will be displayed here once filters are applied.</p>
        </div>
      )}
    </div>
  );
};

export default ReportView;