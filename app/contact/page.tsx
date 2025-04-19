// app/contact/page.tsx
import HeroContact from "../components/HeroContact";
import ContactForm from "../components/ContactForm";
import ContactInfo from "../components/ContactInfo";
import SupportCTA from "../components/SupportCTA";
import SharedLayout from "../components/SharedLayout";
import Script from "next/script";

export default function ContactPage() {
	// Create Contact Page structured data
	const contactSchema = {
		"@context": "https://schema.org",
		"@type": "ContactPage",
		name: "FlexGen.ai Contact Page",
		description: "Contact the cybersecurity experts at FlexGen.ai",
		url: "https://flexgen.ai/contact",
		mainEntity: {
			"@type": "Organization",
			name: "FlexGen.ai",
			telephone: "+1-555-123-4567",
			email: "contact@flexgen.ai",
			address: {
				"@type": "PostalAddress",
				streetAddress: "123 Cyber Street",
				addressLocality: "San Francisco",
				addressRegion: "CA",
				postalCode: "94105",
				addressCountry: "US",
			},
			contactPoint: {
				"@type": "ContactPoint",
				contactType: "customer service",
				telephone: "+1-555-123-4567",
				email: "contact@flexgen.ai",
				availableLanguage: "English",
			},
		},
	};

	// Create breadcrumb schema
	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://flexgen.ai",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Contact",
				item: "https://flexgen.ai/contact",
			},
		],
	};

	return (
		<>
			<Script id="contact-schema" type="application/ld+json">
				{JSON.stringify(contactSchema)}
			</Script>
			<Script id="breadcrumb-schema" type="application/ld+json">
				{JSON.stringify(breadcrumbSchema)}
			</Script>
			<SharedLayout>
				<div className="bg-black text-white">
					<HeroContact />

					<section className="py-16 px-6 bg-gray-100 text-black">
						<div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
							<div>
								<h2 className="text-2xl font-bold mb-4">We're here to help.</h2>
								<p className="text-gray-700 mb-6">
									Fill in the form, and our cybersecurity experts will get back
									to you within 24 hours.
								</p>
								<ContactForm />
							</div>
							<div className="rounded-lg overflow-hidden shadow-lg">
								<img
									src="/images/contact-bg.jpg"
									alt="Cybersecurity Contact"
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
					</section>

					<ContactInfo />
					<SupportCTA />
				</div>
			</SharedLayout>
		</>
	);
}
