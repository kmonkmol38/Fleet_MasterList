import React from 'react';
import { Vehicle } from '../types';
import { getStatusBadgeClass } from '../utils/styleUtils';
import { parseVehicleDate, formatDate } from '../utils/dateUtils';

interface VehicleInfoCardProps {
  vehicle: Vehicle;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode; valueClassName?: string }> = ({ label, value, valueClassName = '' }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-700 last:border-b-0">
        <dt className="w-full sm:w-1/3 text-sm text-gray-400 font-medium">{label}</dt>
        <dd className={`w-full sm:w-2/3 mt-1 sm:mt-0 text-md text-white ${valueClassName}`}>
            {value !== null && value !== undefined && value !== '' && value !== 'N/A' ? value : <span className="text-gray-500">N/A</span>}
        </dd>
    </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="text-lg font-semibold text-cyan-300 mt-6 mb-2 pt-4 border-t border-cyan-700/50">{title}</h3>
);

const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({ vehicle }) => {
    const statusBadgeClass = getStatusBadgeClass(vehicle.status);

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                <div className="lg:col-span-2 p-6">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-1">{vehicle.vehicleDescription}</h2>
                    <p className="text-gray-400 mb-6">{vehicle.brand} {vehicle.vehicleModel} ({vehicle.yom})</p>

                    <dl>
                        <InfoRow label="Reg No" value={vehicle.regNo} />
                        <InfoRow label="Fleet No" value={vehicle.fleetNo} />
                        <InfoRow label="Status" value={
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusBadgeClass}`}>
                                {vehicle.status}
                            </span>
                        } />

                        <SectionHeader title="Assignment Details" />
                        <InfoRow label="User" value={vehicle.user} />
                        <InfoRow label="Designation" value={vehicle.designation} />
                        <InfoRow label="Position" value={vehicle.position} />
                        <InfoRow label="Contact Number" value={vehicle.contactNumber} />
                        <InfoRow label="Business Unit" value={vehicle.businessUnit} />
                        <InfoRow label="Project" value={vehicle.project} />

                        <SectionHeader title="Vehicle Specifications" />
                        <InfoRow label="Chassis No" value={vehicle.chassisNo} />
                        <InfoRow label="Engine No" value={vehicle.engineNo} />
                        <InfoRow label="Seating Capacity" value={vehicle.seatingCapacity} />
                        <InfoRow label="GPS" value={vehicle.gps} />
                        <InfoRow label="Vehicle Owner" value={vehicle.vehicleOwner} />
                        
                        <SectionHeader title="Contract & Dates" />
                        <InfoRow label="Registration Expiry" value={formatDate(parseVehicleDate(vehicle.registrationExpiry))} />
                        <InfoRow label="Insurance Expiry" value={formatDate(parseVehicleDate(vehicle.insuranceExpiry))} />
                        <InfoRow label="On-Hire Date" value={formatDate(parseVehicleDate(vehicle.onHireDate))} />
                        <InfoRow label="Off-Hire Date" value={formatDate(parseVehicleDate(vehicle.offHireDate))} />
                        <InfoRow label="Custody Date" value={formatDate(parseVehicleDate(vehicle.custodyDate))} />
                        <InfoRow label="Rent Amount (QAR)" value={vehicle.rentAmount?.toLocaleString()} />
                        
                        <SectionHeader title="Fuel Details" />
                        <InfoRow label="Fuel Type" value={vehicle.fuelType} />
                        <InfoRow label="Fuel Limit (Liters)" value={vehicle.fuelLimit} />
                        <InfoRow label="Fuel Sensor Owner" value={vehicle.fuelSensorOwner} />
                    </dl>
                </div>
                
                <div className="lg:col-span-1 p-6 bg-gray-800/50 flex flex-col justify-center items-center">
                    <img
                        src={vehicle.vehiclePhoto}
                        alt={`${vehicle.vehicleDescription}`}
                        className="w-full h-64 object-cover rounded-lg shadow-lg border-2 border-gray-700"
                    />
                     <p className="text-sm text-gray-500 mt-4">Vehicle Photo</p>
                </div>
            </div>
        </div>
    );
};

export default VehicleInfoCard;