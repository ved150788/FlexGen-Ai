// Simple Node.js handler for root path
module.exports = (req, res) => {
	res.json({
		status: "success",
		message: "FlexGen.ai API is running",
		api_endpoints: [
			{ path: "/api/contact", method: "POST" },
			{ path: "/api/security-audit", method: "POST" },
		],
	});
};
