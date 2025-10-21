import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { filterVehicles, exportToExcel } from '../services/fleetService';
import VehicleReportTable from './VehicleReportTable';
import { Download, RotateCcw } from './Icons';

interface ReportViewProps {
  vehicles: Vehicle[];
  businessUnits: string[];
  statuses: string[];
  vehicleOwners: string[];
  rentedOrOwnedValues: string[];
}

const ReportView: React.FC<ReportViewProps> = ({ vehicles, businessUnits, statuses, vehicleOwners, rentedOrOwnedValues }) => {
  const initialFilters = {
    businessUnit: 'All',
    status: 'All',
    vehicleOwner: 'All',
    rentedOrOwned: 'All',
  };
  
  const [filters, setFilters] = useState(initialFilters);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(vehicles);

  useEffect(() => {
    const filtered = filterVehicles(vehicles, filters);
    setFilteredVehicles(filtered);
  }, [filters, vehicles]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleExport = () => {
    const dataToExport = filteredVehicles.map((vehicle, index) => ({
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
      .filter(([, value]) => value !== 'All')
      .map(([key, value]) => `${key.replace('Unit', '')}-${value}`)
      .join('_');
    const fileName = `Fleet_Report_${filterParts || 'All'}_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(dataToExport, fileName);
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Business Unit Filter */}
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
              <option value="All">All Business Units</option>
              {businessUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </div>

          {/* Status Filter */}
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
              <option value="All">All Statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>

          {/* Vehicle Owner Filter */}
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
              <option value="All">All Owners</option>
              {vehicleOwners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
            </select>
          </div>

          {/* Rented or Owned Filter */}
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
              <option value="All">All Types</option>
              {rentedOrOwnedValues.map((type) => <option key={type} value={type}>{type}</option>)}
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
            <button
            onClick={handleExport}
            disabled={filteredVehicles.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
            </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        <p>Displaying {filteredVehicles.length} of {vehicles.length} total vehicles.</p>
      </div>
      
      <VehicleReportTable vehicles={filteredVehicles} />
    </div>
  );
};

export default ReportView;