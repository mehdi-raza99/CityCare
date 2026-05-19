import express from "express";
import { authorizeRoles } from "../middleware/verifyRole.js";
import authenticateUser from "../middleware/verifyJWT.js";
import { createTeam ,getTeams,getCMComplaints, getComplaintHistory,getALLTeams,getNearbyZones, getTeamsByZone, assignTeam,getTeamsForCityManager,getEligibleEmployees , createNewTeam,getZonesForCity, updateTeam,updateComplaintStatus,updateTLRequestStatus, getCityManagerRequests} from "../controller/cityManager.controler.js";
import { relaxedLimiter } from "../middleware/RateLimit-Frequency.js";
let router = express.Router();

router.post("/create-team", relaxedLimiter, authenticateUser, authorizeRoles("cityManager", "admin"), createTeam);

router.get("/get-teams", relaxedLimiter, authenticateUser, authorizeRoles("cityManager", "admin"), getTeams);
router.get("/complaints", relaxedLimiter, authenticateUser, authorizeRoles("cityManager", "admin"), getCMComplaints);
router.get("/complaints/:id/history", relaxedLimiter, authenticateUser, authorizeRoles("cityManager", "admin"), getComplaintHistory);
router.get("/teams", relaxedLimiter, authenticateUser, authorizeRoles("cityManager", "admin"), getTeams);
// GET /api/cityManager/complaints/:id/nearby-zones
router.get("/complaints/:id/nearby-zones", relaxedLimiter, authenticateUser, authorizeRoles("cityManager", "admin"), getNearbyZones);
// GET /api/cityManager/zones/:zoneId/teams
router.get("/zones/:zoneId/teams", relaxedLimiter, authenticateUser, authorizeRoles("cityManager", "admin"), getTeamsByZone);
router.post("/complaints/:id/assign", relaxedLimiter, authenticateUser, authorizeRoles("cityManager", "admin"), assignTeam);
router.get("/city/teams", relaxedLimiter, authenticateUser, authorizeRoles("cityManager"), getTeamsForCityManager);
router.get("/employees/eligible", relaxedLimiter, authenticateUser, authorizeRoles("cityManager"), getEligibleEmployees);
router.post("/createTeam", relaxedLimiter, authenticateUser, authorizeRoles("cityManager"), createNewTeam);
router.get("/teamzones", relaxedLimiter, authenticateUser, authorizeRoles("cityManager"), getZonesForCity);
router.put("/teams/:id", relaxedLimiter, authenticateUser, authorizeRoles("cityManager"), updateTeam);
router.put("/complaints/:id/update-status", relaxedLimiter, authenticateUser, authorizeRoles("cityManager"), updateComplaintStatus);
router.put("/requests/:id/update-status", relaxedLimiter, authenticateUser, authorizeRoles("cityManager"), updateTLRequestStatus);
router.get("/requests", relaxedLimiter, authenticateUser, authorizeRoles("cityManager"), getCityManagerRequests);
export default router;