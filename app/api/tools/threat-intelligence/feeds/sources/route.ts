import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Proxy the request to the Flask API server
		const response = await fetch(
			"http://localhost:5000/api/tools/threat-intelligence/feeds/sources",
			{
				method: "GET",
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
