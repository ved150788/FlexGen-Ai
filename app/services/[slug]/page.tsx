import { services, Service } from "../../data/services";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";
import { siteUrl, siteName } from "../../seo-config";
import Image from "next/image";
import Link from "next/link";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return services.map((service) => ({
		slug: service.slug,
	}));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	// Properly await params
	const { slug } = await params;

	const service = services.find((s) => s.slug === slug);
	if (!service) return {};

	const pageUrl = `${siteUrl}/services/${slug}`;
	const imageUrl = `${siteUrl}/images/services/${slug}.jpg`;

	return {
		title: `${service.title} - Cybersecurity Solutions | FlexGen.ai`,
		description: service.description,
		keywords: [
			service.slug,
			"cybersecurity",
			"security services",
			service.title.toLowerCase(),
		],
		alternates: {
			canonical: pageUrl,
		},
		openGraph: {
			title: `${service.title} - Cybersecurity Solutions | FlexGen.ai`,
			description: service.description,
			url: pageUrl,
			siteName,
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: service.title,
				},
			],
			locale: "en_US",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${service.title} - Cybersecurity Solutions | FlexGen.ai`,
			description: service.description,
			images: [imageUrl],
			creator: "@flexgen_ai",
		},
		metadataBase: new URL(siteUrl),
	};
}

export default async function ServiceDetail({ params }: Props) {
	// Properly await params
	const { slug } = await params;

	const service = services.find((s) => s.slug === slug);
	if (!service) return notFound();

	// Create schema.org structured data
	const serviceSchema = {
		"@context": "https://schema.org",
		"@type": "Service",
		name: service.title,
		description: service.description,
		provider: {
			"@type": "Organization",
			name: "FlexGen.ai",
			url: "https://flexgen.ai",
		},
		serviceType: "Cybersecurity",
		url: `https://flexgen.ai/services/${service.slug}`,
		image: `https://flexgen.ai/images/services/${service.slug}.jpg`,
		offers: {
			"@type": "Offer",
			priceCurrency: "USD",
			priceSpecification: {
				"@type": "PriceSpecification",
				description: "Contact for pricing information",
			},
		},
	};

	const breadcrumbItems = [
		{ label: "Home", href: "/" },
		{ label: "Services", href: "/services" },
		{ label: service.title },
	];

	// Create breadcrumb schema
	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbItems.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.label,
			item: item.href
				? `https://flexgen.ai${item.href}`
				: `https://flexgen.ai/services/${service.slug}`,
		})),
	};

	return (
		<>
			<Script id="service-schema" type="application/ld+json">
				{JSON.stringify(serviceSchema)}
			</Script>
			<Script id="breadcrumb-schema" type="application/ld+json">
				{JSON.stringify(breadcrumbSchema)}
			</Script>

			{/* Hero Section - Enhanced with animated gradient background */}
			<div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
				{/* Animated background elements */}
				<div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
					<div className="absolute w-96 h-96 -top-20 -left-20 bg-primarySaffron/30 rounded-full blur-3xl animate-pulse"></div>
					<div
						className="absolute w-96 h-96 top-40 right-20 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
						style={{ animationDelay: "2s" }}
					></div>
					<div
						className="absolute w-80 h-80 bottom-0 left-1/3 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
						style={{ animationDelay: "3s" }}
					></div>
				</div>

				<div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative z-10">
					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div className="space-y-8">
							{/* Breadcrumb navigation */}
							<nav className="flex" aria-label="Breadcrumb">
								<ol className="inline-flex items-center space-x-1 md:space-x-3">
									{breadcrumbItems.map((item, index) => (
										<li key={index} className="inline-flex items-center">
											{index > 0 && (
												<svg
													className="w-3 h-3 mx-1 text-gray-400"
													aria-hidden="true"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 6 10"
												>
													<path
														stroke="currentColor"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="m1 9 4-4-4-4"
													/>
												</svg>
											)}
											{item.href ? (
												<Link
													href={item.href}
													className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors"
												>
													{item.label}
												</Link>
											) : (
												<span className="text-sm font-medium text-gray-100">
													{item.label}
												</span>
											)}
										</li>
									))}
								</ol>
							</nav>

							{/* Service title with highlight */}
							<div>
								<span className="inline-block bg-primarySaffron/20 text-primarySaffron px-4 py-1 rounded-full text-sm font-medium mb-3">
									Enterprise Security Service
								</span>
								<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-primarySaffron">
									{service.title}
								</h1>
								<div className="h-1 w-20 bg-primarySaffron rounded-full mb-6"></div>
							</div>

							{/* Service description */}
							<p className="text-lg text-gray-300 leading-relaxed max-w-xl">
								{service.longDescription}
							</p>

							{/* CTA buttons */}
							<div className="flex flex-wrap gap-4">
								<Link
									href="/contact?service=true"
									className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white transition-all duration-300 border border-white/30"
								>
									<span>Get Started</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</Link>
								<Link
									href="/services"
									className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white transition-all duration-300 border border-white/30"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 mr-2"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
											clipRule="evenodd"
										/>
									</svg>
									<span>All Services</span>
								</Link>
							</div>
						</div>

						{/* Icon display with glass morphism effect */}
						<div className="hidden md:flex justify-center">
							<div className="relative">
								<div className="absolute inset-0 bg-gradient-to-r from-primarySaffron/20 to-blue-500/20 rounded-full blur-3xl opacity-70 animate-pulse"></div>
								<div className="relative bg-white/10 backdrop-blur-lg w-72 h-72 rounded-full flex items-center justify-center p-10 border border-white/10 shadow-2xl">
									<Image
										src={service.icon}
										alt={service.title}
										width={150}
										height={150}
										className="w-full h-full object-contain drop-shadow-2xl"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content with enhanced design */}
			<div className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
				<div className="max-w-7xl mx-auto px-4">
					{/* Service overview with enhanced visualization */}
					<div className="mb-24">
						<div className="text-center max-w-3xl mx-auto mb-16">
							<span className="inline-block bg-primarySaffron/10 text-primarySaffron px-4 py-1 rounded-full text-sm font-medium mb-3">
								Service Overview
							</span>
							<h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
								How We Deliver {service.title}
							</h2>
							<p className="text-lg text-gray-600 leading-relaxed">
								Our comprehensive approach combines cutting-edge technology with
								human expertise to deliver exceptional security outcomes that
								protect your organization's most valuable assets.
							</p>
						</div>

						{/* Service detail grid with enhanced cards */}
						<div className="grid md:grid-cols-3 gap-8">
							{/* Our approach */}
							<div className="bg-white rounded-xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:border-primarySaffron/30">
								<div className="flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 text-blue-600 mb-6 shadow-lg shadow-blue-100">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-8 w-8"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
										/>
									</svg>
								</div>
								<h3 className="text-xl font-bold mb-4 text-gray-900">
									Our Methodology
								</h3>
								<p className="text-gray-600 mb-6">
									We employ a systematic, proven approach to deliver consistent
									results across all client engagements.
								</p>
								<ul className="space-y-3">
									{[
										"Initial Assessment",
										"Strategic Planning",
										"Implementation",
										"Continuous Monitoring",
									].map((step, index) => (
										<li key={index} className="flex items-start">
											<div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-500 mr-3">
												<svg
													className="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
											</div>
											<span className="text-gray-700 font-medium">{step}</span>
										</li>
									))}
								</ul>
							</div>

							{/* Technologies we use */}
							<div className="bg-white rounded-xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:border-primarySaffron/30">
								<div className="flex items-center justify-center w-16 h-16 rounded-xl bg-purple-50 text-purple-600 mb-6 shadow-lg shadow-purple-100">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-8 w-8"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
										/>
									</svg>
								</div>
								<h3 className="text-xl font-bold mb-4 text-gray-900">
									Technologies
								</h3>
								<p className="text-gray-600 mb-6">
									We leverage cutting-edge security technologies to deliver
									superior results for our clients.
								</p>
								<div className="grid grid-cols-3 gap-3">
									{[
										"AI/ML",
										"Cloud",
										"SIEM",
										"EDR",
										"SOAR",
										"API Sec",
										"XDR",
										"Zero Trust",
										"IAM",
									].map((tech, index) => (
										<div
											key={index}
											className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-2 flex items-center justify-center border border-gray-100 hover:border-purple-200 hover:from-purple-50 hover:to-white transition-colors"
										>
											<span className="text-xs font-medium text-gray-700">
												{tech}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Team expertise */}
							<div className="bg-white rounded-xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:border-primarySaffron/30">
								<div className="flex items-center justify-center w-16 h-16 rounded-xl bg-green-50 text-green-600 mb-6 shadow-lg shadow-green-100">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-8 w-8"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
								</div>
								<h3 className="text-xl font-bold mb-4 text-gray-900">
									Our Team
								</h3>
								<p className="text-gray-600 mb-6">
									Our security experts bring decades of combined experience
									across various domains.
								</p>
								<div className="space-y-4">
									{[
										{
											initials: "SC",
											title: "Security Consultants",
											bg: "bg-green-100",
											text: "text-green-700",
										},
										{
											initials: "TA",
											title: "Threat Analysts",
											bg: "bg-blue-100",
											text: "text-blue-700",
										},
										{
											initials: "PT",
											title: "Penetration Testers",
											bg: "bg-indigo-100",
											text: "text-indigo-700",
										},
										{
											initials: "IR",
											title: "Incident Responders",
											bg: "bg-red-100",
											text: "text-red-700",
										},
									].map((expert, index) => (
										<div
											key={index}
											className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
										>
											<div
												className={`w-9 h-9 rounded-full ${expert.bg} flex items-center justify-center ${expert.text} font-semibold mr-3 shadow-sm`}
											>
												{expert.initials}
											</div>
											<div>
												<p className="font-medium text-gray-900">
													{expert.title}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Two-column content layout with enhanced visuals */}
					<div className="grid md:grid-cols-3 gap-12">
						<div className="md:col-span-2 space-y-20">
							{/* Key Features Section - Enhanced with icons and better layout */}
							<div>
								<div className="border-l-4 border-primarySaffron pl-6 mb-10">
									<h2 className="text-3xl font-bold text-gray-900">
										Key Features
									</h2>
									<p className="text-gray-600 mt-2">
										Comprehensive capabilities that set our service apart
									</p>
								</div>

								<div className="grid md:grid-cols-2 gap-8">
									{service.features.map((feature, index) => (
										<div
											key={index}
											className="bg-white rounded-xl p-6 shadow-lg shadow-gray-100/60 border border-gray-100 hover:border-primarySaffron/30 transition-all duration-300 hover:shadow-xl group"
										>
											<div className="flex items-start">
												<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primarySaffron/10 text-primarySaffron flex-shrink-0 mr-4 group-hover:bg-primarySaffron/20 transition-colors">
													{/* Feature icons based on index */}
													{index % 5 === 0 && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-6 w-6"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
															/>
														</svg>
													)}
													{index % 5 === 1 && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-6 w-6"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M13 10V3L4 14h7v7l9-11h-7z"
															/>
														</svg>
													)}
													{index % 5 === 2 && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-6 w-6"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
															/>
														</svg>
													)}
													{index % 5 === 3 && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-6 w-6"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
															/>
														</svg>
													)}
													{index % 5 === 4 && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-6 w-6"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
															/>
														</svg>
													)}
												</div>
												<div>
													<h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primarySaffron transition-colors">
														{feature}
													</h3>
													<p className="text-gray-600 text-base leading-relaxed">
														{`Our ${feature.toLowerCase()} capability provides comprehensive protection and visibility to safeguard your critical assets.`}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Our Approach Section with enhanced visual elements */}
							{service.approach && (
								<div>
									<div className="border-l-4 border-primarySaffron pl-6 mb-10">
										<h2 className="text-3xl font-bold text-gray-900">
											Our Approach
										</h2>
										<p className="text-gray-600 mt-2">
											How we deliver exceptional results
										</p>
									</div>

									<div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl overflow-hidden shadow-2xl">
										<div className="p-8 md:p-12 relative">
											{/* Background decorative elements */}
											<div className="absolute top-0 right-0 w-40 h-40 bg-primarySaffron/10 rounded-full blur-3xl"></div>
											<div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
											<div className="absolute top-40 left-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl"></div>

											<div className="relative">
												<div className="flex items-center mb-8">
													<div className="bg-white/10 p-3 rounded-lg mr-4">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-6 w-6 text-primarySaffron"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M13 10V3L4 14h7v7l9-11h-7z"
															/>
														</svg>
													</div>
													<h3 className="text-2xl font-bold text-white">
														Strategic Methodology
													</h3>
												</div>

												<div className="prose prose-lg max-w-none text-gray-300">
													<p className="leading-relaxed mb-8">
														{service.approach}
													</p>

													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
														{[
															"Assessment",
															"Implementation",
															"Monitoring",
															"Improvement",
														].map((step, index) => (
															<div
																key={index}
																className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/20 transition-colors group"
															>
																<div className="flex items-center mb-2">
																	<div className="w-8 h-8 rounded-full bg-primarySaffron/20 text-primarySaffron flex items-center justify-center mr-3 group-hover:bg-primarySaffron/30 transition-colors">
																		{index + 1}
																	</div>
																	<span className="text-white font-medium">
																		{step}
																	</span>
																</div>
																<p className="text-gray-400 text-sm">
																	{index === 0 &&
																		"Evaluate current security posture"}
																	{index === 1 && "Deploy tailored solutions"}
																	{index === 2 &&
																		"Continuous security observation"}
																	{index === 3 && "Iterative enhancement"}
																</p>
															</div>
														))}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Benefits Section with enhanced visual presentation */}
							<div>
								<div className="border-l-4 border-primarySaffron pl-6 mb-10">
									<h2 className="text-3xl font-bold text-gray-900">
										Key Benefits
									</h2>
									<p className="text-gray-600 mt-2">
										How our service creates value for your organization
									</p>
								</div>

								<div className="space-y-6">
									{service.benefits.map((benefit, index) => (
										<div
											key={index}
											className="bg-white p-6 rounded-xl shadow-md border-l-4 border-primarySaffron hover:shadow-xl transition-all duration-300 transform hover:-translate-x-1"
										>
											<div className="flex items-start">
												<div className="bg-primarySaffron/10 text-primarySaffron rounded-full p-3 flex-shrink-0 mr-5">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-6 w-6"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 13l4 4L19 7"
														/>
													</svg>
												</div>
												<div>
													<h3 className="text-xl font-bold text-gray-900 mb-2">
														{benefit}
													</h3>
													<p className="text-gray-600 leading-relaxed">
														{index === 0 &&
															"Strengthens your security posture with proactive threat detection and rapid response capabilities."}
														{index === 1 &&
															"Optimizes resource allocation by focusing on the most significant security risks facing your organization."}
														{index === 2 &&
															"Enhances regulatory compliance while reducing the burden of security management on your internal teams."}
														{index === 3 &&
															"Provides peace of mind with 24/7 protection from evolving cyber threats targeting your industry."}
														{index === 4 &&
															"Delivers measurable security improvements that demonstrate ROI to stakeholders and leadership."}
														{index >= 5 &&
															"This benefit enables your organization to operate more securely and efficiently, reducing risk while enhancing business performance."}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Sidebar with enhanced CTAs and design */}
						<div className="md:col-span-1">
							<div className="sticky top-24 space-y-8">
								{/* Contact CTA with improved design */}
								<div className="bg-black rounded-xl overflow-hidden shadow-xl border border-gray-200 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
									<div className="bg-gradient-to-r from-primaryBlack to-gray-800 p-6 relative overflow-hidden">
										<div className="absolute top-0 right-0 w-24 h-24 bg-primarySaffron/10 rounded-full blur-2xl"></div>
										<h3 className="text-xl font-bold text-white mb-2 relative z-10">
											Need more information?
										</h3>
										<p className="text-gray-300 text-sm relative z-10">
											Get a personalized consultation with our experts
										</p>
									</div>
									<div className="p-6">
										<a
											href="/contact?service=true"
											className="block w-full bg-white text-black  hover:bg-white/30 hover:text-white font-medium py-3 px-4 rounded-lg text-center"
										>
											Contact Us
										</a>
										<p className="text-center text-gray-500 text-sm mt-4">
											We'll respond within 24 hours
										</p>
									</div>
								</div>

								{/* Resources with enhanced visual design */}
								<div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors">
									<h3 className="font-bold text-gray-900 mb-4">
										Related Resources
									</h3>
									<ul className="space-y-3">
										<li>
											<a
												href="/resources"
												className="flex items-center text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-4 w-4 mr-2"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
													/>
												</svg>
												<span className="text-sm">Best Practices Guide</span>
											</a>
										</li>
										<li>
											<a
												href="/blog"
												className="flex items-center text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-4 w-4 mr-2"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
													/>
												</svg>
												<span className="text-sm">Related Blog Articles</span>
											</a>
										</li>
										<li>
											<a
												href="/case-studies"
												className="flex items-center text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-4 w-4 mr-2"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
													/>
												</svg>
												<span className="text-sm">Case Studies</span>
											</a>
										</li>
									</ul>
								</div>

								{/* Testimonial with enhanced design */}
								<div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 shadow-lg border border-gray-200 relative overflow-hidden">
									<div className="text-7xl text-primarySaffron/10 absolute -top-6 left-3 font-serif">
										"
									</div>
									<div className="relative">
										<p className="text-gray-600 italic text-sm mb-6 relative z-10">
											"{service.title} from FlexGen has transformed our security
											posture. Their team of experts provided valuable insights
											and implemented robust solutions that have significantly
											reduced our risk exposure."
										</p>
										<div className="flex items-center relative z-10">
											<div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full mr-3 shadow-md flex items-center justify-center text-blue-500 font-bold text-sm">
												SJ
											</div>
											<div>
												<p className="font-medium text-sm">Sarah Johnson</p>
												<p className="text-gray-500 text-xs">
													CISO, Enterprise Client
												</p>
											</div>
										</div>
									</div>
									<div className="absolute right-0 bottom-0 w-32 h-32 bg-primarySaffron/5 rounded-full blur-2xl -mr-10 -mb-10"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
