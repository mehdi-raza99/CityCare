import { useEffect, useState } from "react";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
const complainanatRoute = import.meta.env.VITE_API_COMPLAINANT_ROUTE;

const STATUS_FILTERS = [
  "All",
  "Assigned",
  "In-Progress",
  "Resolved",
  "Rejected",
];

export default function ComplaintHistory() {
  const [activeTab, setActiveTab] = useState("my"); // my | area | voted
  const [statusFilter, setStatusFilter] = useState("All");

  const [myComplaints, setMyComplaints] = useState([]);
  const [areaComplaints, setAreaComplaints] = useState([]);
  const [votedComplaints, setVotedComplaints] = useState([]);

  const [loading, setLoading] = useState(false);

  

  // 🔹 Fetch Data
  const fetchComplaints = async () => {
    try {
      setLoading(true);
     
      let link = `${apiUrl}${complainanatRoute}/complaint-made`;
    //   1st we only fetch complaints made by user,  on client side to avoid multiple api calls. and test ui

         const myRes = await axios.get(link, { withCredentials: true });
         const areaRes = await axios.get(`${apiUrl}${complainanatRoute}/complaints-of-user-area`, { withCredentials: true });
        const votedRes = await axios.get(`${apiUrl}${complainanatRoute}/complaints-voted`, { withCredentials: true });       

    

      const myData = await myRes.data.data;
    //   console.log("My Complaints from api:", myData.data);
      const areaData = await areaRes.data.data;
      
      const votedData = await votedRes.data.data;
      console.log("Voted Complaints from api:", votedData);

      setMyComplaints(myData || []);
      setAreaComplaints( areaData || []);
      setVotedComplaints( votedData || []);

    // console.log("My data:",myData);
    // console.log("Area data:",areaData);
    console.log("Voted data:",votedData);
    

    } catch (err) {
      console.error(err.response?.data || "An error occurred while fetching complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);
  




  // 🔹 Filter Logic
  const getFilteredComplaints = () => {
    let data = [];

    if (activeTab === "my") data = myComplaints;
    else if (activeTab === "area") data = areaComplaints;
    else if (activeTab === "voted") data = votedComplaints;

    if (statusFilter === "All") return data;

    

    return data.filter(
      (c) => c.CurrentStatus === statusFilter
    );
  };



  const complaints = getFilteredComplaints();
  

  return (
    <div className="p-4 md:p-6">
      {/* 🔹 Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        <TabBtn
          label="Complaints made by you"
          active={activeTab === "my"}
          onClick={() => setActiveTab("my")}
        />
        <TabBtn
          label="Complaints in your area"
          active={activeTab === "area"}
          onClick={() => setActiveTab("area")}
        />
        <TabBtn
          label="Complaints voted by you"
          active={activeTab === "voted"}
          onClick={() => setActiveTab("voted")}
        />
      </div>
      

      {/* 🔹 Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-full text-sm border ${
              statusFilter === status
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 🔹 Content */}
      {loading ? (
        <EmptyState message="Loading complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          message={
            activeTab === "my"
              ? "You have not submitted any complaints yet."
              : activeTab === "area"
              ? "No complaints found in your area."
              : "You have not voted on any complaints yet."
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} data={complaint} activeTab={activeTab} />
          ))}
        </div>
      )}
    </div>
  );
}




/* 🔹 Reusable Components */

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border ${
        active ? "bg-black text-white" : "bg-white"
      }`}
    >
      {label}
    </button>
  );
}


function EmptyState({ message }) {
  return (
    <div className="text-center py-20 text-gray-500">
      {message}
    </div>
  );
}



function ComplaintCard({ data, activeTab }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [cloading, setcLoading] = useState(false);

  const isResolvedMyTab =
    activeTab === "my" && data.CurrentStatus === "Resolved";

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || rating === 0) {
      alert("Please provide rating and feedback");
      return;
    }

    try {
      setcLoading(true);

      console.log("Submitting feedback:", { complaintId: data._id, feedback, rating });
      let link= `${apiUrl}${complainanatRoute}/feedback-posted`;
        await axios.post(link, {
          complaintId: data._id,
          text: feedback,
          rating,
        }, { withCredentials: true }).then((res) => {
          console.log("Feedback response:", res.data);
        }).catch((err) => {
          console.log("Feedback error:", err.response ? err.response.data : err.message);
        });


      setSubmitted(true);
      setShowFeedback(false);
    } catch (err) {
      // console.error(err);
    } finally {
      setcLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
      
      {/* Image */}
      <div className="h-48 bg-gray-200">
        {data.media?.length > 0 ? (
          <img
            src={data.media[0].url}
            alt="complaint"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 text-sm">
        <p><b>Category:</b> {data.category}</p>
        <p><b>Description:</b> {data.description}</p>

        <p>
          <b>Status:</b>{" "}
          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(data.CurrentStatus)}`}>
            {data.CurrentStatus}
          </span>
        </p>
        {/* date */}
        <p>
          <b>Created:</b>{" "}
          {new Date(data.createdAt).toLocaleDateString()}
        </p>

        <p><b>Votes:</b> {data.votes}</p>

        {/* ⭐ Feedback + Rating */}
        {isResolvedMyTab && !submitted && (
          <div className="mt-3 space-y-2">
            {!showFeedback ? (
              <button
                onClick={() => setShowFeedback(true)}
                className="text-sm bg-green-500 text-white px-3 py-1 rounded"
              >
                Give Feedback
              </button>
            ) : (
              <>
                {/* ⭐ Star Rating */}
                <div className="flex gap-1 text-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      className={`cursor-pointer ${
                        star <= rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* 📝 Textarea */}
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your feedback..."
                  className="w-full border p-2 rounded text-sm"
                />

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={cloading}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    {cloading ? "Submitting..." : "Submit"}
                  </button>

                  <button
                    onClick={() => setShowFeedback(false)}
                    className="bg-gray-300 px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ✅ After Submit */}
        {submitted && (
          <div className="mt-2 text-sm">
            <p className="text-green-600">Feedback submitted ✅</p>

            {/* ⭐ Show Rating */}
            <div className="flex text-yellow-400">
              {[...Array(rating)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>

            {/* 📝 Show Feedback */}
            <p className="text-gray-600 mt-1">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "Assigned":
      return "bg-yellow-100 text-yellow-700";
    case "In-Progress":
      return "bg-blue-100 text-blue-700";
    case "Resolved":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}