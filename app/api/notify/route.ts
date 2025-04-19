import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In a real application, you would use a database or email service API
// This is a simple implementation for demonstration purposes
export async function POST(request: NextRequest) {
	try {
		const { email, toolName = "unknown tool" } = await request.json();

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
		const notificationsFile = path.join(
			process.cwd(),
			"data",
			"tool-notifications.json"
		);

		let notifications = [];

		// Create directory if it doesn't exist
		if (!fs.existsSync(path.join(process.cwd(), "data"))) {
			fs.mkdirSync(path.join(process.cwd(), "data"));
		}

		// Read existing notifications or create new file
		try {
			if (fs.existsSync(notificationsFile)) {
				const fileContent = fs.readFileSync(notificationsFile, "utf8");
				notifications = JSON.parse(fileContent);
			}
		} catch (error) {
			console.error("Error reading notifications file:", error);
		}

		// Check if already subscribed
		const existingNotification = notifications.find(
			(notif: any) =>
				notif.email.toLowerCase() === email.toLowerCase() &&
				notif.toolName === toolName
		);

		if (existingNotification) {
			return NextResponse.json(
				{
					success: true,
					message: "You're already on the notification list for this tool!",
				},
				{ status: 200 }
			);
		}

		// Add new notification request
		notifications.push({
			email,
			toolName,
			requestedAt: new Date().toISOString(),
		});

		// Save to file
		fs.writeFileSync(notificationsFile, JSON.stringify(notifications, null, 2));

		return NextResponse.json(
			{
				success: true,
				message:
					"Thank you! We'll notify you when this tool becomes available.",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Notification request error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
