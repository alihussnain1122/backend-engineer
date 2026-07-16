export function identifyClient(req) {
	const apiKey = req.headers?.["x-api-key"];

	if (apiKey) {
		return `api-key:${apiKey}`;
	}

	const forwardedFor = req.headers?.["x-forwarded-for"];
	const forwardedIp = typeof forwardedFor === "string" ? forwardedFor.split(",")[0].trim() : "";
	const ip = forwardedIp || req.ip || req.socket?.remoteAddress || "unknown";

	return `ip:${ip}`;
}

