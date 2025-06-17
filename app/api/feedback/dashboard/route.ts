import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_FEEDBACK_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const searchParams = url.searchParams;
		const authHeader = request.headers.get("authorization");

		const headers: HeadersInit = {};

		if (authHeader) {
			headers["Authorization"] = authHeader;
		}

		const response = await fetch(
			`${BACKEND_URL}/api/feedback/dashboard?${searchParams.toString()}`,
			{
				method: "GET",
				headers,
			}
		);

		const data = await response.json();

		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Proxy error:", error);
		return NextResponse.json(
			{ success: false, message: "Network error. Please try again." },
			{ status: 500 }
		);
	}
}
