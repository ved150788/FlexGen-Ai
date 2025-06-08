import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://your-domain.com"
				: "http://localhost:5000";

		// Try to fetch real reconnaissance data from the AI recon bot
		try {
			const response = await fetch(`${baseUrl}/api/tools/ai-recon/stats`, {
				headers: { Accept: "application/json" },
			});

			if (response.ok) {
				const reconData = await response.json();

				// Return real reconnaissance data if available
				return NextResponse.json({
					domainsScanned: reconData.domainsScanned || 0,
					subdomainsFound: reconData.subdomainsFound || 0,
					exposedServices: reconData.exposedServices || 0,
					recentReconResults: reconData.recentReconResults || [],
				});
			}
		} catch (reconError) {
			console.warn("AI recon bot not available:", reconError);
		}

		// If AI recon bot is not available, return empty data
		return NextResponse.json({
			domainsScanned: 0,
			subdomainsFound: 0,
			exposedServices: 0,
			recentReconResults: [],
		});
	} catch (error) {
		console.error("Error fetching reconnaissance data:", error);

		// Return empty data when error occurs - no mock data
		return NextResponse.json({
			domainsScanned: 0,
			subdomainsFound: 0,
			exposedServices: 0,
			recentReconResults: [],
		});
	}
}
