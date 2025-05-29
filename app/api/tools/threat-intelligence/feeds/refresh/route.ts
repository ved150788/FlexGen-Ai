import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Call the Flask backend API with the correct endpoint
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

		try {
			const response = await fetch(`${backendUrl}/api/refresh-data`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store", // Ensure we always get fresh data
			});

			if (response.ok) {
				const data = await response.json();

				// Transform the backend response to match frontend expectations
				const transformedData = {
					success: data.success,
					message: data.message,
					results: data.sources || {},
					totalAdded: Object.values(data.sources || {}).reduce(
						(sum: number, count: any) => sum + count,
						0
					),
				};

				return NextResponse.json(transformedData);
			} else {
				const errorText = await response.text();
				console.error("Backend returned error:", errorText);
				return NextResponse.json(
					{
						success: false,
						message: `Backend error: ${errorText}`,
						results: {},
						totalAdded: 0,
					},
					{ status: response.status }
				);
			}
		} catch (error) {
			console.error("Error in feeds refresh API:", error);
			return NextResponse.json(
				{
					success: false,
					message: `Error refreshing feeds: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
					results: {},
					totalAdded: 0,
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Error in feeds refresh route:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
				results: {},
				totalAdded: 0,
			},
			{ status: 500 }
		);
	}
}
