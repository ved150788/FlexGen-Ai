"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const tools = [
	{ name: "AWS", logo: "/tools/aws.svg" },
	{ name: "Azure", logo: "/tools/azure.svg" },
	{ name: "Linux", logo: "/tools/linux.svg" },
	{ name: "Metasploit", logo: "/tools/metasploit.svg" },
	{ name: "Wireshark", logo: "/tools/wireshark.svg" },
	{ name: "Python", logo: "/tools/python.svg" },
	{ name: "Nmap", logo: "/tools/nmap.svg" },
	{ name: "Burp Suite", logo: "/tools/burp.svg" },
];

export default function ToolsSlider() {
	return (
		<section className="py-16 px-6 bg-white">
			<div className="max-w-6xl mx-auto text-center mb-10">
				<h2 className="text-3xl font-bold mb-4">
					Our Security Toolset & Platforms
				</h2>
				<p className="text-gray-600 max-w-2xl mx-auto">
					We use industry-leading tools and cloud platforms to protect and
					monitor your infrastructure.
				</p>
			</div>

			<Swiper
				modules={[Autoplay]}
				slidesPerView={3}
				spaceBetween={30}
				autoplay={{ delay: 2500 }}
				loop={true}
				breakpoints={{
					640: { slidesPerView: 3 },
					768: { slidesPerView: 4 },
					1024: { slidesPerView: 5 },
				}}
				className="max-w-6xl mx-auto"
			>
				{tools.map((tool, index) => (
					<SwiperSlide
						key={index}
						className="flex justify-center"
						data-aos="fade-up"
					>
						<div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition w-full h-full flex items-center justify-center">
							<img
								src={tool.logo}
								alt={tool.name}
								className="h-12 object-contain grayscale hover:grayscale-0 transition"
							/>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</section>
	);
}
