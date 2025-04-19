// components/ContactInfo.tsx
export default function ContactInfo() {
	return (
		<section className="py-12 px-6 bg-[#0F0F0F] text-white">
			<div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 text-center">
				<div className="bg-[#1F1F1F] p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">📞 Phone</h3>
					<p>+91 98765 43210</p>
				</div>
				<div className="bg-[#1F1F1F] p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">📧 Email</h3>
					<p>contact@flexgen.ai</p>
				</div>
				<div className="bg-[#1F1F1F] p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">📍 Address</h3>
					<p>Bangalore | Varanasi | Global Remote Team</p>
				</div>
			</div>
		</section>
	);
}
