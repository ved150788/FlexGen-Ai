"use client";
import { useState } from "react";
import ModalContactForm from "./ModalContactForm";

export default function CtaSection() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<section className="bg-white text-black py-12 px-6">
			<div className="max-w-4xl mx-auto text-center">
				<h2 className="text-3xl font-bold mb-4">
					Ready to take your cybersecurity to the next level?
				</h2>
				<p className="mb-6 text-lg">
					Let Flexgen.ai protect your digital future with expert-led strategies,
					real-time monitoring, and AI-driven defenses.
				</p>

				{/* CTA Button */}
				<div className="flex items-center justify-center ">
					<button
						onClick={() => setIsOpen(true)}
						className="px-6 py-3 font-semibold border border-black rounded-lg transition
		bg-gray-800 to-blue-900 text-white hover:bg-black hover:text-white"
					>
						Contact Now
					</button>

					{/* Modal */}
					{isOpen && (
						<ModalContactForm
							isOpen={isOpen}
							onClose={() => setIsOpen(false)}
						/>
					)}
				</div>
			</div>
			{/* Modal */}
			{isOpen && (
				<ModalContactForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
			)}
		</section>
	);
}
