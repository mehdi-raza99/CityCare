const CMTable = ({  complaints, onViewHistory, onAssignTeam, onUpdateStatus  }) => {

  return (
    <div className="bg-white rounded shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100 text-sm">
          <tr>
            <th className="p-3 text-left">id</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Zone</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Team</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {complaints.map(c => (
            <tr key={c._id} className="border-t">

              <td className="p-3">{c._id}</td>
              <td className="p-3">{c.category}</td>
              <td className="p-3">{c.zone?.name}</td>

              <td className="p-3">{c.CurrentStatus}</td>

              <td className="p-3">
                {c.assignedTeam
                  ? c.assignedTeam.name
                  : (
                    <button 
                    onClick={() => onAssignTeam(c._id)}
                    className="text-blue-600">
                      Assign Team
                    </button>
                  )}
              </td>

              <td className="p-3 text-center space-x-2">

                <button
                  onClick={() => onViewHistory({complaintId: c._id,media: c.media,resolvedMedia: c.resolvedMedia})}
                  className="text-blue-600"
                >
                  History
                </button>

               <button
  onClick={() => onUpdateStatus(c)}
  className="text-green-600"
>
  Update
</button>

              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default CMTable;