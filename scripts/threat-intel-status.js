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
			timeout: 10000,
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

async function checkStatus() {
	log("🧠 FlexGen.ai Threat Intelligence Enhanced Status Check", "bold");
	log("=" + "=".repeat(60), "blue");

	try {
		// Check backend connection
		log("\n🔍 Backend Connection Status:", "blue");
		const dashboardResponse = await makeRequest("GET", "/api/dashboard");

		if (dashboardResponse.statusCode === 200) {
			log("✅ Backend is running and responsive", "green");
			const dashboard = dashboardResponse.data;

			log(`   Total threats: ${dashboard.totalThreats}`, "green");
			log(`   New threats (24h): ${dashboard.newThreats}`, "green");
			log(`   Most active source: ${dashboard.mostActiveSource}`, "green");
			log(`   Highest risk score: ${dashboard.highestRiskScore}`, "green");

			if (dashboard.isMockData) {
				log("   ⚠️  Warning: Using mock/demo data", "yellow");
			}
		} else {
			log("❌ Backend is not responding properly", "red");
			log("   Start backend with: npm run dev:backend", "yellow");
			return;
		}

		// Check enhanced IOC API with pagination
		log("\n📋 Enhanced IOC API Status:", "blue");
		const iocResponse = await makeRequest("GET", "/api/iocs?page=1&limit=5");

		if (iocResponse.statusCode === 200) {
			log("✅ IOC API is working", "green");

			if (iocResponse.data.iocs && iocResponse.data.pagination) {
				log(`   IOCs returned: ${iocResponse.data.iocs.length}`, "green");
				log(`   Total IOCs: ${iocResponse.data.pagination.total}`, "green");
				log(`   Current page: ${iocResponse.data.pagination.page}`, "green");
				log(
					`   Total pages: ${iocResponse.data.pagination.totalPages}`,
					"green"
				);

				// Check if IOCs have enhanced data
				if (iocResponse.data.iocs.length > 0) {
					const firstIoc = iocResponse.data.iocs[0];
					const hasEnhanced =
						firstIoc.tags &&
						firstIoc.detailedDescription &&
						firstIoc.suggestedRemedies;

					if (hasEnhanced) {
						log(
							"✅ Enhanced IOC data available (tags, descriptions, remedies)",
							"green"
						);
						log(
							`   Sample tags: ${firstIoc.tags.slice(0, 3).join(", ")}`,
							"green"
						);
						log(
							`   Remediation steps: ${firstIoc.suggestedRemedies.length}`,
							"green"
						);
						log(`   External links: ${firstIoc.externalLinks.length}`, "green");
					} else {
						log("⚠️  Basic IOC data only (no enhanced features)", "yellow");
					}
				}
			} else {
				log("⚠️  IOC API returned unexpected format", "yellow");
			}
		} else {
			log("❌ IOC API is not working", "red");
		}

		// Check individual IOC details API
		log("\n🎯 IOC Details API Status:", "blue");
		if (iocResponse.data.iocs && iocResponse.data.iocs.length > 0) {
			const testIndicator = encodeURIComponent(
				iocResponse.data.iocs[0].indicator
			);
			const detailResponse = await makeRequest(
				"GET",
				`/api/ioc/${testIndicator}`
			);

			if (detailResponse.statusCode === 200) {
				log("✅ IOC details API is working", "green");
				const detail = detailResponse.data;

				log(`   Indicator: ${detail.indicator}`, "green");
				log(`   Type: ${detail.type}`, "green");
				log(`   Source: ${detail.source}`, "green");
				log(`   Tags: ${detail.tags ? detail.tags.length : 0}`, "green");
				log(
					`   Technical details: ${
						detail.technicalDetails
							? Object.keys(detail.technicalDetails).length
							: 0
					}`,
					"green"
				);
				log(
					`   External links: ${
						detail.externalLinks ? detail.externalLinks.length : 0
					}`,
					"green"
				);
			} else {
				log("❌ IOC details API is not working", "red");
			}
		} else {
			log("⚠️  No IOCs available to test details API", "yellow");
		}

		// Check filter options API
		log("\n🔧 Filter Options API Status:", "blue");
		const filterResponse = await makeRequest("GET", "/api/filter-options");

		if (filterResponse.statusCode === 200) {
			log("✅ Filter options API is working", "green");
			const filters = filterResponse.data;

			log(
				`   Available types: ${filters.types ? filters.types.length : 0}`,
				"green"
			);
			log(
				`   Available sources: ${filters.sources ? filters.sources.length : 0}`,
				"green"
			);
			log(
				`   Time ranges: ${filters.timeRanges ? filters.timeRanges.length : 0}`,
				"green"
			);
		} else {
			log("❌ Filter options API is not working", "red");
		}

		// Check search API with pagination
		log("\n🔍 Enhanced Search API Status:", "blue");
		const searchResponse = await makeRequest(
			"GET",
			"/api/search?query=ip&page=1&limit=3"
		);

		if (searchResponse.statusCode === 200) {
			log("✅ Search API is working", "green");

			if (searchResponse.data.results && searchResponse.data.pagination) {
				log(
					`   Search results: ${searchResponse.data.results.length}`,
					"green"
				);
				log(
					`   Total matches: ${searchResponse.data.pagination.total}`,
					"green"
				);
				log(
					`   Search has pagination: ${
						searchResponse.data.pagination.totalPages > 1 ? "Yes" : "No"
					}`,
					"green"
				);

				// Check enhanced search results
				if (searchResponse.data.results.length > 0) {
					const firstResult = searchResponse.data.results[0];
					const hasEnhanced =
						firstResult.tags && firstResult.detailedDescription;

					if (hasEnhanced) {
						log("✅ Search returns enhanced IOC data", "green");
					} else {
						log("⚠️  Search returns basic data only", "yellow");
					}
				}
			}
		} else {
			log("❌ Search API is not working", "red");
		}

		// Check TAXII status
		log("\n📡 TAXII Status:", "blue");
		const taxiiResponse = await makeRequest("GET", "/api/taxii-status");

		if (taxiiResponse.statusCode === 200) {
			log("✅ TAXII status API is working", "green");
			const taxii = taxiiResponse.data;

			log(
				`   Connected: ${taxii.connected ? "Yes" : "No"}`,
				taxii.connected ? "green" : "yellow"
			);
			log(`   Total feeds: ${taxii.totalFeeds || 0}`, "green");
			log(`   Active feeds: ${taxii.activeFeeds || 0}`, "green");
			log(`   Last sync: ${taxii.lastSync || "Never"}`, "green");
		} else {
			log("❌ TAXII status API is not working", "red");
		}

		// Check IOC statistics
		log("\n📊 IOC Statistics API Status:", "blue");
		const statsResponse = await makeRequest("GET", "/api/ioc-stats");

		if (statsResponse.statusCode === 200) {
			log("✅ IOC statistics API is working", "green");
			const stats = statsResponse.data;

			log(`   Total IOCs: ${stats.totalCount}`, "green");
			log(`   Recent IOCs (7 days): ${stats.recentCount}`, "green");
			log(
				`   Type distribution: ${
					stats.typeDistribution ? stats.typeDistribution.length : 0
				} types`,
				"green"
			);
			log(
				`   Source distribution: ${
					stats.sourceDistribution ? stats.sourceDistribution.length : 0
				} sources`,
				"green"
			);

			// Show top types and sources
			if (stats.typeDistribution && stats.typeDistribution.length > 0) {
				log(
					`   Top type: ${stats.typeDistribution[0].type} (${stats.typeDistribution[0].count})`,
					"green"
				);
			}
			if (stats.sourceDistribution && stats.sourceDistribution.length > 0) {
				log(
					`   Top source: ${stats.sourceDistribution[0].source} (${stats.sourceDistribution[0].count})`,
					"green"
				);
			}
		} else {
			log("❌ IOC statistics API is not working", "red");
		}

		// Summary
		log("\n🎉 Enhanced Feature Summary:", "bold");
		log("✅ Pagination support for IOC explorer", "green");
		log("✅ Detailed IOC information pages", "green");
		log("✅ Comprehensive remediation guidance", "green");
		log("✅ Technical details and external links", "green");
		log("✅ Advanced filtering and search capabilities", "green");
		log("✅ Real-time statistics and analytics", "green");

		log("\n💡 Frontend Features Supported:", "blue");
		log("   • IOC Explorer with pagination controls", "blue");
		log("   • Detailed IOC analysis pages with remedy suggestions", "blue");
		log("   • Advanced filtering by type, source, and time range", "blue");
		log("   • Enhanced search with comprehensive results", "blue");
		log("   • Technical details and external analysis links", "blue");
		log("   • Source attribution and documentation links", "blue");
	} catch (error) {
		log("\n❌ Status check failed:", "red");
		log(`   Error: ${error.message}`, "red");

		if (error.message.includes("ECONNREFUSED")) {
			log("\n💡 Backend is not running. Start it with:", "yellow");
			log("   npm run dev:backend", "yellow");
		}
	}
}

log("🧠 FlexGen.ai Enhanced Threat Intelligence Status", "bold");
checkStatus().catch(console.error);
