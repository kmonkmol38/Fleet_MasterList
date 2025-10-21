import React, { useMemo, useState } from 'react';
import { Vehicle } from '../types';
import { getExpiringVehicles, getExpiredVehicles } from '../services/fleetService';
import AlertsTable from './AlertsTable';
import { Bell } from './Icons';

interface AlertViewProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicleIdentifier: string) => void;
}

// Define a type for the filter values for better type safety
type AlertFilter = 'expired' | 3 | 7 | 20;

const AlertView: React.FC<AlertViewProps> = ({ vehicles, onVehicleSelect }) => {
  // Default filter is 'expired' to show most urgent items first
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('expired');

  const displayedVehicles = useMemo(() => {
    if (activeFilter === 'expired') {
      return getExpiredVehicles(vehicles);
    }
    // For numeric filters (3, 7, 20), get expiring vehicles
    return getExpiringVehicles(vehicles, activeFilter);
  }, [vehicles, activeFilter]);

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
        description: 'These vehicles require immediate attention as their registration is out of date.',
        iconColor: 'text-red-400',
        borderColor: 'border-red-700',
        bgColor: 'bg-red-900/50',
      };
    }
    return {
      title: 'Upcoming Expiries',
      description: `Vehicles with registration expiring in the next ${activeFilter} days.`,
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
          return "No expired registrations found.";
      }
      return `No upcoming registration expiries in the next ${activeFilter} days.`;
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
          <p className="text-gray-300">{getResultsText()}</p>
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