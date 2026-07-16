import { Router } from "express";
import { abuseDetector } from "../middleware/abuseDetector.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/status", abuseDetector, rateLimiter, (req, res) => {
	res.json({
		message: "API is healthy",
		clientId: req.clientId,
	});
});

router.get("/data", abuseDetector, rateLimiter, (req, res) => {
	res.json({
		data: "sample response",
		clientId: req.clientId,
	});
});

export default router;
