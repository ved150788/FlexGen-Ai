import { services } from "../../../data/services";
import { notFound } from "next/navigation";
import BreadcrumbLayout from "../../components/BreadcrumbLayout";
import SharedLayout from "../../components/SharedLayout";
import { Metadata } from "next";
import Script from "next/script";
import { siteUrl, siteName } from "../../seo-config";

interface Props {
	params: { slug: string };
}

export async function generateStaticParams() {
	return services.map((service) => ({
		slug: service.slug,
	}));
}

export function generateMetadata({ params }: Props): Metadata {
	const service = services.find((s) => s.slug === params.slug);
	if (!service) return {};

	const pageUrl = `${siteUrl}/services/${params.slug}`;
	const imageUrl = `${siteUrl}/images/services/${params.slug}.jpg`;

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
	};
}

export default function ServiceDetail({ params }: Props) {
	const service = services.find((s) => s.slug === params.slug);
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
			{/* Add JSON-LD structured data */}
			<Script id="service-schema" type="application/ld+json">
				{JSON.stringify(serviceSchema)}
			</Script>
			<Script id="breadcrumb-schema" type="application/ld+json">
				{JSON.stringify(breadcrumbSchema)}
			</Script>
			<SharedLayout>
				<BreadcrumbLayout breadcrumbItems={breadcrumbItems}>
					<article className="max-w-6xl mx-auto px-4 py-12">
						<header className="mb-12 text-center">
							<div className="flex justify-center mb-6">
								<img
									src={service.icon}
									alt={service.title}
									className="w-20 h-20"
								/>
							</div>
							<h1 className="text-5xl font-bold mb-6 text-primarySaffron">
								{service.title}
							</h1>
							<p className="text-xl text-gray-700 max-w-3xl mx-auto">
								{service.description}
							</p>
						</header>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							<div className="lg:col-span-2">
								<div className="prose prose-lg max-w-none">
									<h2 className="text-2xl font-semibold mb-4 text-gray-900">
										How We Help
									</h2>
									<p className="text-lg text-gray-700 whitespace-pre-line mb-8">
										{service.fullDescription}
									</p>

									<h2 className="text-2xl font-semibold mb-4 text-gray-900">
										Key Benefits
									</h2>
									<ul className="list-disc pl-5 space-y-2 mb-8">
										<li>Comprehensive protection against evolving threats</li>
										<li>
											Reduced risk exposure and potential financial losses
										</li>
										<li>Expert-led assessment and remediation</li>
										<li>Compliance with relevant industry standards</li>
										<li>Continuous improvement of your security posture</li>
									</ul>

									<h2 className="text-2xl font-semibold mb-4 text-gray-900">
										Our Approach
									</h2>
									<p className="text-lg text-gray-700 mb-8">
										At FlexGen.ai, we combine industry expertise with
										cutting-edge AI technology to deliver superior cybersecurity
										services. Our team of certified security professionals
										ensures that your organization stays protected against the
										latest threats while optimizing your security investments.
									</p>
								</div>
							</div>

							<aside className="bg-gray-50 p-6 rounded-lg shadow-sm h-fit">
								<div className="sticky top-24">
									<h3 className="text-xl font-semibold mb-4 text-gray-900">
										Ready to Get Started?
									</h3>
									<p className="text-gray-700 mb-6">
										Speak with our security experts about how our{" "}
										{service.title} service can help protect your organization.
									</p>
									<a
										href="/contact"
										className="block w-full bg-primarySaffron text-black text-center py-3 px-4 rounded-lg font-medium hover:bg-black hover:text-white transition duration-300"
									>
										Contact Us
									</a>

									<div className="mt-8 border-t pt-6">
										<h4 className="font-semibold text-gray-900 mb-3">
											Related Services
										</h4>
										<ul className="space-y-3">
											{services
												.filter((s) => s.slug !== service.slug)
												.slice(0, 3)
												.map((relatedService) => (
													<li key={relatedService.slug}>
														<a
															href={`/services/${relatedService.slug}`}
															className="text-primarySaffron hover:underline"
														>
															{relatedService.title}
														</a>
													</li>
												))}
										</ul>
									</div>
								</div>
							</aside>
						</div>

						<section className="mt-16 bg-gray-900 text-white p-8 rounded-lg">
							<div className="text-center mb-8">
								<h2 className="text-3xl font-bold mb-4">
									Ready to Enhance Your Security?
								</h2>
								<p className="text-lg max-w-2xl mx-auto">
									Our team of experts is ready to help you implement robust
									security measures for your organization.
								</p>
							</div>
							<div className="flex justify-center">
								<a
									href="/contact"
									className="bg-primarySaffron text-black px-8 py-3 rounded-lg font-semibold hover:bg-white transition duration-300"
								>
									Get a Free Consultation
								</a>
							</div>
						</section>
					</article>
				</BreadcrumbLayout>
			</SharedLayout>
		</>
	);
}
