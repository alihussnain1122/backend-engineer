import { identifyClient } from "./identifyClient.js";
import { getBlockReason, isClientBlocked } from "../services/blocklistService.js";

export async function abuseDetector(req, res, next) {
	const clientId = identifyClient(req);
	req.clientId = clientId;

	if (await isClientBlocked(clientId)) {
		const reason = await getBlockReason(clientId);

		return res.status(403).json({
			error: "Client blocked",
			clientId,
			reason: reason || "blocked",
		});
	}

	return next();
}
