import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Parse query parameters
		const searchParams = request.nextUrl.searchParams;
		const typeFilter = searchParams.get("type");
		const sourceFilter = searchParams.get("source");
		const timeFilter = searchParams.get("timeRange");
		const limit = searchParams.get("limit") || "100";

		// Build query string
		let queryParams = new URLSearchParams();
		if (typeFilter && typeFilter !== "all")
			queryParams.append("type", typeFilter);
		if (sourceFilter && sourceFilter !== "all")
			queryParams.append("source", sourceFilter);
		if (timeFilter && timeFilter !== "all")
			queryParams.append("timeRange", timeFilter);
		queryParams.append("limit", limit);

		// Call the Flask backend API - use the correct endpoint
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";
		const url = `${backendUrl}/api/iocs?${queryParams.toString()}`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store", // Prevent caching to always get fresh data
			});

			if (response.ok) {
				const data = await response.json();
				// Transform the backend response to match frontend expectations
				return NextResponse.json({
					results: data.iocs || [],
					pagination: data.pagination || {
						page: 1,
						limit: parseInt(limit),
						total: 0,
						totalPages: 0,
						hasNextPage: false,
						hasPrevPage: false,
					},
				});
			} else {
				console.error(
					"Backend returned error:",
					response.status,
					await response.text()
				);
				// Return empty data instead of mock data
				return NextResponse.json({
					results: [],
					pagination: {
						page: 1,
						limit: parseInt(limit),
						total: 0,
						totalPages: 0,
						hasNextPage: false,
						hasPrevPage: false,
					},
				});
			}
		} catch (error) {
			console.error("Error fetching IOCs:", error);
			// Return empty data instead of mock data
			return NextResponse.json({
				results: [],
				pagination: {
					page: 1,
					limit: parseInt(limit),
					total: 0,
					totalPages: 0,
					hasNextPage: false,
					hasPrevPage: false,
				},
			});
		}
	} catch (error) {
		console.error("Error in IOCs listing:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
