import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://your-domain.com"
				: "http://localhost:5000";

		// Try to fetch real vulnerability data from the vulnerability scanner
		try {
			const response = await fetch(
				`${baseUrl}/api/tools/vulnerability-scanner/stats`,
				{
					headers: { Accept: "application/json" },
				}
			);

			if (response.ok) {
				const vulnData = await response.json();

				// Return real vulnerability data if available
				return NextResponse.json({
					totalVulnerabilities: vulnData.totalVulnerabilities || 0,
					criticalVulns: vulnData.criticalVulns || 0,
					highVulns: vulnData.highVulns || 0,
					mediumVulns: vulnData.mediumVulns || 0,
					lowVulns: vulnData.lowVulns || 0,
					recentScans: vulnData.recentScans || [],
				});
			}
		} catch (vulnError) {
			console.warn("Vulnerability scanner not available:", vulnError);
		}

		// If vulnerability scanner is not available, return empty data
		return NextResponse.json({
			totalVulnerabilities: 0,
			criticalVulns: 0,
			highVulns: 0,
			mediumVulns: 0,
			lowVulns: 0,
			recentScans: [],
		});
	} catch (error) {
		console.error("Error fetching vulnerability data:", error);

		// Return empty data when error occurs - no mock data
		return NextResponse.json({
			totalVulnerabilities: 0,
			criticalVulns: 0,
			highVulns: 0,
			mediumVulns: 0,
			lowVulns: 0,
			recentScans: [],
		});
	}
}
