"use client";

import { useState } from "react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export default function ModalContactForm({ isOpen, onClose }: Props) {
	const [showSuccess, setShowSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		const form = e.target as HTMLFormElement;
		const name = (form.elements.namedItem("name") as HTMLInputElement).value;
		const email = (form.elements.namedItem("email") as HTMLInputElement).value;
		const message = (form.elements.namedItem("message") as HTMLTextAreaElement)
			.value;

		// Validate form fields
		if (!name || !email || !message) {
			setError("All fields are required");
			setIsSubmitting(false);
			return;
		}

		try {
			// Use the Flask backend endpoint
			const res = await fetch("http://localhost:5000/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, message }),
			});

			const data = await res.json();

			if (res.ok) {
				form.reset();
				setShowSuccess(true);
				setTimeout(() => {
					setShowSuccess(false);
					onClose();
				}, 3000);
			} else {
				setError(data.error || "Failed to send message. Please try again.");
			}
		} catch (error) {
			setError(
				"Server Error: Could not connect to email service. Please try again later."
			);
			console.error("Email submission error:", error);
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
								className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
								disabled={isSubmitting}
								required
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
								className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
								disabled={isSubmitting}
								required
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
								className="w-full border border-gray-300 p-3 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black"
								disabled={isSubmitting}
								required
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
						<h3 className="text-lg font-semibold mb-2">
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
