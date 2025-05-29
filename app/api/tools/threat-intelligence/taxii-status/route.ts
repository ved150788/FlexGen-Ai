import { NextResponse } from "next/server";

export async function GET() {
	try {
		// Call the Flask backend API with the correct endpoint
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

		try {
			const response = await fetch(`${backendUrl}/api/taxii-status`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store", // Ensure we always get fresh data
			});

			if (response.ok) {
				const data = await response.json();

				// Transform the backend response to match frontend expectations
				// The backend returns 'feeds' but frontend expects 'collections'
				const transformedData = {
					connected: data.connected,
					lastSync: data.lastSync,
					totalFeeds: data.totalFeeds,
					activeFeeds: data.activeFeeds,
					collections: data.feeds
						? data.feeds.map((feed: any) => ({
								id: feed.name.toLowerCase().replace(/\s+/g, "-"),
								name: feed.name,
								description: feed.description,
								status: feed.status,
								indicators: feed.indicators_count,
								lastUpdated: feed.last_updated,
								format: feed.format,
								version: feed.version,
								authRequired: feed.auth_required,
								url: feed.url,
						  }))
						: [],
				};

				return NextResponse.json(transformedData);
			} else {
				console.error("Backend returned error:", await response.text());
				// Return empty data instead of mock data
				return NextResponse.json({
					connected: false,
					lastSync: null,
					totalFeeds: 0,
					activeFeeds: 0,
					collections: [],
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
			});
		}
	} catch (error) {
		console.error("Error in TAXII status route:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
