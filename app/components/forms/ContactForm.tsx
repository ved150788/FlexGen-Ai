"use client";

import React, { useState, useEffect } from "react";

interface FormData {
	name: string;
	email: string;
	phone: string;
	subject: string;
	message: string;
}

const ContactForm: React.FC = () => {
	const [showSuccess, setShowSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		name: "",
		email: "",
		phone: "",
		subject: "",
		message: "",
	});

	const [errors, setErrors] = useState<{
		name?: string;
		email?: string;
		message?: string;
		general?: string;
	}>({});

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const validateForm = (): boolean => {
		const newErrors: typeof errors = {};

		if (!formData.name.trim()) newErrors.name = "Name is required";

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (
			!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
		) {
			newErrors.email = "Enter a valid email";
		}

		if (!formData.message.trim()) newErrors.message = "Message is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setErrors({});

		try {
			// Call deployed Vercel API endpoint instead of local Flask server
			const response = await fetch(
				"https://your-vercel-deployment-url.vercel.app/api/contact",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: formData.name,
						email: formData.email,
						message: formData.message,
						phone: formData.phone,
						subject: "Contact Form: Inquiry",
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to submit form");
			}

			// Reset form
			setFormData({
				name: "",
				email: "",
				phone: "",
				subject: "",
				message: "",
			});

			// Show success message
			setShowSuccess(true);
			setErrors({});

			// Hide success message after 3 seconds
			setTimeout(() => setShowSuccess(false), 3000);
		} catch (error) {
			console.error("Form submission error:", error);
			setErrors({
				general:
					error instanceof Error
						? error.message
						: "Failed to submit the form. Please try again later.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle clicks outside the success modal to close it
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (showSuccess) {
				const modal = document.getElementById("success-modal");
				if (modal && !modal.contains(e.target as Node)) {
					setShowSuccess(false);
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showSuccess]);

	return (
		<div className="text-white">
			{errors.general && (
				<div className="mb-4 p-3 bg-red-900/60 text-red-100 rounded-md border border-red-500">
					{errors.general}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-5">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div>
						<label htmlFor="name" className="block text-sm font-medium mb-1">
							Your Name*
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="John Doe"
							className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
							disabled={isSubmitting}
						/>
						{errors.name && (
							<p className="text-red-400 text-sm mt-1">{errors.name}</p>
						)}
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium mb-1">
							Email Address*
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="john@example.com"
							className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
							disabled={isSubmitting}
						/>
						{errors.email && (
							<p className="text-red-400 text-sm mt-1">{errors.email}</p>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div>
						<label htmlFor="phone" className="block text-sm font-medium mb-1">
							Phone (Optional)
						</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							placeholder="+1 (555) 123-4567"
							className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
							disabled={isSubmitting}
						/>
					</div>

					<div>
						<label htmlFor="subject" className="block text-sm font-medium mb-1">
							Subject
						</label>
						<input
							type="text"
							id="subject"
							name="subject"
							value={formData.subject}
							onChange={handleChange}
							placeholder="How can we help?"
							className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
							disabled={isSubmitting}
						/>
					</div>
				</div>

				<div>
					<label htmlFor="message" className="block text-sm font-medium mb-1">
						Your Message*
					</label>
					<textarea
						id="message"
						name="message"
						value={formData.message}
						onChange={handleChange}
						rows={4}
						placeholder="Type your message here..."
						className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
						disabled={isSubmitting}
					></textarea>
					{errors.message && (
						<p className="text-red-400 text-sm mt-1">{errors.message}</p>
					)}
				</div>

				<button
					type="submit"
					className={`w-full bg-gradient-to-br from-blue-600 to-blue-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-md flex justify-center items-center ${
						isSubmitting
							? "opacity-70 cursor-not-allowed"
							: "hover:from-blue-700 hover:to-blue-900 transform hover:-translate-y-1"
					}`}
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<>
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Sending...
						</>
					) : (
						"Send Message"
					)}
				</button>
			</form>

			{/* Thank You Message */}
			{showSuccess && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
					<div
						id="success-modal"
						className="bg-gray-900 p-8 rounded-lg shadow-lg text-center w-[90%] max-w-sm animate-fadeIn border border-blue-500"
					>
						<button
							onClick={() => setShowSuccess(false)}
							className="absolute top-2 right-2 bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-600 transition-colors"
						>
							×
						</button>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-16 w-16 text-green-500 mx-auto mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<h3 className="text-xl font-semibold mb-3 text-white">
							Thank you for contacting us!
						</h3>
						<p className="text-gray-300">
							We will get back to you as soon as possible.
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default ContactForm;
