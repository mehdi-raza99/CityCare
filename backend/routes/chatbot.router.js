import express from "express";
import { chatWithBot } from "../controller/chatbot.controller.js";
import { relaxedLimiter } from "../middleware/RateLimit-Frequency.js";
let router = express.Router();

router.post("/", relaxedLimiter, chatWithBot);

export default router;
