"use client";

import HeroWrapper from "./components/hero/HeroWrapper";
import ServicesSection from "./components/services/ServicesSection";
import WhyChooseUs from "./components/common/WhyChooseUs";
import CtaSection from "./components/common/CtaSection";
import ContactForm from "./components/forms/ContactForm";
import { ModalProvider } from "./context/ModalProvider";
import Script from "next/script";

export default function HomePage() {
	return (
		<>
			<Script id="organization-schema" type="application/ld+json">
				{`
					{
						"@context": "https://schema.org",
						"@type": "Organization",
						"name": "FlexGen.ai",
						"url": "https://flexgen.ai",
						"logo": "https://flexgen.ai/logo.png",
						"sameAs": [
							"https://twitter.com/flexgen_ai",
							"https://linkedin.com/company/flexgen-ai",
							"https://facebook.com/flexgenai"
						],
						"contactPoint": {
							"@type": "ContactPoint",
							"telephone": "+1-555-123-4567",
							"contactType": "customer service",
							"areaServed": "US",
							"availableLanguage": "English"
						},
						"description": "FlexGen.ai provides AI-powered cybersecurity solutions to protect organizations from evolving cyber threats.",
						"slogan": "AI-powered protection for the digital age"
					}
				`}
			</Script>
			<ModalProvider>
				<HeroWrapper />
				<ServicesSection />
				<WhyChooseUs />
				<CtaSection />
				<ContactForm />
			</ModalProvider>
		</>
	);
}
