// STIX/TAXII Connector for Standardized Threat Intelligence
// STIX (Structured Threat Information Expression) and TAXII (Trusted Automated Exchange of Intelligence Information)
// are standards for threat intelligence sharing

import { ThreatIndicator } from "./api";
import config from "./config";

interface TaxiiDiscovery {
	title: string;
	description: string;
	contact: string;
	api_roots: string[];
}

interface TaxiiApiRoot {
	title: string;
	description: string;
	versions: string[];
	max_content_length: number;
}

interface TaxiiCollection {
	id: string;
	title: string;
	description: string;
	can_read: boolean;
	can_write: boolean;
	media_types: string[];
}

// TAXII Server Configuration
interface TaxiiConfig {
	baseUrl: string;
	username?: string;
	password?: string;
	apiKey?: string;
	version: "2.0" | "2.1";
}

// Define your TAXII server configuration
export const taxiiConfig: TaxiiConfig = {
	baseUrl: "https://your-taxii-server.com/",
	username: process.env.TAXII_USERNAME,
	password: process.env.TAXII_PASSWORD,
	version: "2.1",
};

// Basic authentication for TAXII
function getAuthHeaders(config: TaxiiConfig): HeadersInit {
	const headers: HeadersInit = {
		Accept: "application/taxii+json;version=2.1",
		"Content-Type": "application/taxii+json;version=2.1",
	};

	if (config.apiKey) {
		headers["Authorization"] = `Bearer ${config.apiKey}`;
	} else if (config.username && config.password) {
		const base64Credentials = btoa(`${config.username}:${config.password}`);
		headers["Authorization"] = `Basic ${base64Credentials}`;
	}

	return headers;
}

// Discover available TAXII services
export async function discoverTaxiiServices(
	config: TaxiiConfig
): Promise<TaxiiDiscovery> {
	const headers = getAuthHeaders(config);

	const response = await fetch(`${config.baseUrl}/taxii2/`, {
		method: "GET",
		headers,
	});

	if (!response.ok) {
		throw new Error(`TAXII discovery failed: ${response.status}`);
	}

	return await response.json();
}

// Get available collections from a TAXII API root
export async function getTaxiiCollections(
	config: TaxiiConfig,
	apiRoot: string
): Promise<TaxiiCollection[]> {
	const headers = getAuthHeaders(config);

	const response = await fetch(`${apiRoot}/collections/`, {
		method: "GET",
		headers,
	});

	if (!response.ok) {
		throw new Error(`Failed to get collections: ${response.status}`);
	}

	const data = await response.json();
	return data.collections;
}

// Get STIX objects from a TAXII collection
export async function getStixObjects(
	config: TaxiiConfig,
	apiRoot: string,
	collectionId: string,
	filters: Record<string, any> = {}
): Promise<any[]> {
	const headers = getAuthHeaders(config);

	// Build query parameters
	const queryParams = new URLSearchParams();
	Object.entries(filters).forEach(([key, value]) => {
		queryParams.append(key, value.toString());
	});

	const response = await fetch(
		`${apiRoot}/collections/${collectionId}/objects/?${queryParams.toString()}`,
		{
			method: "GET",
			headers,
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to get STIX objects: ${response.status}`);
	}

	const data = await response.json();
	return data.objects || [];
}

// Convert STIX indicators to our ThreatIndicator format
export function convertStixToThreatIndicator(
	stixObjects: any[]
): ThreatIndicator[] {
	return stixObjects
		.filter((obj) => obj.type === "indicator")
		.map((indicator) => {
			// Extract relevant information from STIX format
			const pattern = indicator.pattern || "";
			const patternValue = extractPatternValue(pattern);
			const indicatorType = determineIndicatorType(pattern);

			return {
				id: indicator.id || "",
				type: indicatorType,
				value: patternValue,
				confidence: convertStixConfidence(indicator.confidence),
				severity: convertStixSeverity(
					indicator.severity || indicator.labels || []
				),
				firstSeen: indicator.created || new Date().toISOString(),
				lastSeen: indicator.modified || new Date().toISOString(),
				tags: indicator.labels || [],
				relatedActors: extractRelatedActors(indicator),
				description: indicator.description || "",
			};
		});
}

// Helper function to extract pattern value from STIX pattern
function extractPatternValue(pattern: string): string {
	// This is a simplified version - a real implementation would need to handle
	// different STIX pattern types properly
	const matches = pattern.match(/'([^']+)'/);
	return matches ? matches[1] : pattern;
}

// Determine indicator type from STIX pattern
function determineIndicatorType(pattern: string): string {
	if (pattern.includes("ipv4-addr")) return "IP";
	if (pattern.includes("domain-name")) return "Domain";
	if (pattern.includes("file:hashes")) return "Hash";
	if (pattern.includes("url")) return "URL";
	if (pattern.includes("email-addr")) return "Email";
	return "Other";
}

// Convert STIX confidence to numeric value
function convertStixConfidence(
	confidence: string | number | undefined
): number {
	if (typeof confidence === "number") return confidence;
	if (typeof confidence === "string") {
		switch (confidence.toLowerCase()) {
			case "high":
				return 85;
			case "medium":
				return 65;
			case "low":
				return 35;
			default:
				const numValue = parseFloat(confidence);
				return isNaN(numValue) ? 50 : numValue;
		}
	}
	return 50; // Default confidence
}

// Convert STIX severity or labels to our severity format
function convertStixSeverity(
	severityOrLabels: string | string[]
): "High" | "Medium" | "Low" {
	if (typeof severityOrLabels === "string") {
		const sev = severityOrLabels.toLowerCase();
		if (sev.includes("high") || sev.includes("critical")) return "High";
		if (sev.includes("medium")) return "Medium";
		return "Low";
	}

	// Check if any labels indicate severity
	if (Array.isArray(severityOrLabels)) {
		const labels = severityOrLabels.map((l) => l.toLowerCase());
		if (labels.some((l) => l.includes("critical") || l.includes("high")))
			return "High";
		if (labels.some((l) => l.includes("medium"))) return "Medium";
		if (labels.some((l) => l.includes("low"))) return "Low";
	}

	return "Medium"; // Default severity
}

// Extract related threat actors from STIX relationships
function extractRelatedActors(indicator: any): string[] {
	// In a real implementation, you would need to parse relationships
	// from the STIX bundle or make additional queries
	return [];
}

// Fetch threat intel from TAXII and convert to our format
export async function fetchTaxiiIntelligence(): Promise<ThreatIndicator[]> {
	try {
		if (config.showProgressMessages) {
			console.log("🔄 [TAXII] Starting TAXII intelligence gathering...");
		}

		// Check if we should use mock data based on config
		if (config.useMockTaxiiData) {
			console.log("🔶 [TAXII] Using mock TAXII data based on configuration");
			return generateMockTaxiiData();
		}

		// First discover available services
		if (config.showProgressMessages) {
			console.log("🔍 [TAXII] Discovering TAXII services...");
		}
		const discovery = await discoverTaxiiServices(taxiiConfig);
		if (config.showProgressMessages) {
			console.log(`✅ [TAXII] Discovered server: ${discovery.title}`);
		}

		// Get the first API root
		const apiRootUrl = discovery.api_roots[0];
		if (config.showProgressMessages) {
			console.log(`🔍 [TAXII] Using API root: ${apiRootUrl}`);
		}

		// Get available collections
		if (config.showProgressMessages) {
			console.log("🔍 [TAXII] Fetching available collections...");
		}
		const collections = await getTaxiiCollections(taxiiConfig, apiRootUrl);
		if (config.showProgressMessages) {
			console.log(`✅ [TAXII] Found ${collections.length} collections`);
		}

		// Use the first available collection that we can read
		const collection = collections.find((c) => c.can_read);

		if (!collection) {
			console.error("❌ [TAXII] No readable collections found");
			return [];
		}

		if (config.showProgressMessages) {
			console.log(
				`✅ [TAXII] Using collection: ${collection.title} (${collection.id})`
			);
		}

		// Get STIX objects
		const timeFilter = {
			added_after: new Date(
				Date.now() - config.defaultLookbackDays * 24 * 60 * 60 * 1000
			).toISOString(),
		};

		if (config.showProgressMessages) {
			console.log(
				`🔍 [TAXII] Fetching STIX objects with filter: ${JSON.stringify(
					timeFilter
				)}`
			);
		}

		const stixObjects = await getStixObjects(
			taxiiConfig,
			apiRootUrl,
			collection.id,
			timeFilter
		);

		if (config.showProgressMessages) {
			console.log(`✅ [TAXII] Retrieved ${stixObjects.length} STIX objects`);
		}

		// Convert to our format
		if (config.showProgressMessages) {
			console.log(`📋 [TAXII] Converting STIX objects to indicators...`);
		}
		const indicators = convertStixToThreatIndicator(stixObjects);

		if (config.showProgressMessages) {
			console.log(`✅ [TAXII] Converted ${indicators.length} indicators`);
		}

		return indicators;
	} catch (error) {
		console.error("❌ [TAXII] Error fetching TAXII intelligence:", error);
		// Return empty array when real connection fails
		if (!config.useMockTaxiiData) {
			console.log("⚠️ [TAXII] No TAXII data available");
			return [];
		}
		// Fallback to mock data only if configured to do so
		console.log("🔶 [TAXII] Falling back to mock data due to error");
		return generateMockTaxiiData();
	}
}

// Generate mock TAXII data for testing
function generateMockTaxiiData(): ThreatIndicator[] {
	// Sample data to use as a base
	const baseMockIndicators: ThreatIndicator[] = [
		{
			id: "stix-ind-001",
			type: "IP",
			value: "45.153.243.77",
			confidence: 90,
			severity: "High",
			firstSeen: "2023-05-10T12:00:00Z",
			lastSeen: "2023-05-15T18:30:00Z",
			tags: ["C2", "Ransomware", "TOR Exit Node"],
			relatedActors: ["BlackCat", "ALPHV"],
			description:
				"[MOCK STIX DATA] Command and control server for BlackCat/ALPHV ransomware operations",
		},
		{
			id: "stix-ind-002",
			type: "Domain",
			value: "secureupdate-microsft.com",
			confidence: 85,
			severity: "High",
			firstSeen: "2023-05-12T09:15:00Z",
			lastSeen: "2023-05-16T22:45:00Z",
			tags: ["Phishing", "Typosquatting", "Credential Theft"],
			description:
				"[MOCK STIX DATA] Typosquatting domain used in phishing campaigns against financial institutions",
		},
		{
			id: "stix-ind-003",
			type: "Hash",
			value: "5f2b7c3d4e5f6a7b8c9d0e1f2a3b4c5d",
			confidence: 95,
			severity: "High",
			firstSeen: "2023-05-08T14:30:00Z",
			lastSeen: "2023-05-15T11:20:00Z",
			tags: ["Malware", "Backdoor", "RAT"],
			relatedActors: ["APT41"],
			description:
				"[MOCK STIX DATA] Backdoor associated with APT41 operations targeting healthcare sector",
		},
	];

	// If we need more mock indicators than the base set, generate additional ones
	if (config.mockIndicatorsPerSource > baseMockIndicators.length) {
		const types = ["IP", "Domain", "Hash", "URL", "Email"];
		const tags = ["C2", "Ransomware", "Phishing", "Malware", "APT", "Zero Day"];
		const actors = ["APT41", "Lazarus Group", "FIN7", "Conti", "LAPSUS$"];

		// Generate additional indicators
		const additionalCount =
			config.mockIndicatorsPerSource - baseMockIndicators.length;
		const additionalIndicators = Array(additionalCount)
			.fill(0)
			.map((_, i) => ({
				id: `stix-gen-${i}-${Date.now()}`,
				type: types[Math.floor(Math.random() * types.length)],
				value: `generated-value-${Math.random().toString(36).substring(2, 15)}`,
				confidence: Math.floor(Math.random() * 50) + 50,
				severity: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)] as
					| "High"
					| "Medium"
					| "Low",
				firstSeen: new Date(
					Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
				).toISOString(),
				lastSeen: new Date().toISOString(),
				tags: Array(Math.floor(Math.random() * 3) + 1)
					.fill(0)
					.map(() => tags[Math.floor(Math.random() * tags.length)]),
				relatedActors:
					Math.random() > 0.5
						? [actors[Math.floor(Math.random() * actors.length)]]
						: [],
				description: `[MOCK STIX DATA] Generated test indicator for STIX/TAXII testing`,
			}));

		return [...baseMockIndicators, ...additionalIndicators];
	}

	// Otherwise just return the base set
	return baseMockIndicators;
}
