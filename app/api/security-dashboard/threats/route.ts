import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://your-domain.com"
				: "http://localhost:5000";

		// Fetch threat intelligence data
		const response = await fetch(
			`${baseUrl}/api/tools/threat-intelligence/dashboard/`,
			{
				headers: { Accept: "application/json" },
			}
		);

		if (!response.ok) {
			throw new Error(
				`Failed to fetch threat intelligence data: ${response.status}`
			);
		}

		const threatData = await response.json();

		// Process and format the data for the security dashboard - only real data
		const processedData = {
			totalThreats: threatData.totalThreats || 0,
			newThreats: threatData.newThreats || 0,
			highRiskThreats: threatData.highRiskThreats || 0,
			threatsByType: threatData.threatsByType || [],
			recentThreats: threatData.recentThreats || [],
		};

		// If we have real threats but no breakdown by type, try to get it from the API
		if (
			processedData.totalThreats > 0 &&
			processedData.threatsByType.length === 0
		) {
			try {
				const indicatorsResponse = await fetch(
					`${baseUrl}/api/indicators?limit=1000`
				);
				if (indicatorsResponse.ok) {
					const indicatorsData = await indicatorsResponse.json();
					if (indicatorsData.results && Array.isArray(indicatorsData.results)) {
						// Count threats by type from actual data
						const typeCount: { [key: string]: number } = {};
						indicatorsData.results.forEach((indicator: any) => {
							const type = indicator.type || "Other";
							typeCount[type] = (typeCount[type] || 0) + 1;
						});

						processedData.threatsByType = Object.entries(typeCount).map(
							([type, count]) => ({
								type,
								count,
							})
						);
					}
				}
			} catch (e) {
				console.warn("Failed to fetch detailed threat indicators");
			}
		}

		return NextResponse.json(processedData);
	} catch (error) {
		console.error("Error fetching threat data:", error);

		// Return empty data when error occurs - no mock data
		return NextResponse.json({
			totalThreats: 0,
			newThreats: 0,
			highRiskThreats: 0,
			threatsByType: [],
			recentThreats: [],
		});
	}
}
