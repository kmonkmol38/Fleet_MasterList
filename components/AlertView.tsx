

import React, { useMemo, useState } from 'react';
import { Vehicle } from '../types';
import { getExpiringVehicles, getExpiredVehicles, normalizeValue, exportToExcel } from '../services/fleetService';
import AlertsTable from './AlertsTable';
import { Bell, Download } from './Icons';
import { parseVehicleDate, formatDate } from '../utils/dateUtils';

interface AlertViewProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicleIdentifier: string) => void;
}

// Define a type for the filter values for better type safety
type AlertFilter = 'expired' | 3 | 7 | 20;

const AlertView: React.FC<AlertViewProps> = ({ vehicles, onVehicleSelect }) => {
  // Default filter is 'expired' to show most urgent items first
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('expired');

  const workingVehicles = useMemo(() =>
    vehicles.filter(v => normalizeValue(v.status) === 'working'),
    [vehicles]
  );

  const displayedVehicles = useMemo(() => {
    if (activeFilter === 'expired') {
      return getExpiredVehicles(workingVehicles);
    }
    // For numeric filters (3, 7, 20), get expiring vehicles
    return getExpiringVehicles(workingVehicles, activeFilter);
  }, [workingVehicles, activeFilter]);

  const getDaysRemainingForExport = (expiryDate: Date | null): string => {
    if (!expiryDate) return 'N/A';
    
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    return `${diffDays} day(s)`;
  };
  
  const handleExport = () => {
    if (displayedVehicles.length === 0) return;

    const dataToExport = displayedVehicles.map((vehicle, index) => {
        const expiryDate = parseVehicleDate(vehicle.registrationExpiry);
        return {
            'S.No.': index + 1,
            'Fleet No': vehicle.fleetNo,
            'Reg No': vehicle.regNo,
            'Vehicle Description': vehicle.vehicleDescription,
            'Status': vehicle.status,
            'Expiry Date': formatDate(expiryDate),
            'Days Remaining': getDaysRemainingForExport(expiryDate),
        };
    });

    const filterName = activeFilter === 'expired' ? 'Expired' : `Expiring_in_${activeFilter}_days`;
    const fileName = `Vehicle_Alerts_${filterName}_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(dataToExport, fileName);
  };

  const filters: { label: string; value: AlertFilter }[] = [
    { label: 'Expired', value: 'expired' },
    { label: '3 Days', value: 3 },
    { label: '7 Days', value: 7 },
    { label: '20 Days', value: 20 },
  ];

  const getHeaderContent = () => {
    if (activeFilter === 'expired') {
      return {
        title: 'Expired Registrations',
        description: "The following 'Working' status vehicles require immediate attention as their registration is out of date.",
        iconColor: 'text-red-400',
        borderColor: 'border-red-700',
        bgColor: 'bg-red-900/50',
      };
    }
    return {
      title: 'Upcoming Expiries',
      description: `Showing 'Working' status vehicles with registration expiring in the next ${activeFilter} days.`,
      iconColor: 'text-yellow-400',
      borderColor: 'border-gray-700',
      bgColor: 'bg-gray-800',
    };
  };

  const { title, description, iconColor, borderColor, bgColor } = getHeaderContent();

  const getResultsText = () => {
      const count = displayedVehicles.length;
      if (activeFilter === 'expired') {
          return <>Found <span className="font-bold text-red-400">{count}</span> expired vehicle(s).</>;
      }
      return <>Found <span className="font-bold text-yellow-400">{count}</span> vehicle(s) expiring in the next <span className="font-bold text-white">{activeFilter}</span> days.</>;
  };
  
  const getNoResultsText = () => {
       if (activeFilter === 'expired') {
          return "No expired registrations found for 'Working' status vehicles.";
      }
      return `No upcoming registration expiries in the next ${activeFilter} days for 'Working' status vehicles.`;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className={`p-4 sm:p-6 rounded-lg border ${borderColor} ${bgColor}`}>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className={`w-8 h-8 ${iconColor}`} />
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className={activeFilter === 'expired' ? 'text-red-200' : 'text-gray-400'}>{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {filters.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setActiveFilter(value)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                  activeFilter === value
                    ? 'bg-cyan-600 text-white shadow-md'
                    : `text-gray-300 hover:bg-gray-600 ${value === 'expired' ? 'bg-red-800/60' : 'bg-gray-700'}`
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {displayedVehicles.length > 0 ? (
        <>
          <div className="flex justify-between items-center">
              <p className="text-gray-300">{getResultsText()}</p>
              <button
                  onClick={handleExport}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition-colors"
              >
                  <Download className="w-4 h-4" />
                  Export to Excel
              </button>
          </div>
          <AlertsTable vehicles={displayedVehicles} onVehicleSelect={onVehicleSelect} />
        </>
      ) : (
        <div className="text-center text-gray-500 py-16 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
          <p>{getNoResultsText()}</p>
        </div>
      )}
    </div>
  );
};

export default AlertView;
