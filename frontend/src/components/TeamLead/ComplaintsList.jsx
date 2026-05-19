import { useEffect, useState } from "react";
import axios from "axios";
import ComplaintCard from "./ComplaintCard.jsx";
import ComplaintFilters from "./ComplaintFilters.jsx";
import Pagination from "./Pagination.jsx";
import useDebounce  from "../../hooks/useDebounce.js";

let apiUrl = import.meta.env.VITE_API_URL;
let teamLeadRoute = import.meta.env.VITE_API_TEAMLEAD_ROUTE;
const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const defaultFilters = {
  status: "",
  dateFilter: "",
  team: "",
  category: "",
  _id: "",
};
  const [filters, setFilters] = useState(defaultFilters);
  

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedCategory = useDebounce(filters.category, 500);
  const debounced_id = useDebounce(filters._id, 500);

  const handleResetFilters = () => {
  setFilters(defaultFilters);
  setPage(1);
};

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${apiUrl}${teamLeadRoute}/complaints`,
        {
          params: {
            status: filters.status,
            team: filters.team,
            dateFilter: filters.dateFilter,
            category: debouncedCategory || "", // ✅ synced now
            _id: debounced_id || "",
            page,
            limit: 3,
          },
          withCredentials: true,
        }
      );
      console.log("Complaints fetched: ", data.complaints);
      setComplaints(data.complaints);
      setTotalPages(data.totalPages);

    } catch (error) {
      console.error(error.response?.data || "An error occurred while fetching complaints.");
    } finally {
      setLoading(false);
    }
  };
const fetchTeams = async () => {
  try {
    
    const res = await axios.get(`${apiUrl}${teamLeadRoute}/get-teams`, {
      withCredentials: true,
    });
    console.log("Teams fetched: ", res.data.teams);
    setTeams(res.data.teams);

  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
  fetchComplaints();
}, [filters.status, filters.team, filters.dateFilter, debouncedCategory, page, debounced_id]); 
 useEffect(() => {
    fetchTeams();
  }, []);
  return (
    <div className="p-4">

      <ComplaintFilters 
        filters={filters}
        setFilters={setFilters}
        setPage={setPage}
        teams={teams}
        onReset={handleResetFilters}
      />
     {/* add hight of loading in css */}
      {loading ? (
        <p className="text-center mt-6  ">Loading...</p>
      ) : complaints.length === 0 ? (
        <p className="text-center mt-6 text-gray-500">
          No complaints found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
  {complaints.map((c) => (
    <ComplaintCard key={c._id} complaint={c} btndisabled={false} />
  ))}
</div>
      )}

      <Pagination 
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
};

export default ComplaintsList;