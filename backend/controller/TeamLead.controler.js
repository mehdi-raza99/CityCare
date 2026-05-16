import teamModel from "../model/team.model.js";
import employeeModel from "../model/employee.model.js";
import complaintModel from "../model/complaint.model.js";
import zoneModel from "../model/zone.model.js";
import complaintHistoryModel from "../model/complaint-history.model.js";
import { uploadMedia } from "../utils/mediaUpload.js";  
import Request  from "../model/requests.model.js";
import { sendResetEmail } from "../utils/resetPassEmail.js";

let getTeamsForTeamLead = async (req, res,next) => {
   try {
  
    let teamLeadId = req.user?.employeeId;
    let teams = await teamModel.find({ leader: teamLeadId })
    .populate("leader", "fullName")
    .populate("zone", "name")
    .populate("city", "name")
    .populate("members", "fullName skills");

    if(teams.length === 0){
        return res.status(404).json({ success: false, message: "No teams found for this team lead." });
    }

    let formattedTeams = teams.map(team => ({
        _id: team._id,
        teamName: team.name,
        teamLeadName: team.leader.fullName,
        cityName: team.city.name,
        zoneName: team.zone ? team.zone.name : "N/A",
        members: team.members.map(member => ({
            name: member.fullName,
            skill: member.skills
        }))
    }));
    res.status(200).json({ success: true, teams: formattedTeams });
   } catch (error) {
    next(error);
   }

}

let getComplaintsForTeamLead = async (req, res, next) => {
  try {
    let teamLeadId = req.user?.employeeId;

    let { 
      status, 
      team, 
      dateFilter, 
      category,   // 🔥 NEW
      page = 1, 
      limit = 10 
    } = req.query;
   
    // ✅ Get teams under team lead
    let teams = await teamModel.find({ leader: teamLeadId }).select("_id city");

    let teamIds = teams.map(t => t._id);

    let query = {
      assignedTeam: { $in: teamIds }
    };

    // ✅ STATUS FILTER
    if (status) {
      query.CurrentStatus = status;
    }

    // ✅ TEAM FILTER
    if (team) {
      query.assignedTeam = team;
    }

    // ✅ DATE FILTER
    if (dateFilter) {
      let now = new Date();
      let startDate;

      if (dateFilter === "today") {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      } 
      else if (dateFilter === "yesterday") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
      } 
      else if (dateFilter === "week") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } 
      else if (dateFilter === "month") {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // ✅ 🔥 ZONE SEARCH FILTER
    // if (zoneSearch) {
    //   // find zones matching search
    //   let zones = await zoneModel.find({
    //     name: { $regex: zoneSearch, $options: "i" }
    //   }).select("_id");

    //   let zoneIds = zones.map(z => z._id);

    //   query.zone = { $in: zoneIds };
    // }
    if (category) {
      //  forget zone thing we seaech by category in complaint model
      query.category = { $regex: category, $options: "i" };
    }
    // ✅ PAGINATION
    let skip = (page - 1) * limit;

    let complaints = await complaintModel
      .find(query)
      .populate("assignedTeam", "name")
      .populate("zone", "name")
      .populate("city", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    let total = await complaintModel.countDocuments(query);

    res.status(200).json({
      success: true,
      complaints,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    next(error);
  }
};

let getComplaintWithHistory = async (req, res, next) => {
  try {
    let { id } = req.params;
   console.log("Fetching details for complaint ID: ", id);
    let complaint = await complaintModel
      .findById(id)
      .populate("zone", "name")
      .populate("city", "name")
      .populate("assignedTeam", "name");

    let history = await complaintHistoryModel
      .find({ complaint: id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaint,
      history
    });

  } catch (err) {
    next(err);
  }
};
let updateComplaintStatus = async (req, res, next) => {
  let resolvedMediaUrls = [];
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const files = req.files; // Access uploaded files
    
    if (status === "Resolved") {
      resolvedMediaUrls = await uploadMedia(files);   
    }
    // also populate name for complainant
    let complaint = await complaintModel.findById(id).populate("complainant", "fullName");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }
    console.log(complaint)
    let oldStatus = complaint.CurrentStatus;
    console.log("old status: ", oldStatus, " new status: ", status);
    
    if (status === "Resolved") {
      complaint.resolvedMedia = resolvedMediaUrls;
      let mailOptions = {
        to: "citycareforyou@gmail.com",// for testing
        subject: "Your complaint has been resolved",
        text: `Hello ${complaint?.complainant?.fullName},\n\nYour complaint with ID ${complaint._id} of category: ${complaint.category} with description: ${complaint.description} , has been marked as Resolved. If you have any further issues, please feel free to contact us.\n\nBest regards,\nCityCare Team`
      };
      await sendResetEmail(mailOptions);
      }
    complaint.CurrentStatus = status;

    await complaint.save();

    // complaint history entry
    await complaintHistoryModel.create({
      complaint: id,
      actionType: "STATUS_CHANGED",
      oldStatus,
      newStatus: status,
      remarks,
      actedBy: req.user?.employeeId,
      team: complaint.assignedTeam
    });

    res.status(200).json({
      success: true,
      message: "Status updated"
    });


  } catch (error) {
    next(error);
  }

};

const getTeamIds = async (teamLeadId) => {
  const teams = await teamModel.find({ leader: teamLeadId }).select("_id");
  return teams.map(t => t._id);
};

// ✅ DASHBOARD SUMMARY
 const getDashboardSummary = async (req, res) => {
  try {
    const teamIds = await getTeamIds(req.user.employeeId);

    if (teamIds.length === 0) {
      return res.json({
        total: 0,
        stats: [],
        avgResolutionTime: 0,
        categoryStats: []
      });
    }

    const match = {
      assignedTeam: { $in: teamIds },
      outOfServiceZone: false
    };

    // Status stats
    const stats = await complaintModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$CurrentStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    // Total
    const total = await complaintModel.countDocuments(match);

    // Avg resolution time
    const resolved = await complaintModel.aggregate([
      {
        $match: { ...match, CurrentStatus: "Resolved" }
      },
      {
        $project: {
          time: { $subtract: ["$updatedAt", "$createdAt"] }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$time" }
        }
      }
    ]);

    // Category breakdown
    const categoryStats = await complaintModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      total,
      stats,
      avgResolutionTime: resolved[0]?.avgTime || 0,
      categoryStats
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ TEAM PERFORMANCE
 const getTeamPerformance = async (req, res) => {
  try {
    const teamIds = await getTeamIds(req.user.employeeId);

    const data = await complaintModel.aggregate([
      {
        $match: {
          assignedTeam: { $in: teamIds },
          outOfServiceZone: false
        }
      },
      {
        $group: {
          _id: "$assignedTeam",
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$CurrentStatus", "Resolved"] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $ne: ["$CurrentStatus", "Resolved"] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "team"
        }
      },
      { $unwind: "$team" },
      {
        $project: {
          teamName: "$team.name",
          total: 1,
          resolved: 1,
          pending: 1
        }
      }
    ]);

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ TREND (DATE-WISE)
const getComplaintTrend = async (req, res) => {
  try {
    const teamIds = await getTeamIds(req.user.employeeId);

    const data = await complaintModel.aggregate([
      {
        $match: {
          assignedTeam: { $in: teamIds },
          outOfServiceZone: false
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


let createRequest = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const teamLead = await employeeModel.findById(req.user.employeeId);

    if (!teamLead) {
      return res.status(404).json({ message: "TeamLead not found" });
    }

    // Find city manager of same city
    const cityManager = await employeeModel.findOne({
      city: teamLead.city,
      role: "cityManager"
    });

    if (!cityManager) {
      return res.status(404).json({ message: "City Manager not found" });
    }

    const request = await Request.create({
      title,
      message,
      fromTeamLead: teamLead._id,
      toCityManager: cityManager._id,
      city: teamLead.city
    });

    res.status(201).json(request);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getTeamLeadRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const filter = {
      fromTeamLead: req.user.employeeId
    };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + "T23:59:59.999Z");
    }

    const requests = await Request.find(filter)
      .populate("toCityManager", "fullName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Request.countDocuments(filter);

    res.json({
      requests,
      total,
      page,
      pages: Math.ceil(total / limit) 
       
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getTeamsForTeamLead, getComplaintsForTeamLead, getComplaintWithHistory,updateComplaintStatus, getTeamPerformance, getComplaintTrend, getDashboardSummary, createRequest, getTeamLeadRequests };    