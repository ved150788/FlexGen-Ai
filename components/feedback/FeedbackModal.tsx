"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Star, AlertCircle, CheckCircle } from "lucide-react";

interface FeedbackModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentModule?: string;
	userId?: string;
	username?: string;
}

interface FeedbackFormData {
	module: string;
	comments: string;
	rating: number;
	file: File | null;
}

const FLEXGEN_MODULES = [
	"Dashboard",
	"API Fuzzer",
	"AI Recon Bot",
	"Vulnerability Scanner",
	"Web App Pentester Pro",
	"Smart WAF Tester",
	"Form Input Scanner",
	"Automated Report Generator",
	"Misconfiguration Checker",
	"Threat Intelligence",
	"Settings",
	"User Management",
];

export default function FeedbackModal({
	isOpen,
	onClose,
	currentModule = "Dashboard",
	userId,
	username,
}: FeedbackModalProps) {
	const [formData, setFormData] = useState<FeedbackFormData>({
		module: currentModule,
		comments: "",
		rating: 0,
		file: null,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [feedbackId, setFeedbackId] = useState<string>("");

	// Reset form when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			setFormData({
				module: currentModule,
				comments: "",
				rating: 0,
				file: null,
			});
			setErrors({});
			setIsSuccess(false);
			setFeedbackId("");
		}
	}, [isOpen, currentModule]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Required comments validation
		if (!formData.comments.trim()) {
			newErrors.comments = "Comments are required";
		} else if (formData.comments.trim().length < 10) {
			newErrors.comments = "Comments must be at least 10 characters long";
		}

		// File size validation (max 5MB)
		if (formData.file && formData.file.size > 5 * 1024 * 1024) {
			newErrors.file = "File size must be less than 5MB";
		}

		// File type validation
		if (formData.file) {
			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"text/plain",
				"application/pdf",
			];
			if (!allowedTypes.includes(formData.file.type)) {
				newErrors.file =
					"File type not supported. Please upload images, text files, or PDFs only.";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			const formDataToSend = new FormData();
			formDataToSend.append("module", formData.module);
			formDataToSend.append("comments", formData.comments);
			formDataToSend.append("rating", formData.rating.toString());
			formDataToSend.append("userId", userId || "");
			formDataToSend.append("username", username || "");

			if (formData.file) {
				formDataToSend.append("attachment", formData.file);
			}

			const response = await fetch("/api/feedback", {
				method: "POST",
				body: formDataToSend,
			});

			const result = await response.json();

			if (response.ok) {
				setIsSuccess(true);
				setFeedbackId(result.data.id);
			} else {
				setErrors({ submit: result.message || "Failed to submit feedback" });
			}
		} catch {
			setErrors({ submit: "Network error. Please try again." });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setFormData((prev) => ({ ...prev, file }));

		// Clear file error when new file is selected
		if (errors.file) {
			setErrors((prev) => ({ ...prev, file: "" }));
		}
	};

	const handleRatingClick = (rating: number) => {
		setFormData((prev) => ({ ...prev, rating }));
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b">
					<h2 className="text-xl font-semibold text-gray-900">Give Feedback</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						disabled={isSubmitting}
					>
						<X size={24} />
					</button>
				</div>

				{/* Success State */}
				{isSuccess ? (
					<div className="p-6 text-center">
						<CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Thank you—your feedback has been recorded!
						</h3>
						<p className="text-gray-600 mb-4">
							Feedback ID:{" "}
							<span className="font-mono text-sm">{feedbackId}</span>
						</p>
						<button
							onClick={onClose}
							className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
						>
							Close
						</button>
					</div>
				) : (
					/* Form */
					<form onSubmit={handleSubmit} className="p-6 space-y-4">
						{/* Module Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Module/Feature *
							</label>
							<select
								value={formData.module}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, module: e.target.value }))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{FLEXGEN_MODULES.map((module) => (
									<option key={module} value={module}>
										{module}
									</option>
								))}
							</select>
						</div>

						{/* Rating */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Rating (Optional)
							</label>
							<div className="flex items-center space-x-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										type="button"
										onClick={() => handleRatingClick(star)}
										className={`p-1 ${
											star <= formData.rating
												? "text-yellow-500"
												: "text-gray-300"
										} hover:text-yellow-400 transition-colors`}
									>
										<Star size={20} fill="currentColor" />
									</button>
								))}
								{formData.rating > 0 && (
									<span className="ml-2 text-sm text-gray-600">
										({formData.rating}/5)
									</span>
								)}
							</div>
						</div>

						{/* Comments */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Comments *
							</label>
							<textarea
								value={formData.comments}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, comments: e.target.value }))
								}
								placeholder="Please describe your feedback in detail..."
								rows={4}
								className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									errors.comments ? "border-red-500" : "border-gray-300"
								}`}
							/>
							{errors.comments && (
								<p className="mt-1 text-sm text-red-600 flex items-center">
									<AlertCircle size={16} className="mr-1" />
									{errors.comments}
								</p>
							)}
						</div>

						{/* File Upload */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Attachment (Optional)
							</label>
							<div className="relative">
								<input
									type="file"
									onChange={handleFileChange}
									accept=".jpg,.jpeg,.png,.gif,.txt,.pdf"
									className="hidden"
									id="file-upload"
								/>
								<label
									htmlFor="file-upload"
									className={`flex items-center justify-center w-full px-3 py-2 border-2 border-dashed rounded-md cursor-pointer hover:border-blue-400 transition-colors ${
										errors.file ? "border-red-500" : "border-gray-300"
									}`}
								>
									<Upload size={16} className="mr-2 text-gray-400" />
									<span className="text-sm text-gray-600">
										{formData.file ? formData.file.name : "Choose file"}
									</span>
								</label>
							</div>
							{errors.file && (
								<p className="mt-1 text-sm text-red-600 flex items-center">
									<AlertCircle size={16} className="mr-1" />
									{errors.file}
								</p>
							)}
							<p className="mt-1 text-xs text-gray-500">
								Supported: JPG, PNG, GIF, TXT, PDF (Max 5MB)
							</p>
						</div>

						{/* Submit Error */}
						{errors.submit && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-sm text-red-600 flex items-center">
									<AlertCircle size={16} className="mr-2" />
									{errors.submit}
								</p>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isSubmitting}
							className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
								isSubmitting
									? "bg-gray-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700"
							} text-white`}
						>
							{isSubmitting ? "Submitting..." : "Submit Feedback"}
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
