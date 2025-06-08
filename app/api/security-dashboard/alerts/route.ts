import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://your-domain.com"
				: "http://localhost:5000";

		const alerts: any[] = [];

		// Try to fetch alerts from different security tools
		const alertSources = [
			{
				url: `${baseUrl}/api/tools/threat-intelligence/alerts`,
				type: "threat",
			},
			{
				url: `${baseUrl}/api/tools/vulnerability-scanner/alerts`,
				type: "vulnerability",
			},
			{ url: `${baseUrl}/api/tools/api-fuzzer/alerts`, type: "api" },
			{ url: `${baseUrl}/api/tools/ai-recon/alerts`, type: "recon" },
		];

		// Fetch alerts from all sources in parallel
		const alertPromises = alertSources.map(async (source) => {
			try {
				const response = await fetch(source.url, {
					headers: { Accept: "application/json" },
				});

				if (response.ok) {
					const data = await response.json();
					// Add source type to each alert
					if (Array.isArray(data)) {
						return data.map((alert: any) => ({
							...alert,
							type: source.type,
							source:
								source.type.charAt(0).toUpperCase() +
								source.type.slice(1) +
								" Monitor",
						}));
					}
					return [];
				}
				return [];
			} catch (error) {
				console.warn(`Failed to fetch alerts from ${source.type}:`, error);
				return [];
			}
		});

		const allAlerts = await Promise.all(alertPromises);

		// Flatten and combine all alerts
		const combinedAlerts = allAlerts.flat();

		// Sort by timestamp (newest first) and limit to recent alerts
		const sortedAlerts = combinedAlerts
			.sort(
				(a, b) =>
					new Date(b.timestamp || 0).getTime() -
					new Date(a.timestamp || 0).getTime()
			)
			.slice(0, 10); // Keep only latest 10 alerts

		return NextResponse.json(sortedAlerts);
	} catch (error) {
		console.error("Error fetching security alerts:", error);

		// Return empty array when error occurs - no mock data
		return NextResponse.json([]);
	}
}
