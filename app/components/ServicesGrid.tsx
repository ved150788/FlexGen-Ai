"use client";
import Link from "next/link";
import { services } from "../../data/services";

export default function ServicesGrid() {
	return (
		<section className="py-16 px-6 bg-gray-100">
			<div className="max-w-7xl mx-auto text-center mb-12">
				<h2 className="text-3xl font-bold mb-4">Our Cybersecurity Services</h2>
				<p className="text-gray-600 max-w-2xl mx-auto">
					FlexGen.ai delivers expert-led, scalable security solutions tailored
					to modern threats.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
				{services.map((service, index) => (
					<div
						key={service.slug}
						className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition"
						data-aos="fade-up"
						data-aos-delay={index * 100}
					>
						<div className="flex flex-col items-center text-center">
							<img
								src={service.icon}
								alt={service.title}
								className="w-16 h-16 mb-4"
							/>
							<h3 className="text-xl font-semibold mb-2">{service.title}</h3>
							<p className="text-gray-600 text-sm mb-3">
								{service.description}
							</p>
							<Link
								href={`/services/${service.slug}`}
								className="text-primarySaffron font-medium hover:underline"
							>
								Read More →
							</Link>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
