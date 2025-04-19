export default function CompanyOverview() {
	return (
		<section className="py-16 px-6 bg-white">
			<h2 className="text-3xl font-bold text-center mb-12">Who We Are</h2>

			<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column: Vision & Mission */}
				<div className="flex flex-col gap-6">
					{/* Vision */}
					<div className="border bg-white rounded-xl shadow-md p-6">
						<h3 className="text-xl font-semibold text-primarySaffron mb-2">
							🌟 Vision
						</h3>
						<p className="text-gray-700">
							To be the most trusted AI-powered cybersecurity company protecting
							digital ecosystems globally.
						</p>
					</div>

					{/* Mission */}
					<div className="border bg-white rounded-xl shadow-md p-6">
						<h3 className="text-xl font-semibold text-primarySaffron mb-2">
							🎯 Mission
						</h3>
						<p className="text-gray-700">
							Empowering organizations with real-time protection, AI-driven
							threat detection, and expert-led security strategies.
						</p>
					</div>
				</div>

				{/* Right Column: Company Profile (spans 2 rows) */}
				<div className="border bg-white rounded-xl shadow-md p-6 lg:col-span-2 flex flex-col justify-center">
					<h3 className="text-xl font-semibold text-primarySaffron mb-4">
						🏢 Company Profile
					</h3>
					<p className="text-gray-700 leading-relaxed">
						FlexGen.ai is a cutting-edge cybersecurity firm combining artificial
						intelligence and human expertise to deliver proactive, reliable, and
						scalable protection solutions. Founded in India, we serve global
						clients across finance, healthcare, and enterprise sectors. Our team
						consists of ethical hackers, AI engineers, and compliance experts
						delivering robust digital security. With a commitment to innovation
						and trust, FlexGen.ai partners with businesses to create safer
						digital environments in a rapidly evolving cyber threat landscape.
					</p>
				</div>
			</div>
		</section>
	);
}
