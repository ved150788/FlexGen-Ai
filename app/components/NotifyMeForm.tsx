"use client";

import { useState } from "react";

interface NotifyMeFormProps {
	toolName?: string;
	buttonText?: string;
	className?: string;
}

export default function NotifyMeForm({
	toolName = "",
	buttonText = "Subscribe",
	className = "",
}: NotifyMeFormProps) {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		try {
			// Send data to the API endpoint
			const response = await fetch("/api/notify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, toolName }),
			});

			const data = await response.json();

			if (response.ok) {
				setIsSuccess(true);
				setEmail("");
			} else {
				setError(data.message || "Failed to submit. Please try again.");
			}
		} catch (err) {
			setError("Failed to submit. Please try again.");
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className={className}>
			{isSuccess ? (
				<div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
					<p className="text-sm font-medium">
						Thanks for subscribing! We'll notify you when{" "}
						{toolName || "our product"} is available.
					</p>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-3">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Your email address"
						className="w-full px-4 py-2 border border-gray-300 rounded-md"
						required
					/>
					{error && <p className="text-red-500 text-xs">{error}</p>}
					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full bg-primarySaffron text-black font-medium py-2 px-4 rounded-md hover:bg-black hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? "Submitting..." : buttonText}
					</button>
				</form>
			)}
		</div>
	);
}
