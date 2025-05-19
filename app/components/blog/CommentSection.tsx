"use client";

import React, { useState } from "react";
import { FaComment, FaReply, FaThumbsUp, FaUser } from "react-icons/fa";
import Image from "next/image";

type Comment = {
	id: string;
	name: string;
	email: string;
	content: string;
	date: string;
	replies?: Comment[];
	likes?: number;
};

type CommentSectionProps = {
	postSlug: string;
};

const CommentSection: React.FC<CommentSectionProps> = ({ postSlug }) => {
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState({
		name: "",
		email: "",
		content: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Removed mock comments

	// Removed useEffect that loaded mock comments

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setNewComment((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");
		setSuccess("");

		try {
			// Validate inputs
			if (!newComment.name || !newComment.email || !newComment.content) {
				throw new Error("Please fill out all fields");
			}

			// In a real application, you would send this data to your backend
			// For now, we'll just add it to our local state
			const newCommentObj: Comment = {
				id: Date.now().toString(),
				name: newComment.name,
				email: newComment.email,
				content: newComment.content,
				date: new Date().toISOString(),
				likes: 0,
			};

			setComments([...comments, newCommentObj]);
			setNewComment({ name: "", email: "", content: "" });
			setSuccess("Comment submitted successfully!");
		} catch (err: any) {
			setError(err.message || "Failed to submit comment");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
			<h3 className="text-2xl font-bold mb-8 text-gray-900 flex items-center">
				<FaComment className="mr-2 text-blue-500" />
				Comments ({comments.length})
			</h3>

			{/* Comment List */}
			<div className="space-y-8 mb-10">
				{comments.length === 0 ? (
					<p className="text-gray-500">Be the first to comment on this post!</p>
				) : (
					comments.map((comment) => (
						<div
							key={comment.id}
							className="border-b border-gray-100 pb-8 last:border-b-0"
						>
							<div className="flex items-start">
								<div className="w-10 h-10 rounded-full overflow-hidden mr-4 bg-gray-200 flex items-center justify-center">
									<FaUser className="text-gray-600" />
								</div>
								<div className="flex-1">
									<div className="flex justify-between items-center">
										<h4 className="text-lg font-semibold text-gray-800">
											{comment.name}
										</h4>
										<span className="text-sm text-gray-500">
											{new Date(comment.date).toLocaleDateString()}
										</span>
									</div>
									<p className="text-gray-700 mt-2">{comment.content}</p>
									<div className="flex mt-4 space-x-4">
										<button className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
											<FaThumbsUp className="mr-1" />
											<span>{comment.likes} Likes</span>
										</button>
										<button className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
											<FaReply className="mr-1" />
											<span>Reply</span>
										</button>
									</div>
								</div>
							</div>

							{/* Replies */}
							{comment.replies && comment.replies.length > 0 && (
								<div className="ml-14 mt-6 space-y-6">
									{comment.replies.map((reply) => (
										<div
											key={reply.id}
											className="border-l-2 border-gray-100 pl-6"
										>
											<div className="flex items-start">
												<div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
													<FaUser className="text-gray-600 text-sm" />
												</div>
												<div className="flex-1">
													<div className="flex justify-between items-center">
														<h5 className="text-md font-semibold text-gray-800">
															{reply.name}
														</h5>
														<span className="text-xs text-gray-500">
															{new Date(reply.date).toLocaleDateString()}
														</span>
													</div>
													<p className="text-gray-700 mt-1 text-sm">
														{reply.content}
													</p>
													<div className="flex mt-3 space-x-4">
														<button className="flex items-center text-xs text-gray-500 hover:text-blue-600 transition-colors">
															<FaThumbsUp className="mr-1" />
															<span>{reply.likes} Likes</span>
														</button>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					))
				)}
			</div>

			{/* Comment Form */}
			<div className="bg-gray-50 rounded-xl p-6">
				<h4 className="text-xl font-semibold mb-6">Leave a Comment</h4>
				{error && (
					<div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">
						{error}
					</div>
				)}
				{success && (
					<div className="p-3 bg-green-100 text-green-700 rounded-lg mb-4">
						{success}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Name *
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={newComment.name}
								onChange={handleInputChange}
								placeholder="Your name"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email * (will not be published)
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={newComment.email}
								onChange={handleInputChange}
								placeholder="Your email"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="content"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Comment *
						</label>
						<textarea
							id="content"
							name="content"
							value={newComment.content}
							onChange={handleInputChange}
							placeholder="Your comment"
							rows={5}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required
						></textarea>
					</div>
					<button
						type="submit"
						disabled={isSubmitting}
						className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
					>
						{isSubmitting ? "Submitting..." : "Post Comment"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default CommentSection;
