import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

import CMFilters from "../../components/CityManager/CMFilters";
import CMTable from "../../components/CityManager/CMTable";
import ComplaintHistoryModal from "../../components/CityManager/ComplaintHistoryModal";
import AssignTeamModal from "../../components/CityManager/AssignTeamModal";
import Pagination from "../../components/TeamLead/Pagination";
import Loader from "../../components/utilities/Loader";
import UpdateStatusModal from "../../components/CityManager/UpdateStatusModal";
let API_URL = import.meta.env.VITE_API_URL; 
let ROUTE = import.meta.env.VITE_API_CITY_MANAGER_ROUTE;

const Complaints = () => {

  const { user } = useSelector(state => state.user);

  const [filters, setFilters] = useState({
    category: "",
    zone: "",
    team: "",
    unassigned: false,
    outOfService: "",
    date: "", 
    status: "",
    _id: ""
  });

  const [debounced, setDebounced] = useState(filters);
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState({});
  const [selectedAssign, setSelectedAssign] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  // ✅ debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(filters);
    }, 500);

    return () => clearTimeout(t);
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      let resonse = await axios.get(`${API_URL}${ROUTE}/complaints`, {
        withCredentials: true,
        params: {
            ...debounced,
            city: user?.emCity,
            page,
            limit: 5
        }
      });
      console.log("complaints: ", resonse.data.complaints);
      setComplaints(resonse.data.complaints);
      setTotalPages(resonse.data.totalPages);

    } catch (err) {
      console.error("errrr",err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [debounced, page]);

  return (
    <div className="p-4 max-w-7xl mx-auto">

      <Loader isOpen={loading} />

      <CMFilters filters={filters} setFilters={setFilters} />

      <CMTable
        complaints={complaints}
        onViewHistory={setSelectedHistory}
        onAssignTeam={setSelectedAssign}
        onUpdateStatus={setSelectedUpdate}
      />

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      {/* check selectedHistory is empty or not */}
      {Object.keys(selectedHistory).length > 0 && (
        <ComplaintHistoryModal
          Complaint={selectedHistory}
          onClose={() => setSelectedHistory({})}
        />
      )}
      {selectedAssign && (
        <AssignTeamModal
          complaintId={selectedAssign}
          onClose={() => setSelectedAssign(null)}
          refresh={fetchComplaints}   // ✅ auto refresh after assign
        />
      )}
      {selectedUpdate && (
  <UpdateStatusModal
    complaint={selectedUpdate}
    onClose={() => setSelectedUpdate(null)}
    refresh={fetchComplaints}
  />
)}

    </div>
  );
};

export default Complaints;