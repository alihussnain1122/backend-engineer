import { Router } from "express";
import { blockClient, getBlockReason, unblockClient } from "../services/blocklistService.js";

const router = Router();

router.post("/block/:clientId", async (req, res, next) => {
	try {
		const { clientId } = req.params;
		const { reason, durationMs } = req.body || {};

		await blockClient(clientId, reason || "manual", durationMs);

		res.status(201).json({
			message: "Client blocked",
			clientId,
			reason: reason || "manual",
		});
	} catch (error) {
		next(error);
	}
});

router.delete("/block/:clientId", async (req, res, next) => {
	try {
		const { clientId } = req.params;

		await unblockClient(clientId);

		res.json({
			message: "Client unblocked",
			clientId,
		});
	} catch (error) {
		next(error);
	}
});

router.get("/block/:clientId", async (req, res, next) => {
	try {
		const { clientId } = req.params;
		const reason = await getBlockReason(clientId);

		res.json({
			clientId,
			blocked: Boolean(reason),
			reason: reason || null,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
