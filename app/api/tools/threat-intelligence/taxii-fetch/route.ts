import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Call the Flask backend API
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

		const response = await fetch(
			`${backendUrl}/api/tools/threat-intelligence/feeds/refresh`,
			{
				method: "POST",
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
			return NextResponse.json(
				{
					success: false,
					message: "Backend server error",
					error: errorText,
				},
				{ status: response.status }
			);
		}
	} catch (error) {
		console.error("Error in TAXII fetch route:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to connect to backend server",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
