import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

let API_URL = import.meta.env.VITE_API_URL;
let ROUTE = import.meta.env.VITE_API_CITY_MANAGER_ROUTE;

const AssignTeamModal = ({ complaintId, onClose, refresh }) => {
  const [zones, setZones] = useState([]);
  const [teams, setTeams] = useState([]);

  const [selectedZone, setSelectedZone] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const [loading, setLoading] = useState(false);

  // ✅ fetch nearby zones
  const fetchZones = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${API_URL}${ROUTE}/complaints/${complaintId}/nearby-zones`,
        { withCredentials: true }
      );

      setZones(data.zones);
      setLoading(false);

    } catch (err) {
      setLoading(false);
      toast.error("Failed to fetch zones");
    }
  };

  // ✅ fetch teams
  const fetchTeams = async (zoneId) => {
    try {
      const { data } = await axios.get(
        `${API_URL}${ROUTE}/zones/${zoneId}/teams`,
        { withCredentials: true }
      );

      setTeams(data.teams);

    } catch (err) {
      toast.error("Failed to fetch teams");
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchTeams(selectedZone);
    }
  }, [selectedZone]);

  // ✅ assign
  const handleAssign = async () => {
    if (!selectedTeam) {
      return toast.error("Select a team");
    }

    try {
      setLoading(true);

      let response = await axios.post(
        `${API_URL}${ROUTE}/complaints/${complaintId}/assign`,
        { teamId: selectedTeam },
        { withCredentials: true }
      );

      toast.success("Team assigned successfully");
      onClose();
      refresh();

    } catch (error) {
      toast.error("Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white p-6 rounded-xl w-112.5">

        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-lg">Assign Team</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}

        {/* ZONE DROPDOWN */}
        <div className="mb-3">
          <label className="text-sm">Select Zone</label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="">Select Zone</option>
            {zones.map(z => (
              <option key={z._id} value={z._id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        {/* TEAM DROPDOWN */}
        <div className="mb-4">
          <label className="text-sm">Select Team</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="">Select Team</option>
            {teams.map(t => (
              <option key={t._id} value={t._id}>
                {t.name} (Active: {t.activeCount})
              </option>
            ))}
          </select>
        </div>

        {/* ACTION */}
        <button
          onClick={handleAssign}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Assign Team
        </button>

      </div>
    </div>
  );
};

export default AssignTeamModal;