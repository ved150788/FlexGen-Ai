import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Proxy the request to the Flask API server
		const response = await fetch(
			"http://localhost:5000/api/tools/threat-intelligence/feeds/refresh",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Flask API error: ${response.status}`);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error proxying refresh request:", error);
		return NextResponse.json(
			{
				success: false,
				message: `Failed to refresh feeds: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
				results: {},
				totalAdded: 0,
			},
			{ status: 500 }
		);
	}
}
