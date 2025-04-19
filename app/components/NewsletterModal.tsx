"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import NotifyMeForm from "./NotifyMeForm";

export default function NewsletterModal() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Show modal after 5 seconds on the site
		const timer = setTimeout(() => {
			const hasSeenModal = localStorage.getItem("hasSeenNewsletterModal");
			if (!hasSeenModal) {
				setIsOpen(true);
			}
		}, 5000);

		return () => clearTimeout(timer);
	}, []);

	const closeModal = () => {
		setIsOpen(false);
		localStorage.setItem("hasSeenNewsletterModal", "true");
	};

	return (
		<Dialog open={isOpen} onClose={closeModal} className="relative z-50">
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			{/* Full-screen container to center the panel */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
					<div className="flex justify-between items-start mb-4">
						<Dialog.Title className="text-lg font-medium">
							Stay Updated with FlexGen
						</Dialog.Title>
						<button
							onClick={closeModal}
							className="rounded-full p-1 hover:bg-gray-100"
						>
							<X size={20} />
						</button>
					</div>

					<Dialog.Description className="mb-4 text-sm text-gray-600">
						Subscribe to our newsletter to get the latest updates on AI tools,
						features, and resources.
					</Dialog.Description>

					<NotifyMeForm buttonText="Subscribe to Newsletter" className="mt-4" />

					<p className="mt-4 text-xs text-gray-500 text-center">
						We respect your privacy. Unsubscribe at any time.
					</p>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}
