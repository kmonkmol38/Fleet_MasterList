import React from 'react';
import { Vehicle } from '../types';
import { getStatusBadgeClass } from '../utils/styleUtils';

interface VehicleReportTableProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicleIdentifier: string) => void;
}

const VehicleReportTable: React.FC<VehicleReportTableProps> = ({ vehicles, onVehicleSelect }) => {
  if (vehicles.length === 0) {
    return <p className="text-center text-gray-400 py-8">No vehicles to display for the selected filter.</p>;
  }

  const handleDoubleClick = (vehicle: Vehicle) => {
    const identifier = vehicle.fleetNo || vehicle.regNo;
    if (identifier) {
      onVehicleSelect(identifier);
    }
  };

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
      <table className="min-w-full text-sm text-left text-gray-300 table-fixed">
        <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3 w-[4%]">S.No.</th>
            <th scope="col" className="px-6 py-3 w-[9%]">Fleet No</th>
            <th scope="col" className="px-6 py-3 w-[9%]">Reg No</th>
            <th scope="col" className="px-6 py-3 w-[28%]">Vehicle Description</th>
            <th scope="col" className="px-6 py-3 w-[18%]">User</th>
            <th scope="col" className="px-6 py-3 w-[12%]">Project</th>
            <th scope="col" className="px-6 py-3 w-[10%]">Status</th>
            <th scope="col" className="px-6 py-3 w-[10%] text-right">Rent Amount (QAR)</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle, index) => (
            <tr 
              key={vehicle.fleetNo || vehicle.regNo || index} 
              className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer"
              onDoubleClick={() => handleDoubleClick(vehicle)}
            >
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4 font-medium whitespace-normal break-words">{vehicle.fleetNo || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-normal break-words">{vehicle.regNo || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-normal break-words">{vehicle.vehicleDescription || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-normal break-words">{vehicle.user || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-normal break-words">{vehicle.project || 'N/A'}</td>
              <td className="px-6 py-4">
                 <span className={`px-2 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getStatusBadgeClass(vehicle.status)}`}>
                    {vehicle.status || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">{vehicle.rentAmount?.toLocaleString() || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleReportTable;