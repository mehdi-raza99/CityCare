import express from "express";
import { authorizeRoles } from "../middleware/verifyRole.js";
import authenticateUser from "../middleware/verifyJWT.js";
import { createComplaint,ComplaintsOfUserArea, ComplaintsVotedByUser, postFeedbacksOfUser, getComplaintCategories,ComplaintMadeByUser } from "../controller/complainant.controler.js";
import upload from "../utils/multer.js";
import { strictLimiter, mediumLimiter, relaxedLimiter } from "../middleware/RateLimit-Frequency.js";
let router = express.Router();

router.post("/create-complaint",upload.array("files", 5),mediumLimiter, authenticateUser, createComplaint);
router.get("/complaint-made",relaxedLimiter, authenticateUser, ComplaintMadeByUser);
router.get("/complaints-of-user-area",relaxedLimiter, authenticateUser, ComplaintsOfUserArea);
router.get("/complaints-voted",relaxedLimiter, authenticateUser, ComplaintsVotedByUser);
router.post("/feedback-posted",relaxedLimiter, authenticateUser, postFeedbacksOfUser);
router.get("/complaint-categories",relaxedLimiter, getComplaintCategories);

export default router;