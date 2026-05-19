import React from 'react';

// Progress bar colors by category conceptually matching the design
const CATEGORY_COLORS = {
  'Roads': 'bg-blue-500',
  'Garbage': 'bg-green-500',
  'Sewage': 'bg-yellow-500',
  'Lights': 'bg-purple-500',
  'Water Supply': 'bg-blue-400',
  'Manhole Issue': 'bg-yellow-600',
  'Pothole': 'bg-gray-400',
  'Street Light': 'bg-purple-400',
  'Garbage Collection': 'bg-green-400',
  'Other': 'bg-gray-500'
};

export const ComplaintsByCategoryList = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No data</div>;

  // Find max count to calculate relative width
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="flex flex-col gap-4 mt-2">
      {data.map((item, index) => {
        const colorClass = CATEGORY_COLORS[item._id] || CATEGORY_COLORS['Other'];
        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        return (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="w-1/4 text-gray-300 font-medium">{item._id}</div>
            <div className="w-2/4 px-2">
              <div className="w-full bg-[#333] rounded-full h-2">
                <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
            <div className="w-1/4 text-right text-gray-300 font-bold">{item.count}</div>
          </div>
        );
      })}
    </div>
  );
};

export const TeamPerformanceTable = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No team performance data available</div>;

  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="text-xs text-gray-500 border-b border-gray-800">
          <tr>
            <th scope="col" className="px-2 py-3 font-medium">Team</th>
            <th scope="col" className="px-2 py-3 font-medium text-right">Resolved</th>
          </tr>
        </thead>
        <tbody>
          {data.map((team, index) => {
            return (
              <tr key={index} className="border-b border-gray-800/50 hover:bg-[#252525]">
                <td className="px-2 py-3 font-medium text-white">{team.teamName || "Unassigned"}</td>
                <td className="px-2 py-3 text-right">{team.resolvedCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
