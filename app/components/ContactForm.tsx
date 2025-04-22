"use client";

import React, { useState } from "react";

const ContactForm: React.FC = () => {
	const [showSuccess, setShowSuccess] = useState(false);
	const [errors, setErrors] = useState<{
		name?: string;
		email?: string;
		message?: string;
	}>({});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const form = e.target as HTMLFormElement;
		const name = (
			form.elements.namedItem("name") as HTMLInputElement
		).value.trim();
		const email = (
			form.elements.namedItem("email") as HTMLInputElement
		).value.trim();
		const message = (
			form.elements.namedItem("message") as HTMLTextAreaElement
		).value.trim();

		// Inline validation
		const newErrors: typeof errors = {};
		if (!name) newErrors.name = "Name is required";
		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/^\S+@\S+\.\S+$/.test(email)) {
			newErrors.email = "Enter a valid email";
		}
		if (!message) newErrors.message = "Message is required";

		setErrors(newErrors);
		if (Object.keys(newErrors).length > 0) return;

		// Send email logic
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, message }),
			});

			if (res.ok) {
				form.reset();
				setShowSuccess(true);
				setErrors({});
				setTimeout(() => setShowSuccess(false), 3000);
			} else {
				const err = await res.json();
				setErrors({
					name: err.errors?.name || "",
					email: err.errors?.email || "",
					message: err.errors?.message || "",
				});
			}
		} catch (error) {
			console.error("Error submitting form:", error);
			setErrors({
				...errors,
				message: "An error occurred. Please try again later.",
			});
		}
	};

	return (
		<section id="contact" className="py-12 px-6 text-black steel-gradient">
			<div className="max-w-3xl mx-auto bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 shadow-lg">
				<h2 className="text-3xl font-bold text-center mb-4">Contact Us</h2>

				<p className="text-center text-lg mb-6">
					📧 Email us at:{" "}
					<a
						href="mailto:hello@flexgen.ai"
						className="font-semibold underline hover:text-primarySaffron transition-colors duration-200"
					>
						hello@flexgen.ai
					</a>
				</p>

				<form
					onSubmit={handleSubmit}
					className="rounded-lg p-6 space-y-4 bg-white bg-opacity-5 border border-white border-opacity-20"
				>
					<div>
						<label htmlFor="name" className="block text-sm font-medium">
							Your Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							placeholder="John Doe"
							className="bg-white text-black mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steelBlue transition-all duration-200"
						/>
						{errors.name && (
							<p className="text-red-400 text-sm mt-1">{errors.name}</p>
						)}
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium">
							Email Address
						</label>
						<input
							type="email"
							id="email"
							name="email"
							placeholder="john@example.com"
							className="bg-white text-black mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steelBlue transition-all duration-200"
						/>
						{errors.email && (
							<p className="text-red-400 text-sm mt-1">{errors.email}</p>
						)}
					</div>

					<div>
						<label htmlFor="message" className="block text-sm font-medium">
							Your Message
						</label>
						<textarea
							id="message"
							name="message"
							rows={4}
							placeholder="Type your message"
							className="bg-white text-black mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steelBlue transition-all duration-200"
						></textarea>
						{errors.message && (
							<p className="text-red-400 text-sm mt-1">{errors.message}</p>
						)}
					</div>

					<button
						type="submit"
						className="w-full steel-gradient hover:saffron-gradient text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-md"
					>
						Send Message
					</button>
				</form>
			</div>

			{/* Thank You Message */}
			{showSuccess && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
					<div className="steel-gradient p-6 rounded-lg shadow-lg text-center w-[90%] max-w-sm animate-fadeIn">
						<button
							onClick={() => setShowSuccess(false)}
							className="absolute top-2 right-2 bg-white bg-opacity-20 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-30 transition-colors"
						>
							×
						</button>
						<h3 className="text-lg font-semibold mb-2 text-white">
							Thank you for contacting us!
						</h3>
						<p className="text-sm text-white text-opacity-90">
							We will get back to you as soon as possible.
						</p>
					</div>
				</div>
			)}
		</section>
	);
};

export default ContactForm;
