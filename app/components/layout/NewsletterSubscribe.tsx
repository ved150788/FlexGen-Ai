"use client";

import { useState } from "react";

interface NewsletterSubscribeProps {
	variant?: "default" | "minimal" | "footer";
	title?: string;
	description?: string;
	buttonText?: string;
	placeholder?: string;
	className?: string;
	topic?: string; // Optional topic for subscription targeting
}

export default function NewsletterSubscribe({
	variant = "default",
	title = "Subscribe to our newsletter",
	description = "Stay updated with our latest security insights and tools",
	buttonText = "Subscribe",
	placeholder = "Enter your email",
	className = "",
	topic = "general",
}: NewsletterSubscribeProps) {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !email.includes("@")) {
			setStatus("error");
			setMessage("Please enter a valid email address");
			return;
		}

		setStatus("loading");

		try {
			const response = await fetch("/api/subscribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, topic }),
			});

			const data = await response.json();

			if (response.ok) {
				setStatus("success");
				setMessage(data.message || "Thank you for subscribing!");
				setEmail("");
			} else {
				setStatus("error");
				setMessage(data.message || "Something went wrong. Please try again.");
			}
		} catch (error) {
			setStatus("error");
			setMessage("Something went wrong. Please try again.");
		}
	};

	// Variants styling
	const getContainerStyles = () => {
		switch (variant) {
			case "minimal":
				return "py-4";
			case "footer":
				return "py-4 text-white";
			default:
				return "bg-white p-6 rounded-lg shadow-md";
		}
	};

	return (
		<div className={`${getContainerStyles()} ${className}`}>
			{variant !== "minimal" && (
				<>
					<h3
						className={`font-semibold text-lg mb-2 ${
							variant === "footer" ? "text-white" : "text-gray-800"
						}`}
					>
						{title}
					</h3>
					<p
						className={`text-sm mb-4 ${
							variant === "footer" ? "text-gray-300" : "text-gray-600"
						}`}
					>
						{description}
					</p>
				</>
			)}

			<form onSubmit={handleSubmit} className="space-y-3">
				<div className="flex flex-col sm:flex-row gap-2">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder={placeholder}
						className={`px-4 py-2 w-full ${
							variant === "footer"
								? "bg-gray-700 text-white border-gray-600 focus:border-gray-500"
								: "border-gray-300 text-gray-800"
						} border rounded-md focus:outline-none focus:ring-1 focus:ring-primarySaffron`}
						disabled={status === "loading" || status === "success"}
					/>
					<button
						type="submit"
						className={`px-4 py-2 font-medium rounded-md transition ${
							status === "loading"
								? "bg-gray-400 cursor-not-allowed"
								: status === "success"
								? "bg-green-500 text-white"
								: "bg-white text-black hover:bg-black hover:text-white"
						} ${variant === "minimal" ? "w-auto" : "w-full sm:w-auto"}`}
						disabled={status === "loading" || status === "success"}
					>
						{status === "loading"
							? "Processing..."
							: status === "success"
							? "Subscribed!"
							: buttonText}
					</button>
				</div>

				{status !== "idle" && (
					<p
						className={`text-sm mt-2 ${
							status === "error"
								? "text-red-500"
								: status === "success"
								? "text-green-500"
								: "text-gray-500"
						}`}
					>
						{message}
					</p>
				)}

				<p
					className={`text-xs ${
						variant === "footer" ? "text-gray-400" : "text-gray-500"
					}`}
				>
					We respect your privacy. Unsubscribe at any time.
				</p>
			</form>
		</div>
	);
}
