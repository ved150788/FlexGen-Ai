import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.json();

		// Validate inputs
		const errors: Record<string, string> = {};

		if (!formData.companyName || formData.companyName.trim() === "") {
			errors.companyName = "Company Name is required";
		}

		if (!formData.contactEmail || formData.contactEmail.trim() === "") {
			errors.contactEmail = "Email is required";
		} else {
			// Email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.contactEmail)) {
				errors.contactEmail = "Invalid email format";
			}
		}

		// Return errors if validation fails
		if (Object.keys(errors).length > 0) {
			return NextResponse.json({ success: false, errors }, { status: 400 });
		}

		// Here you would typically save the data to a database or send emails
		// For now, we'll just log and return a success response for testing
		console.log("Security audit request received:", formData);

		return NextResponse.json(
			{
				success: true,
				message: "Your security audit request has been submitted successfully.",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Security audit form error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
