"use client";

import { useState, FormEvent } from "react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export default function ModalContactForm({ isOpen, onClose }: Props) {
	const [showSuccess, setShowSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const validateForm = () => {
		if (
			!formData.name.trim() ||
			!formData.email.trim() ||
			!formData.message.trim()
		) {
			setError("All fields are required");
			return false;
		}
		setError(null);
		return true;
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			// Call the Vercel deployed API endpoint
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					message: formData.message,
					phone: formData.phone,
					subject: "Modal Contact Form: Quick Inquiry",
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to submit form");
			}

			// Reset form
			setFormData({
				name: "",
				email: "",
				phone: "",
				message: "",
			});

			// Show success message
			setShowSuccess(true);
			
			// Close modal after 3 seconds
			setTimeout(() => {
				setShowSuccess(false);
				onClose();
			}, 3000);
		} catch (error) {
			console.error("Form submission error:", error);
			setError("Failed to submit the form. Please try again later.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Contact Form Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
				<div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-gray-800 border border-gray-200">
					<button
						className="absolute top-3 right-3 text-black text-xl font-bold hover:text-red-500"
						onClick={onClose}
						disabled={isSubmitting}
					>
						&times;
					</button>

					<h2 className="text-2xl font-semibold mb-6 text-center">
						Contact Us
					</h2>

					{error && (
						<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-left text-gray-700 mb-1"
							>
								Your Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								placeholder="John Doe"
								className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-800"
								disabled={isSubmitting}
								required
								value={formData.name}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-left text-gray-700 mb-1"
							>
								Email Address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								placeholder="john@example.com"
								className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-800"
								disabled={isSubmitting}
								required
								value={formData.email}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-left text-gray-700 mb-1"
							>
								Phone (Optional)
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								placeholder="+1 (123) 456-7890"
								className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-800"
								disabled={isSubmitting}
								value={formData.phone}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label
								htmlFor="message"
								className="block text-sm font-medium text-left text-gray-700 mb-1"
							>
								Message
							</label>
							<textarea
								id="message"
								name="message"
								rows={4}
								placeholder="Type your message..."
								className="w-full border border-gray-300 p-3 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black text-gray-800"
								disabled={isSubmitting}
								required
								value={formData.message}
								onChange={handleChange}
							></textarea>
						</div>

						<button
							type="submit"
							className={`w-full py-3 rounded-md transition ${
								isSubmitting
									? "bg-gray-400 cursor-not-allowed"
									: "bg-black text-white hover:bg-gray-800"
							}`}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Sending..." : "Submit"}
						</button>
					</form>
				</div>
			</div>

			{/* Thank You Modal */}
			{showSuccess && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
					<div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-sm animate-fadeIn">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-12 w-12 text-green-500 mx-auto mb-4"
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
						<h3 className="text-lg font-semibold mb-2 text-gray-800">
							Thank you for contacting us!
						</h3>
						<p className="text-sm text-gray-700">
							We will get back to you as soon as possible.
						</p>
					</div>
				</div>
			)}
		</>
	);
}
