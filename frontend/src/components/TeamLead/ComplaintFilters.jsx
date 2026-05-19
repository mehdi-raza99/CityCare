const ComplaintFilters = ({
  filters,
  setFilters,
  setPage,
  teams,
  onReset,
}) => {

  const handleChange = (e) => {
    setPage(1);
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };
 
  return (
    <div className="space-y-3">

      {/* FILTERS GRID */}
      <div className="grid md:grid-cols-4 gap-4">

        {/* STATUS */}
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="Assigned">Assigned</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
          <option value="Reassigned">Reassigned</option>
        </select>

        {/* DATE */}
        <select
          name="dateFilter"
          value={filters.dateFilter}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">Last Week</option>
          <option value="month">This Month</option>
        </select>

        {/* TEAM */}
        <select
          name="team"
          value={filters.team}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.teamName}
            </option>
          ))}
        </select>
        
        {/* _id SEARCH */}
        <input
          type="text"
          name="_id"
          placeholder="Search by _id..."
          value={filters._id}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        {/* CATEGORY SEARCH */}
        <input
          type="text"
          name="category"
          placeholder="Search by category..."
          value={filters.category}
          onChange={handleChange}
          className="p-2 border rounded md:col-span-3"
        />

      </div>

      {/* RESET BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm bg-red-400 hover:bg-red-500 rounded cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

    </div>
  );
};

export default ComplaintFilters;