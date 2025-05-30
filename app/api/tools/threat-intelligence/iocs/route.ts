import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Parse query parameters
		const searchParams = request.nextUrl.searchParams;
		const typeFilter = searchParams.get("type");
		const sourceFilter = searchParams.get("source");
		const timeFilter = searchParams.get("timeRange");
		const page = searchParams.get("page") || "1";
		const limit = searchParams.get("limit") || "10";

		// Build query string for serverless function
		let queryParams = new URLSearchParams();
		if (typeFilter && typeFilter !== "all")
			queryParams.append("type", typeFilter);
		if (sourceFilter && sourceFilter !== "all")
			queryParams.append("source", sourceFilter);
		if (timeFilter && timeFilter !== "all")
			queryParams.append("timeRange", timeFilter);
		queryParams.append("page", page);
		queryParams.append("limit", limit);

		// Use the new serverless Python function endpoint
		const baseUrl = process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: process.env.NODE_ENV === "production"
			? "https://flexgenai-ved150788s-projects.vercel.app"
			: "http://localhost:3000";

		const url = `${baseUrl}/api/threat/iocs?${queryParams.toString()}`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				signal: AbortSignal.timeout(10000),
				cache: "no-store", // Prevent caching to always get fresh data
			});

			if (response.ok) {
				const data = await response.json();
				console.log(
					"Successfully loaded real IOC data from serverless function"
				);
				// Transform the serverless response to match frontend expectations
				return NextResponse.json({
					results: data.iocs || [],
					pagination: {
						page: data.page || 1,
						limit: data.limit || parseInt(limit),
						total: data.total || 0,
						totalPages: data.total_pages || 0,
						hasNextPage: (data.page || 1) < (data.total_pages || 0),
						hasPrevPage: (data.page || 1) > 1,
					},
					filters: data.filters || {},
					version: "42.0.0",
				});
			} else {
				console.error("Serverless function returned error:", response.status);
				throw new Error(
					`Serverless function responded with status: ${response.status}`
				);
			}
		} catch (error) {
			console.error("Error fetching IOCs from serverless function:", error);
			console.warn("Using mock IOC data as fallback");

			// Return enhanced mock data as fallback with v42 features
			const mockIOCs = [
				{
					id: 1,
					indicator: "192.168.1.100",
					type: "ip",
					threat_score: 8.5,
					source: "ThreatFox",
					description: "Malicious IP address associated with botnet activity",
					created_at: new Date().toISOString(),
					last_seen: new Date().toISOString(),
					tags: ["network", "infrastructure", "botnet"],
					external_links: [
						{
							name: "VirusTotal",
							url: `https://www.virustotal.com/gui/ip-address/192.168.1.100`,
						},
						{
							name: "AbuseIPDB",
							url: `https://www.abuseipdb.com/check/192.168.1.100`,
						},
					],
				},
				{
					id: 2,
					indicator: "malicious-domain.com",
					type: "domain",
					threat_score: 9.2,
					source: "URLhaus",
					description: "Domain used for malware distribution campaigns",
					created_at: new Date().toISOString(),
					last_seen: new Date().toISOString(),
					tags: ["network", "dns", "malware"],
					external_links: [
						{
							name: "VirusTotal",
							url: `https://www.virustotal.com/gui/domain/malicious-domain.com`,
						},
						{
							name: "URLVoid",
							url: `https://www.urlvoid.com/scan/malicious-domain.com`,
						},
					],
				},
				{
					id: 3,
					indicator: "T1055",
					type: "technique",
					threat_score: 7.5,
					source: "MITRE ATT&CK",
					description: "Process Injection technique used by adversaries",
					created_at: new Date().toISOString(),
					last_seen: new Date().toISOString(),
					tags: ["technique", "process-injection", "mitre"],
					external_links: [
						{
							name: "MITRE ATT&CK",
							url: `https://attack.mitre.org/techniques/T1055/`,
						},
					],
				},
			];

			return NextResponse.json({
				results: mockIOCs,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total: mockIOCs.length,
					totalPages: 1,
					hasNextPage: false,
					hasPrevPage: false,
				},
				filters: {
					type: typeFilter,
					source: sourceFilter,
					timeRange: timeFilter,
				},
				version: "42.0.0",
				isMockData: true,
			});
		}
	} catch (error) {
		console.error("Error in IOCs listing:", error);
		return NextResponse.json(
			{ error: "Internal server error", version: "42.0.0" },
			{ status: 500 }
		);
	}
}
