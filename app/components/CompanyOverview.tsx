export default function CompanyOverview() {
	return (
		<section className="text-center py-20 steel-gradient text-white">
			<h1 className="text-5xl font-bold mb-4">About Us</h1>
			<p className="text-lg max-w-2xl mx-auto">
				We're a team of cybersecurity experts on a mission to predict, prevent,
				and protect.
			</p>
			<div className="mt-8">
				<a
					href="/contact"
					className="inline-block bg-secondaryBlack text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:saffron-gradient transform hover:scale-105 hover:shadow-lg"
				>
					Talk to an Expert
				</a>
			</div>
		</section>
	);
}
