


import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types';
import { normalizeValue, exportToExcel } from '../services/fleetService';
import SummaryTable from './SummaryTable';
import VehicleReportTable from './VehicleReportTable';
import { Download } from './Icons';

interface SummaryViewProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicleIdentifier: string) => void;
}

type SummaryType = 'businessUnit' | 'supplier' | 'category';

interface SummaryData {
  name: string;
  workingCount: number;
  standbyCount: number;
  total: number;
}

const calculateSummary = (vehicles: Vehicle[], key: keyof Vehicle): SummaryData[] => {
    const groupMap = new Map<string, { workingCount: number; standbyCount: number; total: number }>();

    vehicles.forEach(vehicle => {
        const groupName = (vehicle[key] as string) || 'N/A';
        const normalizedGroupName = normalizeValue(groupName);

        if (!groupMap.has(normalizedGroupName)) {
            groupMap.set(normalizedGroupName, { workingCount: 0, standbyCount: 0, total: 0 });
        }

        const groupData = groupMap.get(normalizedGroupName)!;
        const status = normalizeValue(vehicle.status);

        if (status === 'working') {
            groupData.workingCount++;
        } else if (status === 'standby') {
            groupData.standbyCount++;
        }
        // We only count working and standby in the total for this summary
        if (status === 'working' || status === 'standby') {
            groupData.total++;
        }
    });

    return Array.from(groupMap.entries())
        .map(([_, data], index) => {
             const originalKey = vehicles.find(v => normalizeValue(v[key]) === _)
            return {
                // FIX: Ensure the name property is always a string by casting non-string values.
                // This resolves type errors where `name` could be a number or Date, which is
                // incompatible with the `SummaryData` type and caused `localeCompare` to fail.
                name: String((originalKey ? originalKey[key] : _.charAt(0).toUpperCase() + _.slice(1)) || 'N/A'),
                ...data,
            }
        })
        .sort((a, b) => a.name.localeCompare(b.name));
};

const SummaryView: React.FC<SummaryViewProps> = ({ vehicles, onVehicleSelect }) => {
  const [summaryType, setSummaryType] = useState<SummaryType | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const summaryData = useMemo(() => {
    if (!summaryType) return [];
    let data;
    switch (summaryType) {
      case 'businessUnit':
        data = calculateSummary(vehicles, 'businessUnit');
        break;
      case 'supplier':
        data = calculateSummary(vehicles, 'vehicleOwner');
        break;
      case 'category':
        data = calculateSummary(vehicles, 'subCategory');
        break;
      default:
        data = [];
    }
     // Filter out rows where both working and standby are zero
    return data.filter(item => item.workingCount > 0 || item.standbyCount > 0);
  }, [vehicles, summaryType]);

  const summaryTotals = useMemo(() => {
    if (!summaryData || summaryData.length === 0) {
      return { working: 0, standby: 0, total: 0 };
    }
    return summaryData.reduce(
      (acc, current) => {
        acc.working += current.workingCount;
        acc.standby += current.standbyCount;
        acc.total += current.total;
        return acc;
      },
      { working: 0, standby: 0, total: 0 }
    );
  }, [summaryData]);
  
  const detailVehicles = useMemo(() => {
      if (!selectedGroup || !summaryType) return [];
      
      const key = summaryType === 'businessUnit' ? 'businessUnit' : summaryType === 'supplier' ? 'vehicleOwner' : 'subCategory';

      return vehicles.filter(v => {
          const vehicleValue = v[key] || 'N/A';
          return normalizeValue(vehicleValue) === normalizeValue(selectedGroup)
      });
  }, [vehicles, selectedGroup, summaryType]);

  const handleSelectSummaryType = (type: SummaryType) => {
    setSummaryType(type);
    setSelectedGroup(null); // Reset detail view when changing summary type
  };

  const handleRowClick = (groupName: string) => {
    setSelectedGroup(groupName);
  };
  
  const handleBackToSummary = () => {
    setSelectedGroup(null);
  };
  
  const getGroupHeader = () => {
      switch (summaryType) {
        case 'businessUnit': return 'Business Unit';
        case 'supplier': return 'Supplier';
        case 'category': return 'Vehicle Category';
        default: return '';
      }
  }
  
  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    if (selectedGroup) {
      const dataToExport = detailVehicles.map((vehicle, index) => ({
        'S.No.': index + 1,
        'Fleet No': vehicle.fleetNo,
        'Reg No': vehicle.regNo,
        'Vehicle Description': vehicle.vehicleDescription,
        'User': vehicle.user,
        'Project': vehicle.project,
        'Status': vehicle.status,
      }));
      const fileName = `Details_${summaryType}_${selectedGroup}_${date}`;
      exportToExcel(dataToExport, fileName);
    } else if (summaryData.length > 0) {
      const dataToExport = summaryData.map((item, index) => ({
        'S.No.': index + 1,
        [getGroupHeader()]: item.name,
        'Working': item.workingCount,
        'Standby': item.standbyCount,
        'Total': item.total,
      }));
      const fileName = `Summary_by_${summaryType}_${date}`;
      exportToExcel(dataToExport, fileName);
    }
  };

  const renderContent = () => {
    if (selectedGroup) {
      return (
        <div className="space-y-4">
           <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Details for {getGroupHeader()}: <span className="text-cyan-400">{selectedGroup}</span></h2>
                <button 
                    onClick={handleBackToSummary}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                >
                    &larr; Back to Summary
                </button>
           </div>
          <VehicleReportTable vehicles={detailVehicles} onVehicleSelect={onVehicleSelect} />
        </div>
      );
    }

    if (summaryType) {
      return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Summary by {getGroupHeader()}</h2>
            <SummaryTable data={summaryData} groupHeader={getGroupHeader()} onRowClick={handleRowClick} totals={summaryTotals} />
        </div>
      );
    }
    
    return (
        <div className="text-center text-gray-500 py-16 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
            <p>Please select a summary type to view the report.</p>
        </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex-grow flex flex-col sm:flex-row items-center gap-4">
                 <h2 className="text-lg font-semibold text-gray-300 flex-shrink-0">View Summary By:</h2>
                 <div className="flex items-center gap-2">
                    <button onClick={() => handleSelectSummaryType('businessUnit')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${summaryType === 'businessUnit' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Business Unit wise</button>
                    <button onClick={() => handleSelectSummaryType('supplier')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${summaryType === 'supplier' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Supplier Wise</button>
                    <button onClick={() => handleSelectSummaryType('category')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${summaryType === 'category' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Vehicle Category wise</button>
                </div>
             </div>
             <button 
                onClick={handleExport}
                disabled={!summaryType || (selectedGroup ? detailVehicles.length === 0 : summaryData.length === 0)}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
             >
                <Download className="w-4 h-4" />
                Export to Excel
             </button>
        </div>

        {renderContent()}
    </div>
  );
};

export default SummaryView;