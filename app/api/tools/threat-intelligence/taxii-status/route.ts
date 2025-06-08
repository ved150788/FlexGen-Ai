import { NextResponse } from "next/server";

export async function GET() {
	try {
		// Call the Flask backend API with the correct endpoint
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

		const response = await fetch(
			`${backendUrl}/api/tools/threat-intelligence/taxii-status/`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store", // Ensure we always get fresh data
			}
		);

		if (response.ok) {
			const data = await response.json();
			return NextResponse.json(data);
		} else {
			const errorText = await response.text();
			console.error("Backend returned error:", errorText);
			// Return empty data instead of mock data
			return NextResponse.json({
				connected: false,
				lastSync: null,
				totalFeeds: 0,
				activeFeeds: 0,
				collections: [],
				error: errorText,
			});
		}
	} catch (error) {
		console.error("Error in TAXII status API:", error);
		// Return empty data instead of mock data
		return NextResponse.json({
			connected: false,
			lastSync: null,
			totalFeeds: 0,
			activeFeeds: 0,
			collections: [],
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}
