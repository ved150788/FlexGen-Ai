"use client";

import { useState } from "react";
import SecurityAuditModal from "./SecurityAuditModal";

interface Props {
	variant?: "primary" | "secondary" | "outline";
	className?: string;
	fullWidth?: boolean;
	text?: string;
}

export default function SecurityAuditCTA({
	variant = "primary",
	className = "",
	fullWidth = false,
	text = "Get Free Security Audit",
}: Props) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const openModal = () => {
		setIsLoading(true);
		// Simulate loading for a smoother transition
		setTimeout(() => {
			setIsModalOpen(true);
			setIsLoading(false);
		}, 300);
	};

	const closeModal = () => setIsModalOpen(false);

	const baseStyle =
		"inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 px-6 py-3";

	const variantStyles = {
		primary: "steel-gradient text-white hover:saffron-gradient",
		secondary: "bg-secondaryBlack text-white hover:steel-gradient",
		outline:
			"border-2 border-steelBlue text-steelBlue hover:saffron-gradient hover:border-transparent",
	};

	const buttonStyle = `${baseStyle} ${variantStyles[variant]} ${
		fullWidth ? "w-full" : ""
	} ${className}`;

	return (
		<>
			<button onClick={openModal} className={buttonStyle} disabled={isLoading}>
				{isLoading ? (
					<>
						<svg
							className="animate-spin -ml-1 mr-3 h-5 w-5"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Loading...
					</>
				) : (
					<>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 mr-2"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
						{text}
					</>
				)}
			</button>

			<SecurityAuditModal isOpen={isModalOpen} onClose={closeModal} />
		</>
	);
}
