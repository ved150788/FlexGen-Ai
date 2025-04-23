"use client";

import { useState } from "react";

export default function CommentForm() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		comment: "",
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real implementation, this would send the comment to an API
		console.log("Comment submitted:", formData);
		alert("Thank you for your comment!");

		// Reset form
		setFormData({
			name: "",
			email: "",
			comment: "",
		});
	};

	return (
		<div className="mb-8">
			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label
						htmlFor="comment"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Leave a comment
					</label>
					<textarea
						id="comment"
						name="comment"
						rows={4}
						value={formData.comment}
						onChange={handleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron"
						placeholder="Share your thoughts on this article..."
						required
					></textarea>
				</div>
				<div className="grid grid-cols-2 gap-4 mb-4">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron"
							placeholder="Your name"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron"
							placeholder="Your email (not published)"
							required
						/>
					</div>
				</div>
				<button
					type="submit"
					className="bg-primarySaffron text-black px-6 py-2 rounded-md font-medium hover:bg-primarySaffron/90 transition-colors"
				>
					Post Comment
				</button>
			</form>
		</div>
	);
}
