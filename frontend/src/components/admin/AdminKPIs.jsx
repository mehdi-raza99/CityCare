import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faCheckCircle, faClock, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const AdminKPIs = ({ overview }) => {
  if (!overview) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Complaints */}
      <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-5">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Total complaints</h3>
        <div className="text-3xl font-bold text-white mb-2">{overview.totalComplaints.toLocaleString()}</div>
      </div>

      {/* Resolution Rate */}
      <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-5">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Resolution rate</h3>
        <div className="text-3xl font-bold text-white mb-2">{overview.resolutionRate}%</div>
      </div>

      {/* Avg. Resolution Time */}
      <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-5">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Avg. resolution time</h3>
        <div className="text-3xl font-bold text-white mb-2">{overview.averageResolutionTimeHours} hours</div>
      </div>

      {/* Pending / Overdue */}
      <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-5">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Pending</h3>
        <div className="text-3xl font-bold text-white mb-2">{overview.pendingComplaints}</div>
      </div>

      {/* Active Teams */}
      <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-5">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Active Teams</h3>
        <div className="text-3xl font-bold text-white mb-2">{overview.activeTeams}</div>
      </div>
    </div>
  );
};

export default AdminKPIs;
