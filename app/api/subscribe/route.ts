import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In a real application, you would use a database or email service API
// This is a simple implementation for demonstration purposes
export async function POST(request: NextRequest) {
	try {
		const { email, topic = "general" } = await request.json();

		// Validate email
		if (!email || typeof email !== "string") {
			return NextResponse.json(
				{ success: false, message: "Email is required" },
				{ status: 400 }
			);
		}

		// Simple email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ success: false, message: "Invalid email format" },
				{ status: 400 }
			);
		}

		// For demo purposes: save to a local JSON file
		// In production, you would use a database or email service API
		const subscribersFile = path.join(
			process.cwd(),
			"data",
			"subscribers.json"
		);

		let subscribers = [];

		// Create directory if it doesn't exist
		if (!fs.existsSync(path.join(process.cwd(), "data"))) {
			fs.mkdirSync(path.join(process.cwd(), "data"));
		}

		// Read existing subscribers or create new file
		try {
			if (fs.existsSync(subscribersFile)) {
				const fileContent = fs.readFileSync(subscribersFile, "utf8");
				subscribers = JSON.parse(fileContent);
			}
		} catch (error) {
			console.error("Error reading subscribers file:", error);
		}

		// Check if already subscribed
		const existingSubscriber = subscribers.find(
			(sub: any) =>
				sub.email.toLowerCase() === email.toLowerCase() && sub.topic === topic
		);

		if (existingSubscriber) {
			return NextResponse.json(
				{ success: true, message: "You're already subscribed to this topic!" },
				{ status: 200 }
			);
		}

		// Add new subscriber
		subscribers.push({
			email,
			topic,
			subscribedAt: new Date().toISOString(),
		});

		// Save to file
		fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));

		// In a real application, you would also:
		// 1. Add the user to your email marketing platform (Mailchimp, SendGrid, etc.)
		// 2. Send a confirmation email
		// 3. Store the data in a database

		return NextResponse.json(
			{
				success: true,
				message: "Thank you for subscribing to our newsletter!",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Subscription error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
