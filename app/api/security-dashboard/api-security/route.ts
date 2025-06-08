import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://your-domain.com"
				: "http://localhost:5000";

		// Try to fetch real API security data from the API fuzzer
		try {
			const response = await fetch(`${baseUrl}/api/tools/api-fuzzer/stats`, {
				headers: { Accept: "application/json" },
			});

			if (response.ok) {
				const apiData = await response.json();

				// Return real API security data if available
				return NextResponse.json({
					totalEndpoints: apiData.totalEndpoints || 0,
					secureEndpoints: apiData.secureEndpoints || 0,
					vulnerableEndpoints: apiData.vulnerableEndpoints || 0,
					recentFuzzResults: apiData.recentFuzzResults || [],
				});
			}
		} catch (apiError) {
			console.warn("API fuzzer not available:", apiError);
		}

		// If API fuzzer is not available, return empty data
		return NextResponse.json({
			totalEndpoints: 0,
			secureEndpoints: 0,
			vulnerableEndpoints: 0,
			recentFuzzResults: [],
		});
	} catch (error) {
		console.error("Error fetching API security data:", error);

		// Return empty data when error occurs - no mock data
		return NextResponse.json({
			totalEndpoints: 0,
			secureEndpoints: 0,
			vulnerableEndpoints: 0,
			recentFuzzResults: [],
		});
	}
}
