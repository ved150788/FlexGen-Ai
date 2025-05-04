import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST || "smtp.example.com",
	port: parseInt(process.env.EMAIL_PORT || "587"),
	secure: process.env.EMAIL_SECURE === "true",
	auth: {
		user: process.env.EMAIL_USER || "",
		pass: process.env.EMAIL_PASSWORD || "",
	},
});

export async function POST(request: NextRequest) {
	try {
		const { name, email, message, subject, phone } = await request.json();

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
		const newContact = {
			name,
			email,
			subject: subject || "New contact form submission",
			phone: phone || "Not provided",
			message,
			submittedAt: new Date().toISOString(),
		};

		contacts.push(newContact);

		// Save to file
		fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

		// Send email notification if configured
		let emailSent = false;
		if (process.env.EMAIL_ENABLED === "true") {
			try {
				// Create email content
				const mailOptions = {
					from: process.env.EMAIL_FROM || "noreply@flexgen.ai",
					to: process.env.EMAIL_TO || "contact@flexgen.ai",
					subject: `New Contact Form: ${subject || name}`,
					text: `
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}
${subject ? `Subject: ${subject}` : ""}

Message:
${message}
					`,
					html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
	<h2>New Contact Form Submission</h2>
	<p><strong>Name:</strong> ${name}</p>
	<p><strong>Email:</strong> ${email}</p>
	${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
	${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
	<div style="margin-top: 20px;">
		<p><strong>Message:</strong></p>
		<div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
			${message.replace(/\n/g, "<br>")}
		</div>
	</div>
</div>
					`,
				};

				// Send the email
				await transporter.sendMail(mailOptions);
				emailSent = true;
			} catch (emailError) {
				console.error("Error sending email:", emailError);
				// Continue execution - we'll still return success since we saved the contact
			}
		}

		return NextResponse.json(
			{
				success: true,
				message: "Thank you for your message! We'll get back to you soon.",
				emailSent,
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
