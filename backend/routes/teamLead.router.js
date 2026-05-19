import express from "express";
import { authorizeRoles } from "../middleware/verifyRole.js";
import authenticateUser from "../middleware/verifyJWT.js";
import { getTeamsForTeamLead,getComplaintsForTeamLead,getComplaintWithHistory,updateComplaintStatus,getTeamPerformance, getComplaintTrend, getDashboardSummary ,createRequest, getTeamLeadRequests } from "../controller/TeamLead.controler.js";
import upload from "../utils/multer.js";
import { relaxedLimiter } from "../middleware/RateLimit-Frequency.js";
let router = express.Router();

router.get("/get-teams", relaxedLimiter, authenticateUser, authorizeRoles("teamLead","admin"), getTeamsForTeamLead);
router.get("/complaints", relaxedLimiter, authenticateUser, authorizeRoles("teamLead","admin"), getComplaintsForTeamLead);
router.get("/complaints/:id", relaxedLimiter, authenticateUser, authorizeRoles("teamLead","admin"), getComplaintWithHistory);
router.put("/complaints/:id", upload.array("files"), relaxedLimiter, authenticateUser, authorizeRoles("teamLead","admin"), updateComplaintStatus);
router.get("/dashboard",
  relaxedLimiter,
  authenticateUser,
  authorizeRoles("teamLead"),
  getDashboardSummary
);

router.get("/team-performance",
  relaxedLimiter,
  authenticateUser,
  authorizeRoles("teamLead"),
  getTeamPerformance
);

router.get("/trend",
  relaxedLimiter,
  authenticateUser,
  authorizeRoles("teamLead"),
  getComplaintTrend
);

router.post("/requests", relaxedLimiter, authenticateUser, authorizeRoles("teamLead"), createRequest);
router.get("/requests", relaxedLimiter, authenticateUser, authorizeRoles("teamLead"), getTeamLeadRequests);


export default router;
