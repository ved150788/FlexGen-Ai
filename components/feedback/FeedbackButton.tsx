"use client";

import React, { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

interface FeedbackButtonProps {
	currentModule?: string;
	userId?: string;
	username?: string;
	variant?: "header" | "sidebar" | "floating";
	className?: string;
}

export default function FeedbackButton({
	currentModule,
	userId,
	username,
	variant = "header",
	className = "",
}: FeedbackButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	// Different styles based on variant
	const getButtonStyles = () => {
		switch (variant) {
			case "sidebar":
				return `
          flex items-center w-full px-3 py-2 text-left text-sm font-medium text-gray-700 
          rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200
          ${className}
        `;
			case "floating":
				return `
          fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg 
          hover:bg-blue-700 transition-all duration-200 hover:scale-105 z-50
          ${className}
        `;
			case "header":
			default:
				return `
          inline-flex items-center px-3 py-2 border border-transparent text-sm 
          leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
          transition-colors duration-200
          ${className}
        `;
		}
	};

	const getButtonContent = () => {
		switch (variant) {
			case "sidebar":
				return (
					<>
						<MessageSquare size={16} className="mr-2" />
						Give Feedback
					</>
				);
			case "floating":
				return <MessageSquare size={20} />;
			case "header":
			default:
				return (
					<>
						<MessageSquare size={16} className="mr-2" />
						Give Feedback
					</>
				);
		}
	};

	return (
		<>
			<button
				onClick={openModal}
				className={getButtonStyles()}
				title={variant === "floating" ? "Give Feedback" : undefined}
			>
				{getButtonContent()}
			</button>

			<FeedbackModal
				isOpen={isModalOpen}
				onClose={closeModal}
				currentModule={currentModule}
				userId={userId}
				username={username}
			/>
		</>
	);
}

// Additional preset components for common use cases

export function HeaderFeedbackButton(
	props: Omit<FeedbackButtonProps, "variant">
) {
	return <FeedbackButton {...props} variant="header" />;
}

export function SidebarFeedbackButton(
	props: Omit<FeedbackButtonProps, "variant">
) {
	return <FeedbackButton {...props} variant="sidebar" />;
}

export function FloatingFeedbackButton(
	props: Omit<FeedbackButtonProps, "variant">
) {
	return <FeedbackButton {...props} variant="floating" />;
}
