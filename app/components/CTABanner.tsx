// app/components/CTABanner.tsx
"use client";

export default function CTABanner() {
	return (
		<section className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-16 px-6">
			<div className="max-w-6xl mx-auto text-center">
				<h2 className="text-3xl md:text-4xl font-bold mb-4">
					Ready to fortify your digital future?
				</h2>
				<p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
					Get in touch with our cybersecurity experts and discover how
					FlexGen.ai can protect your business from evolving threats.
				</p>
				<a
					href="/contact"
					className="inline-block bg-primarySaffron text-black px-8 py-3 rounded-lg font-semibold shadow hover:bg-white transition"
				>
					Book a Free Consultation
				</a>
			</div>
		</section>
	);
}
