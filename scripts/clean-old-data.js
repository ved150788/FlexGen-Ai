const http = require("http");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3");

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

function cleanOldData() {
	return new Promise((resolve, reject) => {
		const dbPath = path.join(__dirname, "..", "backend", "threat_intel.db");

		if (!fs.existsSync(dbPath)) {
			resolve({ message: "Database not found", cleaned: 0 });
			return;
		}

		const db = new sqlite3.Database(dbPath, (err) => {
			if (err) {
				reject(err);
				return;
			}

			// Delete data older than 30 days
			const thirtyDaysAgo = new Date(
				Date.now() - 30 * 24 * 60 * 60 * 1000
			).toISOString();

			db.run(
				"DELETE FROM iocs WHERE created_at < ?",
				[thirtyDaysAgo],
				function (err) {
					if (err) {
						db.close();
						reject(err);
						return;
					}

					const deletedCount = this.changes;

					// Also clean up any dummy sources
					const dummySources = [
						"Demo Source",
						"Test Data",
						"Sample IOCs",
						"Mock Data",
						"Dummy Source",
					];

					let dummyDeleted = 0;
					let completed = 0;

					if (dummySources.length === 0) {
						db.close();
						resolve({
							message: `Cleaned ${deletedCount} old IOCs`,
							oldDataCleaned: deletedCount,
							dummyDataCleaned: 0,
						});
						return;
					}

					dummySources.forEach((source) => {
						db.run(
							"DELETE FROM iocs WHERE source = ?",
							[source],
							function (err) {
								if (!err) {
									dummyDeleted += this.changes;
								}

								completed++;
								if (completed === dummySources.length) {
									db.close();
									resolve({
										message: `Cleaned ${deletedCount} old IOCs and ${dummyDeleted} dummy IOCs`,
										oldDataCleaned: deletedCount,
										dummyDataCleaned: dummyDeleted,
									});
								}
							}
						);
					});
				}
			);
		});
	});
}

async function runCleanup() {
	log("🧹 Cleaning Old Threat Intelligence Data...", "bold");
	log("==================================================", "blue");

	try {
		log("\n🔍 Checking for old data...", "blue");

		const result = await cleanOldData();

		if (result.oldDataCleaned > 0 || result.dummyDataCleaned > 0) {
			log("\n🎉 Cleanup completed!", "green");
			log(`   Old IOCs removed: ${result.oldDataCleaned}`, "green");
			log(`   Dummy IOCs removed: ${result.dummyDataCleaned}`, "green");
		} else {
			log("\n✅ No old data found - database is clean!", "green");
		}

		log(
			"\n💡 Recommendation: Run npm run refresh-data to ensure fresh data",
			"yellow"
		);
	} catch (error) {
		log("\n❌ Cleanup failed:", "red");
		log(`   Error: ${error.message}`, "red");
	}
}

log("🧠 FlexGen.ai Threat Intelligence Data Cleanup", "bold");
runCleanup().catch(console.error);
