"use client";
import React from "react";
import {
	FaLinkedinIn,
	FaFacebookF,
	FaXTwitter,
	FaInstagram,
} from "react-icons/fa6";

export default function TopBar() {
	return (
		<div className="steel-gradient text-white text-sm py-2 px-4">
			<div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
				{/* Social Links */}
				<div className="flex items-center space-x-4 mb-2 sm:mb-0">
					<span className="text-white text-opacity-80 hidden sm:inline">
						Follow us:
					</span>
					<a
						href="https://linkedin.com"
						target="_blank"
						className="hover:text-primarySaffron transition-colors duration-200"
						aria-label="LinkedIn"
					>
						<FaLinkedinIn />
					</a>
					<a
						href="https://facebook.com"
						target="_blank"
						className="hover:text-primarySaffron transition-colors duration-200"
						aria-label="Facebook"
					>
						<FaFacebookF />
					</a>
					<a
						href="https://X.com"
						target="_blank"
						className="hover:text-primarySaffron transition-colors duration-200"
						aria-label="Twitter"
					>
						<FaXTwitter />
					</a>
					<a
						href="https://instagram.com"
						target="_blank"
						className="hover:text-primarySaffron transition-colors duration-200"
						aria-label="Instagram"
					>
						<FaInstagram />
					</a>
				</div>

				{/* Contact Info */}
				<div className="text-white text-opacity-90">
					📞 Call us:{" "}
					<a
						href="tel:+911234567890"
						className="text-white hover:text-primarySaffron transition-colors duration-200 font-medium"
					>
						+91 12345 67890
					</a>
				</div>
			</div>
		</div>
	);
}
