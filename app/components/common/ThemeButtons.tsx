import React from "react";

interface ButtonProps {
	href?: string;
	onClick?: () => void;
	children: React.ReactNode;
	className?: string;
	variant?: "primary" | "secondary" | "outline";
	fullWidth?: boolean;
	type?: "button" | "submit" | "reset";
}

export function ThemedButton({
	children,
	href,
	onClick,
	className = "",
	variant = "primary",
	fullWidth = false,
	type = "button",
}: ButtonProps) {
	// Base styles for all buttons
	const baseStyle =
		"inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 px-6 py-3";

	// Variant specific styles using custom gradients
	const variantStyles = {
		primary: "steel-gradient text-white hover:saffron-gradient",
		secondary: "bg-secondaryBlack text-white hover:steel-gradient",
		outline:
			"border-2 border-steelBlue text-steelBlue hover:saffron-gradient hover:border-transparent",
	};

	const buttonStyle = `${baseStyle} ${variantStyles[variant]} ${
		fullWidth ? "w-full" : ""
	} ${className}`;

	// Return an anchor tag for href, button otherwise
	if (href) {
		return (
			<a href={href} className={buttonStyle}>
				{children}
			</a>
		);
	}

	return (
		<button type={type} onClick={onClick} className={buttonStyle}>
			{children}
		</button>
	);
}

export function ThemeHeading({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<h2
			className={`text-2xl md:text-3xl font-bold text-steelBlue ${className}`}
		>
			{children}
		</h2>
	);
}

export function ThemeSubheading({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<h3 className={`text-xl font-semibold text-steelDark ${className}`}>
			{children}
		</h3>
	);
}

export function ThemedAccent({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span className={`text-steelBlue font-bold ${className}`}>{children}</span>
	);
}
