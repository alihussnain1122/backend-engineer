import { identifyClient } from "./identifyClient.js";
import { getBlockReason, isClientBlocked } from "../services/blocklistService.js";

export function createAbuseDetector(client) {
	return async function abuseDetector(req, res, next) {
		const clientId = identifyClient(req);
		req.clientId = clientId;

		try {
			if (await isClientBlocked(client, clientId)) {
				const reason = await getBlockReason(client, clientId);

				return res.status(403).json({
					error: "Client blocked",
					clientId,
					reason: reason || "blocked",
				});
			}
		} catch (error) {
			return next();
		}

		return next();
	};
}

export const abuseDetector = createAbuseDetector();
