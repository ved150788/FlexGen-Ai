import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Call the backend TAXII status endpoint to get feed information
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

		const response = await fetch(`${backendUrl}/api/taxii-status`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-store", // Ensure we always get fresh data
		});

		if (!response.ok) {
			throw new Error(`Flask API error: ${response.status}`);
		}

		const statusData = await response.json();

		// Convert feed status data to sources format expected by frontend
		const sources = statusData.feeds
			? statusData.feeds.map((feed: any) => ({
					name: feed.name,
					totalIndicators: feed.indicators_count || 0,
					avgThreatScore: 7.5, // Default since not available in feed status
					lastUpdated: feed.last_updated,
					recentIndicators: Math.min(feed.indicators_count || 0, 10), // Approximate recent count
					status: feed.status === "active" ? "active" : "inactive",
			  }))
			: [];

		return NextResponse.json({
			success: true,
			sources: sources,
			totalSources: sources.length,
		});
	} catch (error) {
		console.error("Error proxying sources request:", error);
		return NextResponse.json(
			{
				success: false,
				sources: [],
				totalSources: 0,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
