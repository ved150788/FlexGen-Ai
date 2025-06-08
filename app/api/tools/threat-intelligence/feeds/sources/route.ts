import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Call the Flask backend API directly
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

		const response = await fetch(
			`${backendUrl}/api/tools/threat-intelligence/feeds/sources`,
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
			console.error("Flask backend returned error:", errorText);
			return NextResponse.json(
				{
					success: false,
					sources: [],
					totalSources: 0,
					error: errorText,
				},
				{ status: response.status }
			);
		}
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
