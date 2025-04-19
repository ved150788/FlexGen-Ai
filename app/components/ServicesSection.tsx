"use client";
import Link from "next/link";
import { services } from "../../data/services";

export default function ServicesSection() {
	return (
		<section className="relative  py-12 px-6 bg-white text-gray-800 z-10">
			<div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 -mt-30">
				{services.map((service) => (
					<div
						key={service.slug}
						className="group border border-black rounded-lg p-6 shadow-md text-center hover:shadow-lg transition duration-300 bg-white"
					>
						<h3 className="text-xl font-semibold mb-2">{service.title}</h3>
						<p className="text-sm mb-4">{service.description}</p>
						<Link
							href={`/services/${service.slug}`}
							className="text-sm font-semibold text-black opacity-60 group-hover:opacity-100 transition"
						>
							Read More →
						</Link>
					</div>
				))}
			</div>
		</section>
	);
}
