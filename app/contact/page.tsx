// app/contact/page.tsx
import HeroContact from "../components/hero/HeroContact";
import ContactForm from "../components/forms/ContactForm";
import ContactInfo from "../components/common/ContactInfo";
import SupportCTA from "../components/common/SupportCTA";
import Script from "next/script";
import Image from "next/image";
import {
	FaMapMarkerAlt,
	FaPhone,
	FaEnvelope,
	FaClock,
	FaLinkedin,
	FaTwitter,
	FaFacebook,
} from "react-icons/fa";

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

			{/* Hero Section */}
			<div className="bg-gradient-to-br from-gray-900 to-black text-white">
				<HeroContact />

				{/* Main Contact Section - Modern Grid Layout */}
				<section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-gray-100">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Get in Touch
							</h2>
							<p className="text-gray-600 max-w-2xl mx-auto">
								Have questions about our AI solutions? Ready to transform your
								business? Our team of experts is here to help you navigate the
								world of artificial intelligence.
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8">
							{/* Contact Cards */}
							<div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
								<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
									<FaMapMarkerAlt className="text-blue-600 text-2xl" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Visit Our Office
								</h3>
								<p className="text-gray-600 mb-4">
									123 Cyber Street, San Francisco, CA 94105
								</p>
								<a
									href="https://maps.google.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 font-medium hover:text-blue-800"
								>
									View on Map
								</a>
							</div>

							<div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
								<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
									<FaPhone className="text-green-600 text-2xl" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Call Us
								</h3>
								<p className="text-gray-600 mb-4">+1-555-123-4567</p>
								<p className="text-gray-600">Monday to Friday, 9am - 6pm</p>
							</div>

							<div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
								<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
									<FaEnvelope className="text-purple-600 text-2xl" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Email Us
								</h3>
								<p className="text-gray-600 mb-4">contact@flexgen.ai</p>
								<p className="text-gray-600">We'll respond within 24 hours</p>
							</div>
						</div>

						{/* Form and Map Section */}
						<div className="mt-16 grid md:grid-cols-5 gap-8 items-start">
							{/* Contact Form */}
							<div className="md:col-span-3 bg-white rounded-2xl shadow-xl p-8 md:p-10">
								<h3 className="text-2xl font-bold text-gray-900 mb-6">
									Send Us a Message
								</h3>
								<p className="text-gray-600 mb-8">
									Fill out the form below and our team will get back to you as
									soon as possible.
								</p>
								<ContactForm />
							</div>

							{/* Map and Additional Info */}
							<div className="md:col-span-2">
								<div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
									<div className="h-64 w-full relative">
										{/* <Image
											// src="/Images/icons8-about-us-64.png"
											alt="Office Location Map"
											fill
											className="object-cover"
										/> */}
									</div>
									<div className="p-6">
										<h4 className="font-semibold text-gray-900 mb-4">
											About Us
										</h4>
										{/* <ul className="space-y-2 text-gray-600">
											<li className="flex items-center">
												<FaClock className="mr-2 text-blue-600" />
												<span>Monday - Friday: 9:00 AM - 6:00 PM</span>
											</li>
											<li className="flex items-center">
												<FaClock className="mr-2 text-blue-600" />
												<span>Saturday: 10:00 AM - 4:00 PM</span>
											</li>
											<li className="flex items-center">
												<FaClock className="mr-2 text-blue-600" />
												<span>Sunday: Closed</span>
											</li>
										</ul> */}
										<p className="text-black">
											We’re passionate about cybersecurity—and committed to
											earning your trust. Ready to secure your digital future?
											Contact us today and let’s build a safer tomorrow
											together.
										</p>
									</div>
								</div>

								{/* Social Media Links */}
								<div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
									<h4 className="font-semibold text-xl mb-4">
										Connect with Us
									</h4>
									<p className="mb-6 text-blue-100">
										Follow us on social media to stay updated with the latest in
										AI technology and industry insights.
									</p>
									<div className="flex space-x-4">
										<a
											href="https://linkedin.com"
											target="_blank"
											rel="noopener noreferrer"
											className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
										>
											<FaLinkedin className="text-white text-xl" />
										</a>
										<a
											href="https://twitter.com"
											target="_blank"
											rel="noopener noreferrer"
											className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
										>
											<FaTwitter className="text-white text-xl" />
										</a>
										<a
											href="https://facebook.com"
											target="_blank"
											rel="noopener noreferrer"
											className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
										>
											<FaFacebook className="text-white text-xl" />
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="py-20 px-6 bg-white">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Frequently Asked Questions
						</h2>
						<p className="text-gray-600 mb-12">
							Find answers to some of the most common questions about our AI
							solutions and services.
						</p>

						<div className="space-y-6 text-left">
							{[
								{
									question: "What industries do you serve?",
									answer:
										"We provide AI solutions across multiple industries including healthcare, finance, retail, manufacturing, and more. Our expertise allows us to customize solutions for specific industry needs.",
								},
								{
									question: "How do I get started with FlexGen.ai?",
									answer:
										"Getting started is easy! Simply fill out our contact form or give us a call, and one of our consultants will schedule a discovery call to understand your needs and recommend the best solutions.",
								},
								{
									question: "Do you offer custom AI solutions?",
									answer:
										"Yes, we specialize in developing custom AI solutions tailored to your specific business requirements. Our team works closely with you to understand your challenges and build solutions that deliver value.",
								},
								{
									question: "What support options do you offer?",
									answer:
										"We offer comprehensive support packages including 24/7 monitoring, regular maintenance, training, and dedicated support teams. Our goal is to ensure your AI systems run smoothly and efficiently.",
								},
							].map((faq, index) => (
								<div
									key={index}
									className="bg-gray-50 rounded-xl p-6 shadow-sm"
								>
									<h3 className="text-xl font-semibold text-gray-900 mb-3">
										{faq.question}
									</h3>
									<p className="text-gray-600">{faq.answer}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Enhanced Contact Info and Support CTA */}
				<div className="bg-gray-900">
					<ContactInfo />
					<SupportCTA />
				</div>
			</div>
		</>
	);
}
