const http = require("http");
const https = require("https");

// Health check configuration
const checks = [
	{
		name: "Backend API",
		url: "http://localhost:5000/api/dashboard",
		timeout: 5000,
	},
	{
		name: "Frontend",
		url: "http://localhost:3000",
		timeout: 5000,
	},
];

function makeRequest(url, timeout) {
	return new Promise((resolve, reject) => {
		const lib = url.startsWith("https") ? https : http;
		const req = lib.get(url, (res) => {
			resolve({
				statusCode: res.statusCode,
				headers: res.headers,
			});
		});

		req.setTimeout(timeout, () => {
			req.destroy();
			reject(new Error("Request timeout"));
		});

		req.on("error", reject);
	});
}

async function runHealthCheck() {
	console.log("🏥 Running health checks...\n");

	let allPassed = true;

	for (const check of checks) {
		try {
			console.log(`Checking ${check.name}...`);
			const response = await makeRequest(check.url, check.timeout);

			if (response.statusCode === 200) {
				console.log(`✅ ${check.name} - OK (${response.statusCode})`);
			} else {
				console.log(`⚠️  ${check.name} - Warning (${response.statusCode})`);
				allPassed = false;
			}
		} catch (error) {
			console.log(`❌ ${check.name} - Failed: ${error.message}`);
			allPassed = false;
		}
	}

	console.log("\n" + "=".repeat(50));

	if (allPassed) {
		console.log("🎉 All health checks passed!");
		console.log("🌐 Frontend: http://localhost:3000");
		console.log("📊 Backend API: http://localhost:5000");
	} else {
		console.log("⚠️  Some health checks failed.");
		console.log("💡 Make sure both frontend and backend are running:");
		console.log("   npm run dev");
	}

	process.exit(allPassed ? 0 : 1);
}

runHealthCheck().catch(console.error);
