// components/HeroContact.tsx
export default function HeroContact() {
	return (
		<section className="relative bg-black text-white py-20 px-6 text-center overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-30 z-0" />
			<div className="relative z-10 max-w-4xl mx-auto">
				<h1 className="text-4xl md:text-5xl font-bold mb-4">
					Let’s Talk Security
				</h1>
				<p className="text-gray-300 text-lg">
					Reach out to <strong>Flexgen.ai</strong> — we’re here to secure your
					digital future.
				</p>
			</div>
		</section>
	);
}
