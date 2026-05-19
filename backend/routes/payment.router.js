import express from "express";
import { createCheckoutSession, saveDonation, verifyPayment } from "../controller/payment.controller.js";
import { relaxedLimiter } from "../middleware/RateLimit-Frequency.js";
const router = express.Router();

router.post("/create-checkout-session", relaxedLimiter, createCheckoutSession);

// ✅ VERIFY PAYMENT (After user returns from Stripe)
router.get("/verify-payment/:sessionId", relaxedLimiter, verifyPayment);

router.post("/save", relaxedLimiter, saveDonation);

export default router;
