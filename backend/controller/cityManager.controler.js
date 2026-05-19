
import teamModel from "../model/team.model.js";
import employeeModel from "../model/employee.model.js";
import zoneModel from "../model/zone.model.js";
import cityModel from "../model/city.model.js";
import Complaint from "../model/complaint.model.js";
import mongoose from "mongoose";
import ComplaintHistory from "../model/complaint-history.model.js";
import Request  from "../model/requests.model.js";
let createTeam = async (req, res, next) => {

    try {
        let { name, leaderId, cityId, zone, members } = req.body;
            
        //check Leadr is a teamLead or not
        let leaderRecord = await employeeModel.findOne({_id: leaderId, role: "teamLead"});
        if(!leaderRecord){
            let error = new Error("Employee is not a team lead");
            error.status = 400;
            return next(error);
        }

        //checking unique team lead and members
        let teamLeadRecord = await teamModel.findOne({leader: leaderId});
        console.log("teamR: ",teamLeadRecord);
        
        if(teamLeadRecord){
            let error = new Error("Team lead is already assigned to another team with id: "+ teamLeadRecord._id);
            error.status = 400;
            return next(error);
        }
        let teamMemberRecord = await teamModel.findOne({members: {$in: members}});
        if(teamMemberRecord){
            let error = new Error("One or more team members are already assigned to another team with id: "+ teamMemberRecord._id);
            error.status = 400;
            return next(error);
        }
        
        let getZoneRecord = await zoneModel.findOne({name: zone});
        let teamRecord = new teamModel({
            name,
            leader: leaderId,
            city: cityId,
            zone: getZoneRecord._id,
            members});
        await teamRecord.save();
        res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: teamRecord
        });

    } catch (error) {
        next(error);
    }

}

let getTeams= async (req, res, next) => {
    try {
        
        let teams = await teamModel.find()
        .populate("leader", "fullName contactNumber")
        .populate("city", "name")
        .populate("zone", "name")
        .populate("members", "fullName contactNumber");
        res.status(200).json({
            success: true,
            data: teams
        });

    } catch (error) {
        next(error);    
    }
}

let getCMComplaints = async (req, res) => {
  try {
    let {
      category,
      zone,
      team,
      unassigned,
      outOfService,
      date,
      page = 1,
      limit = 10,
      city,
      status,
      _id
    } = req.query;

    console.log("getCMComplaints zone: ", zone);

    let query = {};

    // ✅ CATEGORY
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    // ✅ CITY (convert name → _id)
    if (city) {
      const cityDoc = await cityModel.findOne({ name: city }).select("_id");
      if (cityDoc) {
        query.city = cityDoc._id;
      }
    }

    // ✅ ZONE FIX (MAIN FIX 🔥)
    if (zone) {
      const zoneDoc = await zoneModel.findOne({
        name: { $regex: zone, $options: "i" }
      }).select("_id");

      if (zoneDoc) {
        query.zone = zoneDoc._id;
      } else {
        // No zone found → return empty result
        return res.json({ complaints: [], totalPages: 0 });
      }
    }

    // ✅ TEAM
    if (team) query.assignedTeam = team;

    if (unassigned === "true") query.assignedTeam = null;

    // ✅ OUT OF SERVICE
    if (outOfService !== "") {
      query.outOfServiceZone = outOfService === "true";
    }

    // ✅ DATE FILTER
    if (date) {
      let startDate = new Date();

      if (date === "today") startDate.setHours(0, 0, 0, 0);

      if (date === "yesterday") {
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
      }

      if (date === "week") startDate.setDate(startDate.getDate() - 7);

      if (date === "month") startDate.setMonth(startDate.getMonth() - 1);

      query.createdAt = { $gte: startDate };
    }
    if(status){
      query.CurrentStatus = status;
    }
    if(_id){
      query._id = _id;
    }

    // ✅ PAGINATION
    page = Number(page);
    limit = Number(limit);

    let complaints = await Complaint.find(query)
      .populate("zone", "name")
      .populate("assignedTeam", "name")
      .skip((page - 1) * limit)
      .limit(limit);

    let total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

let getComplaintHistory = async (req, res, next) => {
  try {
    let history = await ComplaintHistory.find({
      complaint: req.params.id
    })
      .populate("team", "name")
      .populate("actedBy", "fullName") // 🔥 IMPORTANT
      .sort({ createdAt: -1 });

    res.json({ history });

  } catch (err) {
    next(err);
  }
};

let getALLTeams = async (req, res,next) => {
  try {
    console.log("city: ", req.query.city);
    let cityId = await cityModel.findOne({ name: req.query.city }).select("_id");
    let teams = await teamModel.find({ city: cityId }).select("name _id");
  //  send team names and _id only

     console.log("teams: ", teams);
    res.json({ teams });

    
    
  } catch (error) {
    next(error);
  }
}


const getNearbyZones = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const [lng, lat] = complaint.location.coordinates;

    const zones = await zoneModel.find({
      geometry: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: 5000 // ✅ 5 KM
        }
      },
      isActive: true
    }).select("name");

    res.json({ zones });

  } catch (err) {
    next(err);
  }
};

const getTeamsByZone = async (req, res, next) => {
  try {
    const teams = await teamModel.find({
      zone: req.params.zoneId
    }).select("name");

    const result = [];

    for (let team of teams) {
      const activeCount = await Complaint.countDocuments({
        assignedTeam: team._id,
        CurrentStatus: { $in: ["Assigned", "In-Progress"] }
      });

      result.push({
        ...team.toObject(),
        activeCount
      });
    }

    res.json({ teams: result });

  } catch (err) {
    next(err);
  }
};

const assignTeam = async (req, res, next) => {
  try {
    console.log("jhhh")
    const { teamId } = req.body;
    console.log("Assigning team. Complaint ID: ", req.params.id, " Team ID: ", teamId);

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const oldStatus = complaint.CurrentStatus;

    complaint.assignedTeam = teamId;
    complaint.CurrentStatus = "Assigned";

    await complaint.save();

    // 🔥 Add history
    await ComplaintHistory.create({
      complaint: complaint._id,
      actionType: "ASSIGNED",
      oldStatus,
      newStatus: "Assigned",
      team: teamId,
      actedBy: req.user?.employeeId,
      remarks: "Team Assigned by City Manager"
    });

    res.json({ message: "Team assigned successfully" });

  } catch (err) {
    next(err);
  }
};
const getTeamsForCityManager = async (req, res, next) => {
  try {
    console.log("Fetching teams for city manager. City: ");
    const {
      page = 1,
      limit = 10,
      teamName,
      zoneName,
      memberName,
      city   // 👈 coming as "Lahore"
    } = req.query;

    const skip = (page - 1) * limit;
     
    // 🔥 Convert city name → ObjectId
    let cityDoc = await cityModel.findOne({
      name: { $regex: `^${city}$`, $options: "i" }
    });
  
    if (!cityDoc) {
      return res.json({ teams: [], totalPages: 0 });
    }

    let match = {
      city: cityDoc._id
    };

    if (teamName) {
      match.name = { $regex: teamName, $options: "i" };
    }

    const pipeline = [
      { $match: match },

      {
        $lookup: {
          from: "zones",
          localField: "zone",
          foreignField: "_id",
          as: "zone"
        }
      },
      { $unwind: "$zone" },

      {
        $lookup: {
          from: "employees",
          localField: "leader",
          foreignField: "_id",
          as: "leader"
        }
      },
      { $unwind: "$leader" },

      {
        $lookup: {
          from: "employees",
          localField: "members",
          foreignField: "_id",
          as: "members"
        }
      },

      {
        $match: {
          ...(zoneName && {
            "zone.name": { $regex: zoneName, $options: "i" }
          }),
          ...(memberName && {
            $or: [
              { "leader.fullName": { $regex: memberName, $options: "i" } },
              { "members.fullName": { $regex: memberName, $options: "i" } }
            ]
          })
        }
      },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: parseInt(limit) }
          ],
          total: [{ $count: "count" }]
        }
      }
    ];
    
    const result = await teamModel.aggregate(pipeline);

    res.json({
      teams: result[0].data,
      totalPages: Math.ceil(
        (result[0].total[0]?.count || 0) / limit
      )
    });

  } catch (err) {
    next(err);
  }
};

//  const getEligibleEmployees = async (req, res) => {
//   try {
//     const { city } = req.query;

//     const cityDoc = await cityModel.findOne({ name: city });

//     // ❗ employees NOT in any team
//     const teams = await teamModel.find().select("leader members");

//     const usedIds = new Set();

//     teams.forEach(t => {
//       if (t.leader) usedIds.add(t.leader.toString());
//       t.members.forEach(m => usedIds.add(m.toString()));
//     });

//     const employees = await employeeModel.find({
//       city: cityDoc._id,
//       isActive: true,
//       _id: { $nin: Array.from(usedIds) }
//     });

//     const teamLeads = employees.filter(e => e.role === "teamLead");
//     const workers = employees.filter(e => e.role === "worker");

//     res.json({ teamLeads, workers });

//   } catch (err) {
//     res.status(500).json({ message: "Error" });
//   }
// };

const getEligibleEmployees = async (req, res) => {
  try {
    const { city, teamId } = req.query;

    const cityDoc = await cityModel.findOne({ name: city });

    const teams = await teamModel.find().select("leader members");

    const usedIds = new Set();

    teams.forEach(t => {
      if (t._id.toString() === teamId) return; // 🔥 skip current team

      if (t.leader) usedIds.add(t.leader.toString());
      t.members.forEach(m => usedIds.add(m.toString()));
    });

    const employees = await employeeModel.find({
      city: cityDoc._id,
      isActive: true,
      _id: { $nin: Array.from(usedIds) }
    });

    const teamLeads = employees.filter(e => e.role === "teamLead");
    const workers = employees.filter(e => e.role === "worker");

    res.json({ teamLeads, workers });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

const createNewTeam = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, zone, leader, members, city } = req.body;
    
    if (!name || !zone || !leader) {
      throw new Error("Missing fields");
    }
   
    // ❗ check already assigned
    const existing = await teamModel.findOne({
      $or: [
        { leader },
        { members: { $in: members } }
      ]
    });

    if (existing) {
      throw new Error("Employee already assigned to a team");
    }
    let cityID = await cityModel.findOne({ name: city }).select("_id");

    // find the leader and members and update their zone

  

    const team = await teamModel.create([{
      name,
      zone,
      leader,
      members,
      city: cityID
    }], { session });

    // ✅ assign zone to employees
    await employeeModel.updateMany(
      { _id: { $in: [leader, ...members] } },
      { zone },
      { session }
    );

    await session.commitTransaction();

    res.json({ success: true, team });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};



let getZonesForCity = async (req, res) => {
  try {
    const { city } = req.query;

    const cityDoc = await cityModel.findOne({ name: city });

    const zones = await zoneModel.find({ city: cityDoc._id }).select("name");

    res.json({ zones });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
}; 



const updateTeam = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { leader, members, zone } = req.body;
    const { id } = req.params;

    if (!leader || members.length === 0) {
      throw new Error("Team must have leader and at least one worker");
    }

    const team = await teamModel.findById(id);

    if (!team) throw new Error("Team not found");

    // ❗ prevent duplicate assignment
    const existing = await teamModel.findOne({
      _id: { $ne: id },
      $or: [
        { leader },
        { members: { $in: members } }
      ]
    });

    if (existing) {
      throw new Error("Employee already assigned to another team");
    }

    // 🔥 Update team
    team.leader = leader;
    team.members = members;
    team.zone = zone;

    await team.save({ session });

    // 🔥 Update employees zone
    await employeeModel.updateMany(
      { _id: { $in: [leader, ...members] } },
      { zone },
      { session }
    );

    await session.commitTransaction();

    res.json({ success: true });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const oldStatus = complaint.CurrentStatus;

    // ❌ prevent same status update
    if (oldStatus === status) {
      return res.status(400).json({ message: "Status is already same" });
    }

    // ✅ update complaint
    complaint.CurrentStatus = status;
    await complaint.save();

    // ✅ add history
    await ComplaintHistory.create({
      complaint: complaint._id,
      actionType: "REASSIGNED",
      oldStatus,
      newStatus: status,
      remarks,
      actedBy: req.user?.employeeId || null
    });

    res.json({ message: "Status updated successfully" });

  } catch (err) {
    next(err);
  }
};

const updateTLRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 🔒 SECURITY: Only assigned city manager can update
    if (request.toCityManager.toString() !== req.user.employeeId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ❗ Prevent updating again
    if (request.status !== "Sent") {
      return res.status(400).json({ message: "Already processed" });
    }

    request.status = status;
    request.remarks = remarks || "";

    await request.save();

    res.json({ message: "Updated successfully", request });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getCityManagerRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = req.query;

    const filter = {
      toCityManager: req.user.employeeId
    };

    // ✅ Status filter
    if (status) {
      filter.status = status;
    }

    // ✅ Date filter
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.createdAt.$lte = new Date(endDate + "T23:59:59.999Z");
      }
    }

    const requests = await Request.find(filter)
      .populate("fromTeamLead", "fullName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Request.countDocuments(filter);

    res.json({
      requests,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { createTeam, getTeams, getCMComplaints, getComplaintHistory, getALLTeams, getNearbyZones, getTeamsByZone, assignTeam, getTeamsForCityManager, getEligibleEmployees , createNewTeam, getZonesForCity,  updateTeam, updateComplaintStatus, updateTLRequestStatus, getCityManagerRequests};