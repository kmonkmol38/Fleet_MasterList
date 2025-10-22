


import React from 'react';

interface SummaryData {
  name: string;
  workingCount: number;
  standbyCount: number;
  total: number;
}

interface SummaryTotals {
  working: number;
  standby: number;
  total: number;
}

interface SummaryTableProps {
  data: SummaryData[];
  groupHeader: string;
  onRowClick: (groupName: string) => void;
  totals: SummaryTotals;
}

const SummaryHeader: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className={`flex flex-col items-center justify-center p-2 rounded-md h-full ${colorClass}`}>
      <span className="text-xs text-gray-200 uppercase font-semibold">{label}</span>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
);

const SummaryTable: React.FC<SummaryTableProps> = ({ data, groupHeader, onRowClick, totals }) => {
  if (data.length === 0) {
    return <p className="text-center text-gray-400 py-8">No summary data available for this category.</p>;
  }

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
      {/* Totals Header */}
      <div className="flex p-3 gap-3 border-b border-gray-700">
        <div className="w-[60%] flex-shrink-0"></div> {/* Spacer for S.No + Group Header */}
        <div className="w-[15%] flex-shrink-0">
          <SummaryHeader label="Working" value={totals.working} colorClass="bg-green-600/50" />
        </div>
        <div className="w-[15%] flex-shrink-0">
          <SummaryHeader label="Standby" value={totals.standby} colorClass="bg-yellow-600/50" />
        </div>
        <div className="w-[10%] flex-shrink-0">
          <SummaryHeader label="Total" value={totals.total} colorClass="bg-cyan-600/50" />
        </div>
      </div>
      
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3 w-[5%]">S.No.</th>
            <th scope="col" className="px-6 py-3 w-[55%]">{groupHeader}</th>
            <th scope="col" className="px-6 py-3 w-[15%] text-center">Working</th>
            <th scope="col" className="px-6 py-3 w-[15%] text-center">Standby</th>
            <th scope="col" className="px-6 py-3 w-[10%] text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.name}
              className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer"
              onClick={() => onRowClick(item.name)}
            >
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4 font-medium">{item.name}</td>
              <td className="px-6 py-4 text-center">{item.workingCount}</td>
              <td className="px-6 py-4 text-center">{item.standbyCount}</td>
              <td className="px-6 py-4 text-center font-bold">{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;