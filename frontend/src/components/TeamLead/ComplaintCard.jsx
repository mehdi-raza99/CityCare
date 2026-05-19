import { useNavigate } from "react-router-dom";

const ComplaintCard = ({ complaint , btndisabled}) => {
  const navigate = useNavigate();

  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "In-Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Assigned":
        return "bg-blue-100 text-blue-700";
      case "Review":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col border rounded-lg shadow-sm hover:shadow-md transition bg-white overflow-hidden">

      {/* IMAGE (smaller height) */}
      <div className="w-full h-36 bg-gray-200">
        {complaint.media?.length > 0 ? (
          <img
            src={complaint.media[0].url}
            alt="complaint"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col grow p-3 space-y-1">

        {/* TITLE + STATUS */}
        <div className="flex justify-between items-center gap-2">
          <h2 className="font-semibold text-sm truncate">
            {`id: ${complaint._id}`}
          </h2>
           
          <span
            className={`px-2 py-0.5 text-[10px] rounded-full ${getStatusStyle(
              complaint.CurrentStatus
            )}`}
          >
            {complaint.CurrentStatus}
          </span>
        </div>

        {/* CITY + ZONE */}
        <p className="text-xs text-gray-500 truncate">
          📍 {complaint.city?.name || complaint.city} |{" "}
          {complaint.zone?.name}
        </p>
        {/* category */}
        <p className="text-xs font-medium text-gray-600">
          {complaint.category}
        </p>

        {/* DESCRIPTION (controlled height) */}
        <p className="text-xs text-gray-700 line-clamp-2">
          {complaint.description}
        </p>

        {/* META */}
        <div className="text-[11px] text-gray-500 grid grid-cols-2 gap-4">
          <span>👍 {complaint.votes}</span>
          <span>Team: {complaint.assignedTeam?.name}</span>
        </div>

        {/* ADDRESS (limit) */}
        <p className="text-[10px] text-gray-400 line-clamp-1">
          {complaint.addressDescription}
        </p>
        {/* Created at  */}
        <p className="text-[10px] text-gray-400">
          Created: {new Date(complaint.createdAt).toLocaleDateString()}
        </p>
        {/* updated at */}
        <p className="text-[10px] text-gray-400">
          Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
        </p>
        {/* PUSH BUTTON DOWN */}
        <div className="mt-auto pt-2">
          {!btndisabled && <button
            
            onClick={() => navigate(`/teamLead/complaints/update/${complaint._id}`)}
             className="w-full bg-blue-600 text-white py-1.5 rounded text-xs"
           >
             Update Status
            </button>}
        </div>

      </div>
    </div>
  );
};

export default ComplaintCard;