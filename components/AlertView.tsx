import React, { useMemo } from 'react';
import { Vehicle } from '../types';
import { getExpiringVehicles } from '../services/fleetService';
import AlertsTable from './AlertsTable';
import { Bell } from './Icons';

interface AlertViewProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicleIdentifier: string) => void;
}

const AlertView: React.FC<AlertViewProps> = ({ vehicles, onVehicleSelect }) => {
  const expiringVehicles = useMemo(() => {
    return getExpiringVehicles(vehicles, 20);
  }, [vehicles]);

  return (
    <div className="animate-fade-in">
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700 mb-6">
        <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-yellow-400" />
            <div>
                <h2 className="text-2xl font-bold text-white">Registration Expiry Alerts</h2>
                <p className="text-gray-400">Showing vehicles with registration expiring in the next 20 days.</p>
            </div>
        </div>
      </div>
      
      {expiringVehicles.length > 0 ? (
        <>
            <p className="mb-4 text-gray-300">
                Found <span className="font-bold text-yellow-400">{expiringVehicles.length}</span> vehicle(s) requiring attention.
            </p>
            <AlertsTable vehicles={expiringVehicles} onVehicleSelect={onVehicleSelect} />
        </>
      ) : (
        <div className="text-center text-gray-500 py-16 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
            <p className="text-lg">No registration expiries in the next 20 days.</p>
            <p>All vehicles are up to date!</p>
        </div>
      )}
    </div>
  );
};

export default AlertView;
