import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Parse query parameters
		const searchParams = request.nextUrl.searchParams;
		const typeFilter = searchParams.get("type");
		const sourceFilter = searchParams.get("source");
		const timeFilter = searchParams.get("timeRange");
		const page = searchParams.get("page") || "1";
		const limit = searchParams.get("limit") || "10";

		// Build query string for Flask backend
		let queryParams = new URLSearchParams();
		if (typeFilter && typeFilter !== "all")
			queryParams.append("type", typeFilter);
		if (sourceFilter && sourceFilter !== "all")
			queryParams.append("source", sourceFilter);
		if (timeFilter && timeFilter !== "all")
			queryParams.append("timeRange", timeFilter);
		queryParams.append("page", page);
		queryParams.append("limit", limit);

		// Call the Flask backend API directly
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";
		const url = `${backendUrl}/api/tools/threat-intelligence/iocs/?${queryParams.toString()}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-store", // Prevent caching to always get fresh data
			signal: AbortSignal.timeout(30000), // 30 second timeout
		});

		if (response.ok) {
			const data = await response.json();
			console.log("Successfully loaded real IOC data from Flask backend");
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
