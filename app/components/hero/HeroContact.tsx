// components/HeroContact.tsx
export default function HeroContact() {
	return (
		<section className="relative bg-gray-800 text-white py-32 px-6 text-center overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 z-0" />
			<div className="absolute inset-0 opacity-10 bg-[url('/images/circuit-pattern.svg')] bg-repeat z-0" />

			<div className="relative z-10 max-w-4xl mx-auto">
				<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
					Let's Talk Security
				</h1>
				<p className="text-gray-300 text-xl max-w-2xl mx-auto">
					Ready to secure your digital future? Reach out to{" "}
					<strong className="text-blue-300">Flexgen.ai</strong> — we're here to
					protect what matters most.
				</p>
			</div>
		</section>
	);
}
