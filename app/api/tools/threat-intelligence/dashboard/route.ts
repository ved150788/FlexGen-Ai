import { NextResponse } from "next/server";

export async function GET() {
	try {
		// Call the Flask backend API directly
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

		const response = await fetch(
			`${backendUrl}/api/tools/threat-intelligence/dashboard/`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store", // Ensure we always get fresh data
				signal: AbortSignal.timeout(30000), // 30 second timeout
			}
		);

		if (response.ok) {
			const data = await response.json();
			console.log("Successfully loaded real dashboard data from Flask backend");
			return NextResponse.json(data);
		} else {
			const errorText = await response.text();
			console.error("Flask backend returned error:", errorText);
			return NextResponse.json(
				{
					error: "Backend server error",
					details: errorText,
					version: "42.0.0",
				},
				{ status: response.status }
			);
		}
	} catch (error) {
		console.error("Error connecting to Flask backend:", error);
		return NextResponse.json(
			{
				error: "Failed to connect to backend server",
				details: error instanceof Error ? error.message : "Unknown error",
				version: "42.0.0",
			},
			{ status: 500 }
		);
	}
}
