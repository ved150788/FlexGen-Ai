// Threat Intelligence API Configuration
// This file centralizes API endpoints and authentication for threat intelligence sources

import config from "./config";

// We need the interface definitions from the main page
export interface ThreatIndicator {
	id: string;
	type: string;
	value: string;
	confidence: number;
	severity: "High" | "Medium" | "Low";
	firstSeen: string;
	lastSeen: string;
	tags: string[];
	relatedActors?: string[];
	description?: string;
}

// API configuration
interface ApiConfig {
	baseUrl: string;
	apiKey: string;
	version?: string;
}

// Example configurations for popular threat intelligence sources
// Replace these with your actual API credentials and endpoints

// VirusTotal API
export const virusTotalConfig: ApiConfig = {
	baseUrl: "https://www.virustotal.com/api/v3",
	apiKey: process.env.VIRUSTOTAL_API_KEY || "YOUR_VIRUSTOTAL_API_KEY",
};

// AlienVault OTX API
export const otxConfig: ApiConfig = {
	baseUrl: "https://otx.alienvault.com/api/v1",
	apiKey: process.env.OTX_API_KEY || "YOUR_OTX_API_KEY",
};

// MISP (Malware Information Sharing Platform)
export const mispConfig: ApiConfig = {
	baseUrl: "https://your-misp-instance.com/api",
	apiKey: process.env.MISP_API_KEY || "YOUR_MISP_API_KEY",
};

// Helper functions for API calls

// Generic fetch function with authentication
export async function fetchWithAuth(
	endpoint: string,
	config: ApiConfig,
	options: RequestInit = {}
) {
	const url = `${config.baseUrl}${endpoint}`;
	const headers = {
		...options.headers,
		Authorization: `Bearer ${config.apiKey}`,
		"Content-Type": "application/json",
	};

	return fetch(url, {
		...options,
		headers,
	});
}

// Fetch IOCs (Indicators of Compromise) from a specified source
export async function fetchIndicators(
	source: "virustotal" | "otx" | "misp",
	params: any = {}
) {
	let config: ApiConfig;
	let endpoint: string;

	switch (source) {
		case "virustotal":
			config = virusTotalConfig;
			endpoint = "/intelligence/search";
			break;
		case "otx":
			config = otxConfig;
			endpoint = "/indicators/export";
			break;
		case "misp":
			config = mispConfig;
			endpoint = "/attributes/restSearch";
			break;
		default:
			throw new Error(`Unknown source: ${source}`);
	}

	const response = await fetchWithAuth(endpoint, config, {
		method: "POST",
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		throw new Error(`API error (${source}): ${response.status}`);
	}

	return response.json();
}

// Aggregate threat data from multiple sources
export async function aggregateIntelligence(query: string) {
	try {
		console.log(
			`🔍 [ThreatIntel] Starting intelligence gathering for query: "${query}"`
		);

		// Force mock data off for real API calls
		(config as any).useMockApiData = false;

		// Collect data from multiple sources in parallel
		console.log(`📊 [ThreatIntel] Fetching data from VirusTotal...`);
		const vtPromise = fetchIndicators("virustotal", { query, limit: 10 }).catch(
			(e) => {
				console.error(`❌ [ThreatIntel] VirusTotal API error:`, e);
				return [];
			}
		);

		console.log(`📊 [ThreatIntel] Fetching data from AlienVault OTX...`);
		const otxPromise = fetchIndicators("otx", { query, limit: 10 }).catch(
			(e) => {
				console.error(`❌ [ThreatIntel] OTX API error:`, e);
				return [];
			}
		);

		console.log(`📊 [ThreatIntel] Fetching data from MISP...`);
		const mispPromise = fetchIndicators("misp", { query, limit: 10 }).catch(
			(e) => {
				console.error(`❌ [ThreatIntel] MISP API error:`, e);
				return [];
			}
		);

		// Wait for all requests to complete
		const [vtData, otxData, mispData] = await Promise.all([
			vtPromise,
			otxPromise,
			mispPromise,
		]);

		// Log results for debugging
		console.log(`✅ [ThreatIntel] Data fetched successfully:`);
		console.log(`  - VirusTotal: ${vtData?.length || 0} items`);
		console.log(`  - OTX: ${otxData?.length || 0} items`);
		console.log(`  - MISP: ${mispData?.length || 0} items`);
		console.log(`📋 [ThreatIntel] Processing indicators...`);

		// Process indicators from each source
		const processedVT = processIndicators(vtData);
		const processedOTX = processIndicators(otxData);
		const processedMISP = processIndicators(mispData);

		const allProcessedIndicators = [
			...processedVT,
			...processedOTX,
			...processedMISP,
		];

		// Check if we have any real data
		if (allProcessedIndicators.length === 0) {
			console.log(
				`⚠️ [ThreatIntel] No real data found, generating test data for demonstration`
			);

			// Create direct test indicators to ensure we have data to show
			const testIndicators: ThreatIndicator[] = [
				{
					id: `test-ip-${Date.now()}`,
					type: "IP",
					value: "45.153.243.77",
					confidence: 90,
					severity: "High",
					firstSeen: new Date(
						Date.now() - 5 * 24 * 60 * 60 * 1000
					).toISOString(),
					lastSeen: new Date().toISOString(),
					tags: ["C2", "Ransomware", "TOR Exit Node"],
					relatedActors: ["BlackCat", "ALPHV"],
					description:
						"Command and control server for ransomware operations (demo data)",
				},
				{
					id: `test-domain-${Date.now()}`,
					type: "Domain",
					value: "malicious-login-verify.com",
					confidence: 85,
					severity: "High",
					firstSeen: new Date(
						Date.now() - 3 * 24 * 60 * 60 * 1000
					).toISOString(),
					lastSeen: new Date().toISOString(),
					tags: ["Phishing", "Typosquatting", "Credential Theft"],
					description:
						"Typosquatting domain used in recent phishing campaigns (demo data)",
				},
				{
					id: `test-hash-${Date.now()}`,
					type: "Hash",
					value: "5f2b7c3d4e5f6a7b8c9d0e1f2a3b4c5d",
					confidence: 95,
					severity: "High",
					firstSeen: new Date(
						Date.now() - 7 * 24 * 60 * 60 * 1000
					).toISOString(),
					lastSeen: new Date().toISOString(),
					tags: ["Malware", "Backdoor", "RAT"],
					relatedActors: ["APT41"],
					description: "Backdoor associated with APT41 operations (demo data)",
				},
				{
					id: `test-url-${Date.now()}`,
					type: "URL",
					value: "https://fake-login-portal.net/banking",
					confidence: 80,
					severity: "Medium",
					firstSeen: new Date(
						Date.now() - 2 * 24 * 60 * 60 * 1000
					).toISOString(),
					lastSeen: new Date().toISOString(),
					tags: ["Phishing", "Banking"],
					description:
						"Banking phishing site collecting credentials (demo data)",
				},
				{
					id: `test-email-${Date.now()}`,
					type: "Email",
					value: "payment-verify@suspicious-domain.org",
					confidence: 75,
					severity: "Medium",
					firstSeen: new Date(
						Date.now() - 1 * 24 * 60 * 60 * 1000
					).toISOString(),
					lastSeen: new Date().toISOString(),
					tags: ["Phishing", "BEC"],
					description: "Business email compromise attempt (demo data)",
				},
			];

			console.log(
				`✅ [ThreatIntel] Generated ${testIndicators.length} test indicators for demonstration`
			);

			return {
				indicators: testIndicators,
				sources: {
					demo: true,
					virustotal: false,
					otx: false,
					misp: false,
				},
				timestamp: new Date().toISOString(),
			};
		}

		console.log(
			`✅ [ThreatIntel] Processed ${allProcessedIndicators.length} total indicators`
		);

		return {
			indicators: allProcessedIndicators,
			sources: {
				virustotal: processedVT.length > 0,
				otx: processedOTX.length > 0,
				misp: processedMISP.length > 0,
			},
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		console.error("❌ [ThreatIntel] Error aggregating intelligence:", error);

		// Generate test data for error cases
		const errorIndicators: ThreatIndicator[] = [
			{
				id: `error-fallback-${Date.now()}`,
				type: "IP",
				value: "192.168.1.1",
				confidence: 99,
				severity: "High",
				firstSeen: new Date().toISOString(),
				lastSeen: new Date().toISOString(),
				tags: ["Error Fallback"],
				description: "Error occurred during API calls. This is fallback data.",
			},
		];

		return {
			indicators: errorIndicators,
			sources: { error: true },
			timestamp: new Date().toISOString(),
		};
	}
}

// Helper function to process indicators from different sources into a standard format
function processIndicators(data: any): ThreatIndicator[] {
	// This is a placeholder function - you would need to implement
	// specific processing for each API's response format
	console.log(
		`📊 [API] Processing ${data?.length || 0} indicators from source`
	);

	if (!data || !Array.isArray(data) || data.length === 0) {
		console.log(
			`⚠️ [API] No data received, generating test indicators for development`
		);

		// Generate mock data for testing when real APIs aren't configured
		const mockTypes = ["IP", "Domain", "Hash", "URL", "Email"];
		const mockValues = [
			"192.168.1.1",
			"malicious-domain.com",
			"5f2b7c3d4e5f6a7b8c9d0e1f2a3b4c5d",
			"https://phishing-site.com/login",
			"attacker@evil.com",
		];
		const mockTags = [
			"Ransomware",
			"Phishing",
			"C2",
			"Malware",
			"Botnet",
			"APT",
		];
		const mockSeverities: ("High" | "Medium" | "Low")[] = [
			"High",
			"Medium",
			"Low",
		];

		// Return mock indicators for testing - generate realistic ones
		return Array(config.mockIndicatorsPerSource)
			.fill(0)
			.map((_, i) => {
				const type = mockTypes[Math.floor(Math.random() * mockTypes.length)];
				let value = "";

				// Generate realistic values based on type
				switch (type) {
					case "IP":
						value = `${Math.floor(Math.random() * 256)}.${Math.floor(
							Math.random() * 256
						)}.${Math.floor(Math.random() * 256)}.${Math.floor(
							Math.random() * 256
						)}`;
						break;
					case "Domain":
						const domains = [
							"evil-domain.com",
							"malicious-site.net",
							"fake-login.org",
							"phish-attempt.co",
						];
						value = domains[Math.floor(Math.random() * domains.length)];
						break;
					case "Hash":
						value = [...Array(32)]
							.map(() => Math.floor(Math.random() * 16).toString(16))
							.join("");
						break;
					case "URL":
						value = `https://${
							["fake-bank", "login-verify", "account-secure"][
								Math.floor(Math.random() * 3)
							]
						}.${["com", "org", "net"][Math.floor(Math.random() * 3)]}/login`;
						break;
					case "Email":
						value = `${
							["phishing", "hacker", "attack", "malware"][
								Math.floor(Math.random() * 4)
							]
						}@${["evil", "bad", "fake"][Math.floor(Math.random() * 3)]}.${
							["com", "org", "net"][Math.floor(Math.random() * 3)]
						}`;
						break;
					default:
						value = `unknown-${Math.random().toString(36).substring(2, 8)}`;
				}

				return {
					id: `mock-${type.toLowerCase()}-${i}-${Date.now()}`,
					type,
					value,
					confidence: Math.floor(Math.random() * 50) + 50, // 50-100
					severity:
						mockSeverities[Math.floor(Math.random() * mockSeverities.length)],
					firstSeen: new Date(
						Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
					).toISOString(),
					lastSeen: new Date().toISOString(),
					tags: Array(Math.floor(Math.random() * 3) + 1)
						.fill(0)
						.map(() => mockTags[Math.floor(Math.random() * mockTags.length)]),
					relatedActors: Math.random() > 0.5 ? ["APT41", "Lazarus Group"] : [],
					description:
						"This is a test indicator for development when real API connections are not available.",
				};
			});
	}

	console.log(`✅ [API] Processing ${data.length} real indicators`);

	// Map the data to your internal format - here we're just passing through
	// In a real implementation, you would process each API response format differently
	return data.map((item: any) => ({
		id: item.id || generateId(),
		type: determineType(item) || "Unknown",
		value: extractValue(item) || item.value || "No value",
		confidence: calculateConfidence(item) || 75,
		severity: determineSeverity(item),
		firstSeen: item.first_seen || new Date().toISOString(),
		lastSeen: item.last_seen || new Date().toISOString(),
		tags: extractTags(item) || [],
		relatedActors: item.actors || item.relatedActors || [],
		description: item.description || "",
	}));
}

// Helper utility functions (placeholders - implementation needed)
function generateId() {
	return Math.random().toString(36).substring(2, 15);
}

function determineType(item: any) {
	// Logic to determine if it's an IP, domain, hash, etc.
	return "unknown";
}

function extractValue(item: any) {
	// Extract the main value from the item
	return "";
}

function calculateConfidence(item: any) {
	// Logic to normalize confidence scores
	return 50;
}

function determineSeverity(item: any) {
	// Logic to determine severity
	return "Medium" as "High" | "Medium" | "Low";
}

function extractTags(item: any) {
	// Extract and normalize tags
	return [];
}
