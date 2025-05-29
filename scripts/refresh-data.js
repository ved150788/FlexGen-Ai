const http = require("http");

const colors = {
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	reset: "\x1b[0m",
	bold: "\x1b[1m",
};

function log(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null) {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: "localhost",
			port: 5000,
			path: path,
			method: method,
			headers: {
				"Content-Type": "application/json",
			},
			timeout: 120000,
		};

		const req = http.request(options, (res) => {
			let responseData = "";
			res.on("data", (chunk) => (responseData += chunk));
			res.on("end", () => {
				try {
					const jsonData = JSON.parse(responseData);
					resolve({ statusCode: res.statusCode, data: jsonData });
				} catch (e) {
					resolve({ statusCode: res.statusCode, data: responseData });
				}
			});
		});

		req.on("error", reject);
		req.on("timeout", () => {
			req.destroy();
			reject(new Error("Request timeout"));
		});

		if (data) {
			req.write(JSON.stringify(data));
		}
		req.end();
	});
}

async function refreshData() {
	log("🔄 Refreshing Threat Intelligence Data...", "bold");
	log("=" * 40, "blue");

	try {
		// Check if backend is running
		log("\n🔍 Checking backend status...", "blue");
		const statusResponse = await makeRequest("GET", "/api/dashboard");

		if (statusResponse.statusCode !== 200) {
			log("❌ Backend is not responding. Please start it first:", "red");
			log("   npm run dev:backend", "yellow");
			return;
		}

		log("✅ Backend is running", "green");

		// Refresh data
		log(
			"\n🔄 Requesting fresh data from threat intelligence sources...",
			"blue"
		);
		log("   This may take a moment...", "yellow");

		const refreshResponse = await makeRequest("POST", "/api/refresh-data");

		if (refreshResponse.statusCode === 200 && refreshResponse.data.success) {
			log("\n🎉 Data refresh completed successfully!", "green");

			// Display sources used
			if (refreshResponse.data.sources_used) {
				log(
					`   Sources used: ${refreshResponse.data.sources_used.length}`,
					"green"
				);
				refreshResponse.data.sources_used.forEach((source) => {
					const count = refreshResponse.data.sources[source] || 0;
					if (count > 0) {
						log(`     • ${source}: ${count} indicators`, "green");
					}
				});
			} else {
				// Fallback for legacy response format
				if (refreshResponse.data.alienvault_count !== undefined) {
					log(
						`   AlienVault OTX: ${refreshResponse.data.alienvault_count} indicators`,
						"green"
					);
				}
				if (refreshResponse.data.threatfox_count !== undefined) {
					log(
						`   ThreatFox: ${refreshResponse.data.threatfox_count} indicators`,
						"green"
					);
				}
			}

			log(
				`   Total: ${refreshResponse.data.total_count} fresh indicators`,
				"green"
			);

			if (refreshResponse.data.total_count === 0) {
				log(
					"\n⚠️  Warning: No data was fetched from external sources",
					"yellow"
				);
				log("   This could indicate:", "yellow");
				log("   • API rate limits have been reached", "yellow");
				log("   • Network connectivity issues", "yellow");
				log("   • API keys may need to be updated", "yellow");
			}
		} else {
			log("\n❌ Data refresh failed:", "red");
			log(`   ${refreshResponse.data.message || "Unknown error"}`, "red");
		}
	} catch (error) {
		log("\n❌ Failed to refresh data:", "red");
		log(`   Error: ${error.message}`, "red");

		if (error.message.includes("ECONNREFUSED")) {
			log("\n💡 Backend is not running. Start it with:", "yellow");
			log("   npm run dev:backend", "yellow");
		}
	}
}

log("🧠 FlexGen.ai Threat Intelligence Data Refresh", "bold");
refreshData().catch(console.error);
