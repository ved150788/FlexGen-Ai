"use client";

import { useState } from "react";

export default function NewsletterForm() {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) return;

		try {
			setStatus("loading");

			// In a real implementation, this would send the email to an API
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			console.log("Newsletter subscription:", email);
			setStatus("success");
			setEmail("");

			// Reset success message after 3 seconds
			setTimeout(() => {
				setStatus("idle");
			}, 3000);
		} catch (error) {
			console.error("Error subscribing to newsletter:", error);
			setStatus("error");
		}
	};

	return (
		<div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-xl overflow-hidden shadow-xl">
			<div className="p-6">
				<h2 className="text-xl font-bold mb-4">Subscribe to our newsletter</h2>
				<p className="text-gray-300 mb-4 text-sm">
					Get the latest cybersecurity insights delivered directly to your
					inbox.
				</p>

				<form onSubmit={handleSubmit} className="space-y-3">
					<input
						type="email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarySaffron text-black"
						required
					/>
					<button
						type="submit"
						disabled={status === "loading"}
						className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
							status === "loading"
								? "bg-gray-400 text-gray-700 cursor-not-allowed"
								: "bg-primarySaffron text-black hover:bg-white"
						}`}
					>
						{status === "loading" ? "Subscribing..." : "Subscribe"}
					</button>
				</form>

				{status === "success" && (
					<p className="text-green-400 text-sm mt-2">Thanks for subscribing!</p>
				)}

				{status === "error" && (
					<p className="text-red-400 text-sm mt-2">
						Something went wrong. Please try again.
					</p>
				)}

				<p className="text-xs text-gray-400 mt-3">
					We respect your privacy. Unsubscribe at any time.
				</p>
			</div>
		</div>
	);
}
