import { NextResponse } from "next/server";

export async function GET() {
	try {
		// Call the Flask backend API
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

		try {
			// Make multiple attempts to connect to the backend
			let attempts = 0;
			const maxAttempts = 3;
			let lastError = null;

			while (attempts < maxAttempts) {
				try {
					const response = await fetch(`${backendUrl}/api/dashboard`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						// Add a timeout to prevent hanging requests
						signal: AbortSignal.timeout(5000),
					});

					if (response.ok) {
						const data = await response.json();
						console.log("Successfully loaded real dashboard data");
						return NextResponse.json(data);
					}

					// If response not OK, throw error to try again
					throw new Error(`Backend responded with status: ${response.status}`);
				} catch (err) {
					lastError = err;
					attempts++;
					// Wait before retrying (exponential backoff)
					if (attempts < maxAttempts) {
						await new Promise((resolve) =>
							setTimeout(resolve, 1000 * attempts)
						);
					}
				}
			}

			// If we get here, all attempts failed
			console.error(
				"Failed to fetch real dashboard data after multiple attempts:",
				lastError
			);
			console.warn("Using mock threat intelligence data as fallback");

			// Return mock data as fallback
			return NextResponse.json({
				totalThreats: 1247,
				newThreats: 32,
				topDomains: [
					{ domain: "malicious-domain.com", count: 18 },
					{ domain: "attacker-site.net", count: 12 },
					{ domain: "phishing-campaign.org", count: 9 },
					{ domain: "malware-distribution.com", count: 7 },
					{ domain: "c2-server.net", count: 5 },
				],
				topIPs: [
					{ ip: "192.168.1.1", count: 21 },
					{ ip: "10.0.0.1", count: 15 },
					{ ip: "172.16.0.1", count: 12 },
					{ ip: "8.8.8.8", count: 8 },
					{ ip: "1.1.1.1", count: 6 },
				],
				threatsByType: [
					{ type: "IP", count: 450 },
					{ type: "Domain", count: 320 },
					{ type: "URL", count: 280 },
					{ type: "Hash", count: 170 },
					{ type: "Email", count: 27 },
				],
				sourceDistribution: [
					{ source: "AlienVault OTX", count: 42 },
					{ source: "MITRE ATT&CK", count: 23 },
					{ source: "ThreatFox", count: 15 },
					{ source: "MISP", count: 12 },
					{ source: "VirusTotal", count: 8 },
				],
				mostActiveSource: "AlienVault OTX",
				highestRiskScore: 9.8,
				isMockData: true,
			});
		} catch (error) {
			// Log the error and return mock data
			console.error("Error connecting to backend:", error);
			console.warn("Using mock threat intelligence data as fallback");

			return NextResponse.json({
				totalThreats: 1247,
				newThreats: 32,
				topDomains: [
					{ domain: "malicious-domain.com", count: 18 },
					{ domain: "attacker-site.net", count: 12 },
					{ domain: "phishing-campaign.org", count: 9 },
					{ domain: "malware-distribution.com", count: 7 },
					{ domain: "c2-server.net", count: 5 },
				],
				topIPs: [
					{ ip: "192.168.1.1", count: 21 },
					{ ip: "10.0.0.1", count: 15 },
					{ ip: "172.16.0.1", count: 12 },
					{ ip: "8.8.8.8", count: 8 },
					{ ip: "1.1.1.1", count: 6 },
				],
				threatsByType: [
					{ type: "IP", count: 450 },
					{ type: "Domain", count: 320 },
					{ type: "URL", count: 280 },
					{ type: "Hash", count: 170 },
					{ type: "Email", count: 27 },
				],
				sourceDistribution: [
					{ source: "AlienVault OTX", count: 42 },
					{ source: "MITRE ATT&CK", count: 23 },
					{ source: "ThreatFox", count: 15 },
					{ source: "MISP", count: 12 },
					{ source: "VirusTotal", count: 8 },
				],
				mostActiveSource: "AlienVault OTX",
				highestRiskScore: 9.8,
				isMockData: true,
			});
		}
	} catch (error) {
		console.error("Error in threat intelligence dashboard:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
