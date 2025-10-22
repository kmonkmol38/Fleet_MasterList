
import React from 'react';
import { Vehicle } from '../types';
import { parseVehicleDate, formatDate } from '../utils/dateUtils';
import { getStatusBadgeClass } from '../utils/styleUtils';

interface AlertsTableProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicleIdentifier: string) => void;
}

const getDaysRemaining = (expiryDate: Date | null): { days: number; text: string } => {
    if (!expiryDate) return { days: Infinity, text: 'N/A' };
    
    const now = new Date();
    // Get today at midnight UTC to match the expiry date's timezone
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // expiryDate from parseVehicleDate is already UTC midnight.
    const diffTime = expiryDate.getTime() - today.getTime();
    // Use Math.round for the most accurate day difference calculation
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { days: diffDays, text: 'Expired' };
    if (diffDays === 0) return { days: 0, text: 'Today' };
    return { days: diffDays, text: `${diffDays} day(s)` };
};

const getDaysRemainingClass = (days: number): string => {
    if (days < 0) return 'text-red-400 font-bold';
    if (days <= 7) return 'text-red-400';
    if (days <= 15) return 'text-yellow-400';
    return 'text-gray-300';
}

const AlertsTable: React.FC<AlertsTableProps> = ({ vehicles, onVehicleSelect }) => {

  const handleDoubleClick = (vehicle: Vehicle) => {
    const identifier = vehicle.fleetNo || vehicle.regNo;
    if (identifier) {
      onVehicleSelect(identifier);
    }
  };

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3 w-[5%]">S.No.</th>
            <th scope="col" className="px-6 py-3 w-[10%]">Fleet No</th>
            <th scope="col" className="px-6 py-3 w-[10%]">Reg No</th>
            <th scope="col" className="px-6 py-3 w-[30%]">Vehicle Description</th>
            <th scope="col" className="px-6 py-3 w-[10%]">Status</th>
            <th scope="col" className="px-6 py-3 w-[15%]">Expiry Date</th>
            <th scope="col" className="px-6 py-3 w-[20%]">Days Remaining</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle, index) => {
            const expiryDate = parseVehicleDate(vehicle.registrationExpiry);
            const { days, text } = getDaysRemaining(expiryDate);
            const daysClass = getDaysRemainingClass(days);

            return (
              <tr 
                key={vehicle.fleetNo || vehicle.regNo || index} 
                className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                onDoubleClick={() => handleDoubleClick(vehicle)}
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium whitespace-nowrap">{vehicle.fleetNo || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.regNo || 'N/A'}</td>
                <td className="px-6 py-4">{vehicle.vehicleDescription || 'N/A'}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getStatusBadgeClass(vehicle.status)}`}>
                      {vehicle.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">{formatDate(expiryDate)}</td>
                <td className={`px-6 py-4 font-semibold ${daysClass}`}>{text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AlertsTable;
