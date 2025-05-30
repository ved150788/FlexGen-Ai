import { NextResponse } from "next/server";

export async function GET() {
	try {
		// Use the new serverless Python function endpoint with proper URL detection
		const baseUrl = process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: process.env.NODE_ENV === "production"
			? "https://flexgenai-ved150788s-projects.vercel.app"
			: "http://localhost:3000";

		try {
			const response = await fetch(`${baseUrl}/api/threat/dashboard`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				// Add a timeout to prevent hanging requests
				signal: AbortSignal.timeout(10000),
			});

			if (response.ok) {
				const data = await response.json();
				console.log(
					"Successfully loaded real dashboard data from serverless function"
				);
				return NextResponse.json(data);
			}

			// If response not OK, throw error to use fallback
			throw new Error(
				`Serverless function responded with status: ${response.status}`
			);
		} catch (err) {
			console.error(
				"Failed to fetch dashboard data from serverless function:",
				err
			);
			console.warn("Using mock threat intelligence data as fallback");

			// Return enhanced mock data as fallback with v42 features
			return NextResponse.json({
				totalThreats: 1847,
				newThreats: 67,
				highestRisk: 9.8,
				topDomains: [
					{ domain: "malicious-domain.com", count: 28 },
					{ domain: "attacker-site.net", count: 22 },
					{ domain: "phishing-campaign.org", count: 19 },
					{ domain: "malware-distribution.com", count: 15 },
					{ domain: "c2-server.net", count: 12 },
				],
				topIPs: [
					{ ip: "185.176.43.94", count: 35 },
					{ ip: "23.32.246.157", count: 28 },
					{ ip: "91.240.118.172", count: 24 },
					{ ip: "45.142.213.33", count: 18 },
					{ ip: "194.147.78.12", count: 15 },
				],
				threatsByType: [
					{ type: "IP", count: 680 },
					{ type: "Domain", count: 520 },
					{ type: "URL", count: 380 },
					{ type: "Hash", count: 210 },
					{ type: "Email", count: 57 },
				],
				sourceDistribution: [
					{ source: "URLhaus", count: 420 },
					{ source: "ThreatFox", count: 380 },
					{ source: "MITRE ATT&CK", count: 290 },
					{ source: "CISA KEV", count: 180 },
					{ source: "DShield", count: 120 },
					{ source: "OpenPhish", count: 90 },
				],
				recentActivity: [
					{ time: "10:30", threats: 22 },
					{ time: "11:00", threats: 18 },
					{ time: "11:30", threats: 35 },
					{ time: "12:00", threats: 28 },
					{ time: "12:30", threats: 15 },
				],
				mostActiveSource: "URLhaus",
				lastUpdate: new Date().toISOString(),
				dataIngestionActive: true,
				version: "42.0.0",
				isMockData: true,
			});
		}
	} catch (error) {
		console.error("Error in threat intelligence dashboard:", error);
		return NextResponse.json(
			{ error: "Internal server error", version: "42.0.0" },
			{ status: 500 }
		);
	}
}
