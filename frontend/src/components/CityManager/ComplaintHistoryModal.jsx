import { useEffect, useState } from "react";
import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL;
let ROUTE = import.meta.env.VITE_API_CITY_MANAGER_ROUTE;

import fallbackImg from "../../assets/NOimg.jpg";

const ComplaintHistoryModal = ({ Complaint, onClose }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await axios.get(
        `${API_URL}${ROUTE}/complaints/${Complaint.complaintId}/history`,
        { withCredentials: true }
      );
      setHistory(data.history);
    };

    fetchHistory();
  }, []);

  // ✅ images logic
  const beforeImg = Complaint.media?.[0]?.url || fallbackImg;
  const afterImg = Complaint.resolvedMedia?.[0]?.url || fallbackImg;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl shadow-lg w-225 max-h-[90vh] overflow-y-auto p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Complaint Details</h2>
          <button onClick={onClose} className="text-red-500 text-lg">✕</button>
        </div>

        {/* 🔥 TOP IMAGES */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <div>
            <p className="text-sm text-gray-500 mb-1">Before</p>
            <img
              src={beforeImg}
              className="w-[80%] h-60 object-cover rounded-lg border"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">After</p>
            <img
              src={afterImg}
              className="w-[90%] h-60 object-cover rounded-lg border"
            />
          </div>

        </div>

        {/* 🔥 HISTORY TIMELINE */}
        <div className="space-y-4">

          {history.length > 0 ? history.map(h => (

            <div key={h._id} className="border rounded-lg p-4 shadow-sm">

              {/* STATUS */}
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold">
                  {h.oldStatus || "N/A"} → {h.newStatus}
                </p>

                <p className="text-xs text-gray-500">
                  {new Date(h.createdAt).toLocaleString()}
                </p>
              </div>

              {/* TEAM + ACTOR */}
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Team:</span>{" "}
                {h.team?.name || "N/A"}
              </div>

              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Acted By:</span>{" "}
                {h.actedBy?.fullName || "System"}
              </div>

              {/* REMARKS */}
              <div className="mt-2 bg-gray-50 border rounded p-2 text-sm">
                {h.remarks || "No remarks provided"}
              </div>

            </div>

          )) : (
            <p className="text-center text-gray-500">
              No history found
            </p>
          )}

        </div>

        {/* FOOTER */}
        <button
          onClick={onClose}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded w-full"
        >
          Close
        </button>

      </div>
    </div>
  );
};

export default ComplaintHistoryModal;