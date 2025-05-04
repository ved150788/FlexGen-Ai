"use client";

import { useState } from "react";
import SecurityAuditModalForm from "../common/SecurityAuditModalForm";

interface SecurityAuditCTAProps {
	variant?: "primary" | "secondary" | "outline";
	className?: string;
	text?: string;
}

export default function SecurityAuditCTA({
	variant = "primary",
	className = "",
	text = "Request Security Audit",
}: SecurityAuditCTAProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Base styles
	const baseStyles =
		"inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 text-base";

	// Variant styles
	const variantStyles = {
		primary:
			"bg-gradient-to-br from-slate-900 to-blue-900 text-white hover:bg-white",
		secondary: "bg-white text-black hover:bg-gray-800 hover:text-white",
		outline:
			"bg-transparent border border-white text-white hover:bg-white hover:text-black",
	};

	return (
		<>
			<button
				onClick={() => setIsModalOpen(true)}
				className={`${baseStyles} ${variantStyles[variant]} ${className}`}
			>
				{text}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-5 w-5 ml-2"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5l7 7-7 7"
					/>
				</svg>
			</button>

			{isModalOpen && (
				<SecurityAuditModalForm
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</>
	);
}
