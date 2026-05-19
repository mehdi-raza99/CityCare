import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
let API_URL = import.meta.env.VITE_API_URL;
let ROUTE = import.meta.env.VITE_API_CITY_MANAGER_ROUTE;

// from redux store also get city and pass it as prop to this component to fetch teams of that city only
 

const CMFilters = ({ filters, setFilters}) => {

    let { user } = useSelector(state => state.user);

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await axios.get(`${API_URL}${ROUTE}/teams`, {
        withCredentials: true,
        params: { city: user?.emCity }

      });
      console.log("dta:",data);
      setTeams(data.data);
    };
    fetchTeams();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">

      <input
        placeholder="Search Category"
        value={filters.category}
        onChange={(e) =>
          setFilters(p => ({ ...p, category: e.target.value }))
        }
        className="border p-2 rounded"
      />
      <input
        placeholder="Search _id"
        value={filters._id}
        onChange={(e) =>
          setFilters(p => ({ ...p, _id: e.target.value }))
        }
        className="border p-2 rounded"
      />

      <input
        placeholder="Search Zone"
        value={filters.zone}
        onChange={(e) =>
          setFilters(p => ({ ...p, zone: e.target.value }))
        }
        className="border p-2 rounded"
      />

      <select
        value={filters.team}
        onChange={(e) =>
          setFilters(p => ({ ...p, team: e.target.value }))
        }
        className="border p-2 rounded"
      >
        <option value="">All Teams</option>
        {teams?.map(t => (
          <option key={t._id} value={t._id}>{t.name}</option>
        ))}
      </select>

      <select
      className="border"
        value={filters.outOfService}
        onChange={(e) =>
          setFilters(p => ({ ...p, outOfService: e.target.value }))
        }
      >
        <option value="">All</option>
        <option value="true">Out of Service</option>
        <option value="false">Active Zones</option>
      </select>

      <select
      className="border"
        value={filters.date}
        onChange={(e) =>
          setFilters(p => ({ ...p, date: e.target.value }))
        }
      >
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="">All time</option>
      </select>
      {/* Drop down for CurrentStatus : "Pending", "In-Progress", "Resolved", "Rejected", "Assigned", "Review"*/}
      <select
      className="border"
        value={filters.status}
        onChange={(e) =>
          setFilters(p => ({ ...p, status: e.target.value }))
        }
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="In-Progress">In-Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Rejected">Rejected</option>
        <option value="Assigned">Assigned</option>
        <option value="Reassigned">Reassigned</option>
      </select>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filters.unassigned}
          onChange={(e) =>
            setFilters(p => ({ ...p, unassigned: e.target.checked }))
          }
        />
        Unassigned Only
      </label>

    </div>
  );
};

export default CMFilters;