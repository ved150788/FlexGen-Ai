"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	MessageSquare,
	Calendar,
	Star,
	Clock,
	CheckCircle,
	AlertTriangle,
	RefreshCw,
	Search,
	Filter,
	Plus,
} from "lucide-react";
import { FloatingFeedbackButton } from "@/components/feedback/FeedbackButton";

import { useAuth } from "@/lib/hooks/useAuth";

interface Feedback {
	id: string;
	title: string;
	description: string;
	rating: number;
	category: string;
	module: string;
	status: string;
	priority: string;
	createdAt: string;
	updatedAt: string;
	resolvedAt?: string;
	comments?: Array<{
		id: string;
		content: string;
		isInternal: boolean;
		createdAt: string;
		user: {
			firstName: string;
			lastName: string;
			role: string;
		};
	}>;
}

export default function MyFeedbackPage() {
	const { user, isAdmin, loading: authLoading } = useAuth();
	const router = useRouter();

	const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

	// Redirect admin users to feedback dashboard
	useEffect(() => {
		if (!authLoading && user && isAdmin) {
			router.replace("/feedback-dashboard");
		}
	}, [user, isAdmin, authLoading, router]);

	const fetchMyFeedback = async () => {
		if (!user) return;

		setLoading(true);
		try {
			const params = new URLSearchParams({
				userId: user.id,
			});

			if (searchTerm) {
				params.append("search", searchTerm);
			}
			if (statusFilter) {
				params.append("status", statusFilter);
			}

			const response = await fetch(`/api/feedback?${params}`, {
				headers: {
					Authorization: `Bearer ${user.token || ""}`,
				},
			});

			if (response.ok) {
				const result = await response.json();
				setFeedbackList(result.data || []);
			} else {
				console.error("Failed to fetch feedback");
			}
		} catch (error) {
			console.error("Error fetching feedback:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMyFeedback();
	}, [user, searchTerm, statusFilter]);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "OPEN":
				return <Clock size={16} className="text-blue-500" />;
			case "IN_PROGRESS":
				return <RefreshCw size={16} className="text-yellow-500" />;
			case "RESOLVED":
				return <CheckCircle size={16} className="text-green-500" />;
			case "CLOSED":
				return <CheckCircle size={16} className="text-gray-500" />;
			default:
				return <AlertTriangle size={16} className="text-gray-400" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "OPEN":
				return "bg-blue-100 text-blue-800";
			case "IN_PROGRESS":
				return "bg-yellow-100 text-yellow-800";
			case "RESOLVED":
				return "bg-green-100 text-green-800";
			case "CLOSED":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getRatingStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<Star
				key={i}
				size={14}
				className={`${
					i < rating ? "text-yellow-500 fill-current" : "text-gray-300"
				}`}
			/>
		));
	};

	const getLatestDeveloperComment = (feedback: Feedback) => {
		if (!feedback.comments) return null;

		const developerComments = feedback.comments.filter(
			(comment) => !comment.isInternal && comment.user.role === "ADMIN"
		);

		return developerComments.length > 0
			? developerComments[developerComments.length - 1]
			: null;
	};

	const hasUpdates = (feedback: Feedback) => {
		const latestComment = getLatestDeveloperComment(feedback);
		if (!latestComment) return false;

		// Check if comment is newer than user's last view (you'd store this)
		// For now, just check if there are any developer comments
		return true;
	};

	const toggleExpanded = (feedbackId: string) => {
		setExpandedFeedback(expandedFeedback === feedbackId ? null : feedbackId);
	};

	// Show loading for admin users being redirected
	if (authLoading || !user || isAdmin) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 flex items-center">
								<MessageSquare size={28} className="mr-3 text-blue-600" />
								My Feedback
							</h1>
							<p className="mt-1 text-sm text-gray-600">
								Track your submitted feedback and responses
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<button
								onClick={fetchMyFeedback}
								className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
							>
								<RefreshCw size={16} className="mr-2" />
								Refresh
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white border-b">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center space-x-4">
						<div className="flex-1">
							<div className="relative">
								<Search
									size={20}
									className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
								/>
								<input
									type="text"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder="Search your feedback..."
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>
						<div>
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">All Statuses</option>
								<option value="OPEN">Open</option>
								<option value="IN_PROGRESS">In Progress</option>
								<option value="RESOLVED">Resolved</option>
								<option value="CLOSED">Closed</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading your feedback...</p>
					</div>
				) : feedbackList.length === 0 ? (
					<div className="text-center py-12">
						<MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No feedback submitted yet
						</h3>
						<p className="text-gray-600 mb-6">
							Submit your first feedback to help us improve!
						</p>
						{/* The floating feedback button is already available globally */}
					</div>
				) : (
					<>
						{/* Feedback List */}
						<div className="space-y-4">
							{feedbackList.map((feedback) => {
								const isExpanded = expandedFeedback === feedback.id;
								const latestComment = getLatestDeveloperComment(feedback);
								const hasNewUpdates = hasUpdates(feedback);

								return (
									<div
										key={feedback.id}
										className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
									>
										<div className="p-6">
											{/* Header */}
											<div className="flex items-start justify-between mb-4">
												<div className="flex-1">
													<div className="flex items-center space-x-3 mb-2">
														<h3 className="text-lg font-medium text-gray-900">
															{feedback.title}
														</h3>
														{hasNewUpdates && (
															<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
																Updated
															</span>
														)}
													</div>
													<div className="flex items-center space-x-4 text-sm text-gray-600">
														<span className="flex items-center">
															<span className="font-medium text-gray-700 mr-1">
																ID:
															</span>
															<span className="font-mono">{feedback.id}</span>
														</span>
														<span className="flex items-center">
															<span className="font-medium text-gray-700 mr-1">
																Module:
															</span>
															{feedback.module}
														</span>
														<span className="flex items-center">
															<Calendar size={14} className="mr-1" />
															{new Date(
																feedback.createdAt
															).toLocaleDateString()}
														</span>
													</div>
												</div>
												<div className="flex items-center space-x-3">
													{feedback.rating > 0 && (
														<div className="flex items-center space-x-1">
															{getRatingStars(feedback.rating)}
														</div>
													)}
													<span
														className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
															feedback.status
														)}`}
													>
														{getStatusIcon(feedback.status)}
														<span className="ml-1">{feedback.status}</span>
													</span>
												</div>
											</div>

											{/* Description */}
											<p className="text-gray-700 mb-4">
												{feedback.description}
											</p>

											{/* Latest Developer Response */}
											{latestComment && (
												<div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
													<div className="flex items-start space-x-3">
														<div className="flex-shrink-0">
															<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
																<span className="text-white text-sm font-medium">
																	{latestComment.user.firstName[0]}
																</span>
															</div>
														</div>
														<div className="flex-1">
															<div className="flex items-center space-x-2 mb-1">
																<span className="text-sm font-medium text-gray-900">
																	{latestComment.user.firstName}{" "}
																	{latestComment.user.lastName}
																</span>
																<span className="text-xs text-gray-500">
																	{new Date(
																		latestComment.createdAt
																	).toLocaleDateString()}
																</span>
															</div>
															<p className="text-sm text-gray-700">
																{latestComment.content}
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Expand/Collapse Button */}
											{feedback.comments && feedback.comments.length > 0 && (
												<button
													onClick={() => toggleExpanded(feedback.id)}
													className="text-blue-600 hover:text-blue-800 text-sm font-medium"
												>
													{isExpanded
														? "Hide conversation"
														: `Show conversation (${feedback.comments.length} comments)`}
												</button>
											)}

											{/* Expanded Comments */}
											{isExpanded && feedback.comments && (
												<div className="mt-4 space-y-3">
													{feedback.comments
														.filter((comment) => !comment.isInternal)
														.map((comment) => (
															<div
																key={comment.id}
																className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md"
															>
																<div className="flex-shrink-0">
																	<div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
																		<span className="text-white text-sm font-medium">
																			{comment.user.firstName[0]}
																		</span>
																	</div>
																</div>
																<div className="flex-1">
																	<div className="flex items-center space-x-2 mb-1">
																		<span className="text-sm font-medium text-gray-900">
																			{comment.user.firstName}{" "}
																			{comment.user.lastName}
																		</span>
																		<span className="text-xs text-gray-500">
																			{new Date(
																				comment.createdAt
																			).toLocaleDateString()}
																		</span>
																		{comment.user.role === "ADMIN" && (
																			<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
																				Staff
																			</span>
																		)}
																	</div>
																	<p className="text-sm text-gray-700">
																		{comment.content}
																	</p>
																</div>
															</div>
														))}
												</div>
											)}

											{/* Footer */}
											<div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t">
												<span>
													Last updated:{" "}
													{new Date(feedback.updatedAt).toLocaleDateString()}
												</span>
												{feedback.resolvedAt && (
													<span>
														Resolved:{" "}
														{new Date(feedback.resolvedAt).toLocaleDateString()}
													</span>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>

			{/* Don't show the floating button here since it's already global */}
		</div>
	);
}
