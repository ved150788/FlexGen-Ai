import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const query = searchParams.get("query");

		if (!query) {
			return NextResponse.json(
				{ error: "Query parameter is required" },
				{ status: 400 }
			);
		}

		// Call the Flask backend API
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";
		const response = await fetch(
			`${backendUrl}/api/search?query=${encodeURIComponent(query)}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return NextResponse.json(
				{ error: errorData.error || "Failed to fetch data from backend" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in threat intelligence search:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
