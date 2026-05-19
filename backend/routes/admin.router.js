import express from "express";
import { authorizeRoles } from "../middleware/verifyRole.js";
import authenticateUser from "../middleware/verifyJWT.js";
import {createCity} from "../controller/admin.controler.js";
import { complaintCategories,getAllUsers, createEmployeeRecord , updateEmployeeRecord, deleteEmployeeRecord, getAdminAnalytics, generateReport, getFilterOptions,getEmployees ,updateEmployee,createEmployee,getZonesByCity,getCities ,getZones,toggleZoneStatus,uploadZonesFromGeoJSON,getEmployeesWithAccounts,updateUser,toggleEmployeeStatus,deleteUserAccount,assignCredentials,getAllCities,toggleCityStatus,getDonations,getContacts,exportContacts} from "../controller/admin.controler.js";
import { upload } from "../utils/zonesMulter.js";
import {  relaxedLimiter } from "../middleware/RateLimit-Frequency.js";
let router = express.Router();
// add relaxedLimiter to all
router.post("/create-city", relaxedLimiter, authenticateUser, authorizeRoles("admin"), createCity);
router.post("/complaint-categories", relaxedLimiter, authenticateUser, authorizeRoles("admin"), complaintCategories);
router.get("/get-all-users", relaxedLimiter, authenticateUser,authorizeRoles("admin"),  getAllUsers);
router.post("/create-employee",relaxedLimiter,authenticateUser,authorizeRoles("admin"), createEmployeeRecord);
router.put("/update-employee/:id",relaxedLimiter,authenticateUser,authorizeRoles("admin"), updateEmployeeRecord);
router.delete("/delete-employee/:id", relaxedLimiter, authenticateUser, authorizeRoles("admin"), deleteEmployeeRecord);
router.get("/analytics", relaxedLimiter, authenticateUser, authorizeRoles("admin", "cityManager"), getAdminAnalytics);
router.get("/generate-report", relaxedLimiter, authenticateUser, authorizeRoles("admin", "cityManager"), generateReport);
router.get("/filter-options", relaxedLimiter, authenticateUser, authorizeRoles("admin", "cityManager"), getFilterOptions);
router.get("/employees",relaxedLimiter,authenticateUser, authorizeRoles("admin", "cityManager"),getEmployees)
router.put("/employees/:id",relaxedLimiter,authenticateUser, authorizeRoles("admin", "cityManager"),updateEmployee)
router.post("/employees",relaxedLimiter,authenticateUser, authorizeRoles("admin"),createEmployee)
router.get("/cities",  relaxedLimiter, authenticateUser, getCities);
router.get("/zones", relaxedLimiter, authenticateUser,authorizeRoles("admin", "cityManager"), getZonesByCity);
router.get("/allzones", relaxedLimiter, authenticateUser,authorizeRoles("admin"), getZones);
router.put("/zones/:id/toggle",relaxedLimiter,authenticateUser,authorizeRoles("admin") , toggleZoneStatus);
router.post(
  "/zones/upload",
  relaxedLimiter,
  authenticateUser,authorizeRoles("admin"),
  upload.single("file"),
  uploadZonesFromGeoJSON
);
router.get("/employees/accounts", relaxedLimiter, authenticateUser, authorizeRoles("admin"), getEmployeesWithAccounts);
router.put("/users/:id", relaxedLimiter, authenticateUser, authorizeRoles("admin"), updateUser);
router.put("/users/toggleActiveStatus/:id", relaxedLimiter, authenticateUser, authorizeRoles("admin"), toggleEmployeeStatus);
router.delete("/del-users-acc/:id", relaxedLimiter, authenticateUser, authorizeRoles("admin"), deleteUserAccount);
router.post("/users/assign", relaxedLimiter, authenticateUser, authorizeRoles("admin"), assignCredentials);
router.get("/all-cities",  relaxedLimiter, authenticateUser,authorizeRoles("admin"), getAllCities);
router.put("/cities/toggle/:id", relaxedLimiter, authenticateUser, authorizeRoles("admin"), toggleCityStatus);
router.get("/donations", relaxedLimiter, authenticateUser, authorizeRoles("admin"), getDonations);
router.get("/contact", relaxedLimiter, authenticateUser, authorizeRoles("admin"), getContacts);
router.get("/contact/export", relaxedLimiter, authenticateUser, authorizeRoles("admin"), exportContacts);

export default router;