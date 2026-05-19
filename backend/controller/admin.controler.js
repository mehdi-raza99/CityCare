import City from "../model/city.model.js";
import Zone from "../model/zone.model.js";
import ComplaintCategoryModel from "../model/complaint-Category.model.js";
import userModel from "../model/user.model.js";
import employeeModel from "../model/employee.model.js";
import ComplaintModel from "../model/complaint.model.js";
import ComplaintHistoryModel from "../model/complaint-history.model.js";
import teamModel from "../model/team.model.js";
import donationModel from "../model/donation.model.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import bcrypt from "bcrypt";
import { sendResetEmail } from "../utils/resetPassEmail.js";
import Donation from "../model/donation.model.js";
import Contact from "../model/contactUS.model.js";
import ExcelJS from "exceljs";
let createCity = async (req, res) => {
  try {
    const { name, province } = req.body;

    const exists = await City.findOne({ name });

    if (exists) {
      return res.status(400).json({ message: "City already exists" });
    }

    const city = await City.create({
      name,
      province,
      isActive: false
    });

    res.json({ city });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
let complaintCategories = async (req, res, next) => {

  try {
    let cat = req.body.category;
    let existingCategory = await ComplaintCategoryModel.findOne({ name: cat });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }
    let category = new ComplaintCategoryModel({
      name: cat
    })
    await category.save();
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: category
    })
  } catch (error) {
    next(error);
  }

}

let getAllUsers = async (req, res, next) => {
  try {
    let users = await userModel.find();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

let createEmployeeRecord = async (req, res, next) => {

  try {

    const {

      CNIC,

    } = req.body;

    let employeeExists = await employeeModel.findOne({ CNIC: CNIC });
    if (employeeExists) {
      let error = new Error("Employee already exists");
      error.status = 400;
      return next(error);
    }

    let newEmployee = new employeeModel(
      req.body
    )
    let savedEmployee = await newEmployee.save();
    res.status(201).json({
      success: true,
      message: "Employee record created successfully",
      data: savedEmployee,
    });

  } catch (error) {
    next(error);
  }

};

let updateEmployeeRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.city) {
      let cityRecord = await City.findOne({ name: updateData.city });
      if (!cityRecord) {
        let error = new Error("City not found");
        error.status = 400;
        return next(error);
      }
      updateData.city = cityRecord._id;
    }

    if (updateData.zone) {
      let zoneRecord = await Zone.findOne({ name: updateData.zone });
      if (!zoneRecord) {
        let error = new Error("Zone not found");
        error.status = 400;
        return next(error);
      }
      updateData.zone = zoneRecord._id;
    }


    let updatedEmployee = await employeeModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      let error = new Error("Employee not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Employee record updated successfully",
      data: updatedEmployee,
    });

  } catch (error) {
    next(error);
  }
};

let deleteEmployeeRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    let deletedEmployee = await employeeModel.findByIdAndDelete(id);


    if (!deletedEmployee) {
      let error = new Error("Employee not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Employee record deleted successfully",
      data: deletedEmployee,
    });

  } catch (error) {
    next(error);
  }
};

let getAnalyticsData = async (query) => {
  const { timeFilter, city, category } = query;
  console.log(timeFilter, city, category);

  // 1. Build Base Match Stage
  let matchStage = {};

  let cityObjectId = null;
  if (city && city !== "all") {
    let cityDoc = await City.findOne({ name: city });
    cityObjectId = cityDoc ? cityDoc._id : new mongoose.Types.ObjectId();

    matchStage.city = cityObjectId;
  }

  if (category && category !== "all") {
    matchStage.category = category;
  }

  let dateLimit = null;
  const now = new Date();
  if (timeFilter === "last7days") {
    dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 7);
  } else if (timeFilter === "last30days") {
    dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 30);
  } else if (timeFilter === "last3months") {
    dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() - 3);
  }

  if (dateLimit) {
    matchStage.createdAt = { $gte: dateLimit };
  }


  // 2. Fetch Overview KPIs
  const totalComplaints = await ComplaintModel.countDocuments(matchStage);

  const resolvedComplaints = await ComplaintModel.countDocuments({ ...matchStage, CurrentStatus: "Resolved" });
  const resolutionRate = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(2) : 0;

  const pendingComplaints = await ComplaintModel.countDocuments({
    ...matchStage,
    CurrentStatus: "Pending",
  });

  const activeTeamsFilter = { isActive: true };
  if (city && city !== "all" && cityObjectId) {
    activeTeamsFilter.city = cityObjectId;
  }
  const activeTeams = await teamModel.countDocuments(activeTeamsFilter);

  // Calculate Average Resolution Time
  const resolvedHistory = await ComplaintModel.aggregate([
    { $match: { ...matchStage, CurrentStatus: "Resolved" } },
    {
      $project: {
        timeToResolve: { $subtract: ["$updatedAt", "$createdAt"] }
      }
    },
    { $group: { _id: null, avgTimeMs: { $avg: "$timeToResolve" } } }
  ]);
  // convert ms to hours
  const avgResolutionTimeHours = resolvedHistory.length > 0
    ? (resolvedHistory[0].avgTimeMs / (1000 * 60 * 60)).toFixed(2)
    : 0;

  // 3. Complaint Analytics
  // over time (group by day)
  const complaintsOverTime = await ComplaintModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // by status
  const complaintsByStatus = await ComplaintModel.aggregate([
    { $match: matchStage },
    { $group: { _id: "$CurrentStatus", count: { $sum: 1 } } }
  ]);

  // by category
  const complaintsByCategory = await ComplaintModel.aggregate([
    { $match: matchStage },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);

  // by city
  const complaintsByCity = await ComplaintModel.aggregate([
    { $match: matchStage },
    { $group: { _id: "$city", count: { $sum: 1 } } },
    { $lookup: { from: "cities", localField: "_id", foreignField: "_id", as: "cityInfo" } },
    { $unwind: { path: "$cityInfo", preserveNullAndEmptyArrays: true } },
    { $project: { city: "$cityInfo.name", count: 1 } }
  ]);

  // 4. Team & Employee Performance
  let teamPerformanceMatch = {
    CurrentStatus: "Resolved",
    assignedTeam: { $exists: true, $ne: null }
  };
  if (cityObjectId) teamPerformanceMatch.city = cityObjectId;
  if (category && category !== "all") teamPerformanceMatch.category = category;
  if (dateLimit) teamPerformanceMatch.updatedAt = { $gte: dateLimit };

  const complaintsResolvedPerTeam = await ComplaintModel.aggregate([
    { $match: teamPerformanceMatch },
    { $group: { _id: "$assignedTeam", resolvedCount: { $sum: 1 } } },
    { $lookup: { from: "teams", localField: "_id", foreignField: "_id", as: "teamInfo" } },
    { $unwind: { path: "$teamInfo", preserveNullAndEmptyArrays: true } },
    { $project: { teamName: "$teamInfo.name", resolvedCount: 1, leader: "$teamInfo.leader" } },
    { $sort: { resolvedCount: -1 } },
    { $limit: 10 }
  ]);
  console.log("team resolution is  ");
  console.log(complaintsResolvedPerTeam);

  // 5. Donations
  const totalDonationsAgg = await donationModel.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const totalDonationsAllTime = totalDonationsAgg.length > 0 ? totalDonationsAgg[0].total : 0;

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthDonationAgg = await donationModel.aggregate([
    { $match: { donatedAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const totalDonationsThisMonthSum = thisMonthDonationAgg.length > 0 ? thisMonthDonationAgg[0].total : 0;

  return {
    overview: {
      totalComplaints,
      resolutionRate,
      averageResolutionTimeHours: parseFloat(avgResolutionTimeHours),
      pendingComplaints,
      activeTeams
    },
    complaintAnalytics: {
      overTime: complaintsOverTime,
      byStatus: complaintsByStatus,
      byCategory: complaintsByCategory,
      byCity: complaintsByCity,
    },
    teamPerformance: {
      leaderboard: complaintsResolvedPerTeam
    },
    donations: {
      totalAllTime: totalDonationsAllTime,
      totalThisMonth: totalDonationsThisMonthSum
    }
  };
};

let getAdminAnalytics = async (req, res, next) => {
  try {
    let data = await getAnalyticsData(req.query);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

let generateReport = async (req, res, next) => {
  try {
    const data = await getAnalyticsData(req.query);

    const doc = new PDFDocument({ margin: 50 });
    let filename = `Analytics_Report_${new Date().toISOString().split('T')[0]}`;

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '.pdf"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header Title
    doc.fontSize(22).text('CityCare Admin Analytics Report', { align: 'center' });
    doc.moveDown(1.5);

    // Overview KPIs
    doc.fontSize(16).text('Overview KPIs', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Complaints: ${data.overview.totalComplaints}`);
    doc.text(`Resolution Rate: ${data.overview.resolutionRate}%`);
    doc.text(`Average Resolution Time: ${data.overview.averageResolutionTimeHours} hours`);
    doc.text(`Pending Complaints: ${data.overview.pendingComplaints}`);
    doc.text(`Active Teams: ${data.overview.activeTeams}`);
    doc.moveDown(1.5);

    // Donations
    doc.fontSize(16).text('Donations', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Donations (All Time): PKR ${data.donations.totalAllTime}`);
    doc.text(`Total Donations (This Month): PKR ${data.donations.totalThisMonth}`);
    doc.moveDown(1.5);

    // Complaints by Status
    doc.fontSize(16).text('Complaints by Status', { underline: true });
    doc.moveDown(0.5);
    data.complaintAnalytics.byStatus.forEach(status => {
      doc.fontSize(12).text(`- ${status._id}: ${status.count}`);
    });
    doc.moveDown(1.5);

    // Team Performance
    if (data.teamPerformance.leaderboard && data.teamPerformance.leaderboard.length > 0) {
      doc.fontSize(16).text('Top Performing Teams', { underline: true });
      doc.moveDown(0.5);
      data.teamPerformance.leaderboard.forEach((t, i) => {
        doc.fontSize(12).text(`${i + 1}. ${t.teamName} - Resolved: ${t.resolvedCount}`);
      });
      doc.moveDown(1.5);
    }

    doc.end();

  } catch (error) {
    next(error);
  }
};

let getFilterOptions = async (req, res, next) => {
  try {
    const activeCities = await City.find({ isActive: true }).select('name _id').lean();
    const activeCategories = await ComplaintCategoryModel.find({ isActive: true }).select('name _id').lean();

    res.status(200).json({
      success: true,
      data: {
        cities: activeCities.map(c => c.name),
        categories: activeCategories.map(c => c.name)
      }
    });
  } catch (error) {
    next(error);
  }
};

let getEmployees = async (req, res) => {
  let { cnic, skill, zone, city, fullName, role, page = 1, limit = 10 } = req.query;

  let query = {};
  console.log("filters:", { fullName, role });

  if (cnic && cnic.length === 13) {
    query.CNIC = cnic;
  }

  if (skill) {
    query.skills = { $regex: skill, $options: "i" };
  }

  if (role) {
    query.role = role;
  }

  if (zone) {
    let zones = await Zone.find({
      name: { $regex: zone, $options: "i" }
    });

    query.zone = { $in: zones.map(z => z._id) };
  }
  console.log("city: ", city);
  if (city) {
    let cities = await City.find({
      name: { $regex: city, $options: "i" }
    });

    query.city = { $in: cities.map(c => c._id) };
  }

  if (fullName) {
    query.fullName = { $regex: fullName, $options: "i" };
  }

  let skip = (page - 1) * limit;
  console.log("final query:", query);
  let employees = await employeeModel
    .find(query)
    .populate("city", "_id name")
    .populate("zone", "_id name")
    .skip(skip)
    .limit(Number(limit))
    .sort({ "fullName": 1 });

  let total = await employeeModel.countDocuments(query);

  res.json({
    employees,
    totalPages: Math.ceil(total / limit)
  });
};

let updateEmployee = async (req, res) => {
  let { id } = req.params;

  let updated = await employeeModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );
  if (!updated) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  res.json(updated);
};
let createEmployee = async (req, res) => {
  let employee = await employeeModel.create(req.body);
  res.json(employee);
};

let getCities = async (req, res) => {
  // get only active cities 
  const cities = await City.find({ isActive: true }).select("_id name");

  res.json({ cities });
};

// GET /api/admin/zones?cityId=xxx
let getZonesByCity = async (req, res) => {
  const { cityId } = req.query;
  // sort the zones by name in ascending order
  const zones = await Zone
    .find({ city: cityId })
    .select("_id name")
    .sort({ name: 1 });

  res.json({ zones });
};

let getZones = async (req, res) => {
  let { name, isActive, city, page = 1, limit = 15 } = req.query;

  let query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  if (isActive !== "") {
    query.isActive = isActive === "true";
  }

  if (city) {
    query.city = city;
  }

  // 🔥 city manager restriction
  if (req.user.roleUser === "cityManager") {
    query.city = req.user.city;
  }

  let skip = (page - 1) * limit;

  let zones = await Zone
    .find(query)
    .populate("city", "name")
    .skip(skip)
    .limit(Number(limit));

  let total = await Zone.countDocuments(query);

  res.json({
    zones,
    totalPages: Math.ceil(total / limit)
  });
};
let toggleZoneStatus = async (req, res) => {
  let { id } = req.params;

  let zone = await Zone.findById(id);

  zone.isActive = !zone.isActive;

  await zone.save();

  res.json({ success: true });
};

let uploadZonesFromGeoJSON = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { cityId } = req.body;

    // ✅ verify city exists
    const city = await City.findById(cityId);
    if (!city) {
      throw new Error("Invalid city");
    }

    const geojson = JSON.parse(req.file.buffer.toString());

    if (!geojson.features || !Array.isArray(geojson.features)) {
      throw new Error("Invalid GeoJSON format");
    }

    let zones = [];

    for (let i = 0; i < geojson.features.length; i++) {

      const f = geojson.features[i];

      // ✅ VALIDATION
      if (!f.properties?.name) {
        throw new Error(`Feature ${i + 1}: Missing name`);
      }

      if (!f.geometry?.type || !f.geometry?.coordinates) {
        throw new Error(`Feature ${i + 1}: Invalid geometry`);
      }

      zones.push({
        name: f.properties.name,
        city: cityId,
        geometry: f.geometry,
        isActive: true
      });
    }

    // ✅ insert
    await Zone.insertMany(zones, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      count: zones.length
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      message: err.message
    });
  }
};
let getEmployeesWithAccounts = async (req, res) => {

  let { city, role, cnic, zone, isActive, page = 1, limit = 10 } = req.query;
  let query = {
    userID: { $ne: null }
  };

  if (city) query.city = city;
  if (role) query.role = role;
  if (zone) {
    let zones = await Zone.find({
      name: { $regex: zone, $options: "i" }
    });

    query.zone = { $in: zones.map(z => z._id) };
  }
  if (isActive) {
    query.isActive = isActive === "true";
  }

  if (cnic) query.CNIC = { $regex: cnic, $options: "i" };
  console.log("final query for accounts: ", query);
  let skip = (page - 1) * limit;


  let employees = await employeeModel
    .find(query)
    .populate("userID", "email")
    .populate("city", "name")
    .populate("zone", "name")
    .skip(skip)
    .limit(Number(limit));

  let total = await employeeModel.countDocuments(query);

  res.json({
    employees,
    totalPages: Math.ceil(total / limit)
  });
};

let updateUser = async (req, res) => {
  const { email, password } = req.body;

  let update = { email };

  if (password) {
    update.passwordHash = await bcrypt.hash(password, 10);
  }
  //    send email with new credentials
  const user = await userModel.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const mailOptions = {
    to: "citycareforyou@gmail.com",
    subject: "CityCare - Account Updated",
    text: `Hello,\n\nYour account credentials have been updated. Here are your new credentials:\n\nEmail: ${email}\n${password ? `Password: ${password}\n\nPlease log in .\n\n` : ""}Thank you,\nCityCare Team`,
    temp: "Login Credentials"
  };
  await userModel.findByIdAndUpdate(req.params.id, update);

  await sendResetEmail(mailOptions);
  res.json({ success: true });
};

let toggleEmployeeStatus = async (req, res, next) => {
  try {
    let { id } = req.params;
    let employee = await employeeModel.findOne({ userID: id });

    employee.isActive = !employee.isActive;
    await employee.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

let deleteUserAccount = async (req, res, next) => {

  try {
    // also change role
    await employeeModel.findOneAndUpdate(
      { userID: req.params.id },
      { $set: { userID: null, role: "worker" } }
    );

    await userModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });

  } catch (error) {
    next(error);
  }
}

let assignCredentials = async (req, res) => {
  try {
    const { email, password, employeeId } = req.body;

    //  check if employee exists
    const employee = await employeeModel.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    //  prevent duplicate account
    if (employee.userID) {
      return res.status(400).json({
        message: "Employee already has credentials"
      });
    }

    //  check email already exists
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use"
      });
    }

    //  hash password
    const passwordHash = await bcrypt.hash(password, 10);

    //  create user
    const user = await userModel.create({
      email,
      passwordHash,
      role: "employee",
      isVerified: true
    });

    //  link employee
    employee.userID = user._id;
    await employee.save();
    //  send email with credentials
    const mailOptions = {
      to: "citycareforyou@gmail.com", // replace with employee.email in production
      subject: "CityCare - Account Created",
      text: `Hello ${employee.fullName},\n\nYour account for role ${employee?.role} has been created with the following credentials:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease log in.\n\nThank you,\nCityCare Team`,
      temp: "Login Credentials"
    };
    await sendResetEmail(mailOptions);
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

let getAllCities = async (req, res) => {
  try {
    let { search, status } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (status !== "") {
      query.isActive = status === "true";
    }

    let cities = await City.find(query);

    res.json({ cities });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

let toggleCityStatus = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    city.isActive = !city.isActive;
    await city.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

let getDonations = async (req, res) => {
  try {
    let { filter = "today", page = 1, limit = 10 } = req.query;

    let startDate = new Date();

    if (filter === "today") {
      startDate.setHours(0, 0, 0, 0);
    }

    if (filter === "week") {
      startDate.setDate(startDate.getDate() - 7);
    }

    if (filter === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    if (filter === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    let query = {
      donatedAt: { $gte: startDate }
    };

    let totalAmountAgg = await Donation.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    let totalAmount = totalAmountAgg[0]?.total || 0;

    let donations = await Donation.find(query)
      .sort({ donatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    let totalDocs = await Donation.countDocuments(query);

    res.json({
      donations,
      totalAmount,
      totalPages: Math.ceil(totalDocs / limit)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

let getContacts = async (req, res) => {
  try {
    let { filter = "month", page = 1, limit = 10 } = req.query;

    let startDate = new Date();

    if (filter === "today") {
      startDate.setHours(0, 0, 0, 0);
    }

    if (filter === "week") {
      startDate.setDate(startDate.getDate() - 7);
    }

    if (filter === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    let query = { createdAt: { $gte: startDate } };

    let messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    let total = await Contact.countDocuments(query);

    res.json({
      messages,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



let exportContacts = async (req, res) => {
  try {
    let { filter = "month" } = req.query;

    let startDate = new Date();

    if (filter === "today") startDate.setHours(0, 0, 0, 0);
    if (filter === "week") startDate.setDate(startDate.getDate() - 7);
    if (filter === "month") startDate.setMonth(startDate.getMonth() - 1);

    let data = await Contact.find({
      createdAt: { $gte: startDate }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Contacts");

    sheet.columns = [
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Message", key: "message" }
    ];

    data.forEach(d => {
      sheet.addRow({
        name: d.name,
        email: d.email,
        message: d.message
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contacts.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { createCity, complaintCategories, getAllUsers, createEmployeeRecord, updateEmployeeRecord, deleteEmployeeRecord, getAdminAnalytics, generateReport, getFilterOptions, getEmployees, updateEmployee, createEmployee, getZonesByCity, getCities, getZones, toggleZoneStatus, uploadZonesFromGeoJSON, getEmployeesWithAccounts, updateUser, toggleEmployeeStatus, deleteUserAccount, assignCredentials, getAllCities, toggleCityStatus, getDonations, getContacts, exportContacts };
