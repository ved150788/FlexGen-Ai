"use client";

import React from "react";
import {
	FaLinkedinIn,
	FaFacebookF,
	FaXTwitter,
	FaInstagram,
} from "react-icons/fa6";
import NewsletterSubscribe from "./NewsletterSubscribe";

const Footer: React.FC = () => {
	return (
		<footer className="bg-white text-black pt-10 pb-6 px-6 border-t border-gray-200">
			{/* Newsletter Banner */}
			<div className="max-w-7xl mx-auto mb-12 pb-10 border-b border-gray-200">
				<div className="bg-gray-800 text-white p-8 rounded-lg shadow-md">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
						<div>
							<h2 className="text-2xl md:text-3xl font-bold mb-3">
								Stay Updated with Cybersecurity Insights
							</h2>
							<p className="text-gray-300 mb-4">
								Get the latest security alerts, industry trends, and expert tips
								delivered to your inbox.
							</p>
							<ul className="text-sm text-gray-300 space-y-2 mb-6">
								<li className="flex items-start">
									<span className="text-primarySaffron mr-2">✓</span>
									<span>Weekly security briefings and alerts</span>
								</li>
								<li className="flex items-start">
									<span className="text-primarySaffron mr-2">✓</span>
									<span>Early access to new tools and features</span>
								</li>
								<li className="flex items-start">
									<span className="text-primarySaffron mr-2">✓</span>
									<span>Exclusive security guides and resources</span>
								</li>
							</ul>
						</div>
						<div>
							<NewsletterSubscribe
								variant="footer"
								title="Subscribe to our newsletter"
								description="Join 10,000+ security professionals who trust FlexGen.ai"
								buttonText="Subscribe Now"
								placeholder="Enter your email address"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
				{/* Brand / Logo */}
				<div>
					<h3 className="text-2xl font-bold mb-3">Flexgen.ai</h3>
					<p className="text-sm text-gray-600">
						Protecting your digital world with intelligence, integrity, and
						innovation.
					</p>
				</div>

				{/* Navigation Links */}
				<div>
					<h4 className="text-lg font-semibold mb-3">Quick Links</h4>
					<ul className="space-y-2 text-sm">
						<li>
							<a href="#" className="hover:text-[#F4A261]">
								Home
							</a>
						</li>
						<li>
							<a href="/tools" className="hover:text-[#F4A261]">
								Tools Dashboard
							</a>
						</li>
						<li>
							<a href="#services" className="hover:text-[#F4A261]">
								Services
							</a>
						</li>
						<li>
							<a href="/blog" className="hover:text-[#F4A261]">
								Blogs
							</a>
						</li>
						<li>
							<a href="#about" className="hover:text-[#F4A261]">
								About
							</a>
						</li>
						<li>
							<a href="#contact" className="hover:text-[#F4A261]">
								Contact
							</a>
						</li>
					</ul>
				</div>

				{/* Social Media + Legal Links */}
				<div>
					<h4 className="text-lg font-semibold mb-3">Connect With Us</h4>
					<div className="flex justify-center md:justify-start gap-4 mb-4 text-xl text-gray-800">
						<a href="#" className="hover:text-[#F4A261]">
							<FaLinkedinIn />
						</a>
						<a href="#" className="hover:text-[#F4A261]">
							<FaXTwitter />
						</a>
						<a href="#" className="hover:text-[#F4A261]">
							<FaFacebookF />
						</a>
						<a href="#" className="hover:text-[#F4A261]">
							<FaInstagram />
						</a>
					</div>

					<ul className="text-sm text-gray-600 space-y-1">
						<li>
							<a href="#" className="hover:text-[#F4A261]">
								Terms of Service
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-[#F4A261]">
								Privacy Policy
							</a>
						</li>
					</ul>
				</div>
			</div>

			{/* Bottom Strip */}
			<div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
				© 2025 Flexgen.ai — All rights reserved.
			</div>
		</footer>
	);
};

export default Footer;
