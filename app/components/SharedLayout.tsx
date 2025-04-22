"use client";

interface SharedLayoutProps {
	children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
	return <>{children}</>;
}
