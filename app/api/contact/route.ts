import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
	try {
		const { name, email, message } = await request.json();

		// Validate inputs
		const errors: Record<string, string> = {};

		if (!name || typeof name !== "string" || name.trim() === "") {
			errors.name = "Name is required";
		}

		if (!email || typeof email !== "string" || email.trim() === "") {
			errors.email = "Email is required";
		} else {
			// Simple email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				errors.email = "Invalid email format";
			}
		}

		if (!message || typeof message !== "string" || message.trim() === "") {
			errors.message = "Message is required";
		}

		// Return errors if validation fails
		if (Object.keys(errors).length > 0) {
			return NextResponse.json({ success: false, errors }, { status: 400 });
		}

		// For demonstration purposes: save to a local JSON file
		// In production, you would use a database or email service
		const contactsFile = path.join(process.cwd(), "data", "contacts.json");

		let contacts = [];

		// Create directory if it doesn't exist
		if (!fs.existsSync(path.join(process.cwd(), "data"))) {
			fs.mkdirSync(path.join(process.cwd(), "data"));
		}

		// Read existing contacts or create new file
		try {
			if (fs.existsSync(contactsFile)) {
				const fileContent = fs.readFileSync(contactsFile, "utf8");
				contacts = JSON.parse(fileContent);
			}
		} catch (error) {
			console.error("Error reading contacts file:", error);
		}

		// Add new contact message
		contacts.push({
			name,
			email,
			message,
			submittedAt: new Date().toISOString(),
		});

		// Save to file
		fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

		// In a real app, you would also send an email notification here

		return NextResponse.json(
			{
				success: true,
				message: "Thank you for your message! We'll get back to you soon.",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Contact form submission error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
