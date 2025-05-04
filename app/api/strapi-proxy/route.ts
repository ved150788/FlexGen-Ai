import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

/**
 * This route acts as a proxy to the Strapi API
 * It helps avoid CORS issues and can add authentication if needed
 */
export async function GET(request: NextRequest) {
	try {
		// Extract the endpoint from the request URL
		const endpoint = request.nextUrl.searchParams.get("endpoint");

		if (!endpoint) {
			return NextResponse.json(
				{ error: "Missing endpoint parameter" },
				{ status: 400 }
			);
		}

		// Construct a new URL with all the original query parameters except 'endpoint'
		const url = new URL(`${STRAPI_URL}/api/${endpoint}`);
		request.nextUrl.searchParams.forEach((value, key) => {
			if (key !== "endpoint") {
				url.searchParams.append(key, value);
			}
		});

		// Fetch data from Strapi
		const response = await fetch(url.toString());

		if (!response.ok) {
			return NextResponse.json(
				{ error: `Error from Strapi: ${response.statusText}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in Strapi proxy:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/**
 * Handle POST requests to the Strapi API
 */
export async function POST(request: NextRequest) {
	try {
		// Extract the endpoint from the request URL
		const endpoint = request.nextUrl.searchParams.get("endpoint");

		if (!endpoint) {
			return NextResponse.json(
				{ error: "Missing endpoint parameter" },
				{ status: 400 }
			);
		}

		// Get the request body
		const body = await request.json();

		// Fetch data from Strapi
		const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: `Error from Strapi: ${response.statusText}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in Strapi proxy:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
