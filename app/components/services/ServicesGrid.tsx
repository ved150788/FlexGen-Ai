"use client";
import Link from "next/link";
import Image from "next/image";
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
						className="group bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden flex flex-col h-full"
						data-aos="fade-up"
						data-aos-delay={index * 100}
					>
						<div className="p-6 flex flex-col items-center text-center flex-grow">
							<div className="bg-primarySaffron/10 p-4 rounded-full mb-5">
								<Image
									src={service.icon}
									alt={service.title}
									width={40}
									height={40}
									className="w-10 h-10"
								/>
							</div>
							<h3 className="text-xl font-semibold mb-3">{service.title}</h3>
							<p className="text-gray-600 mb-5 flex-grow">
								{service.description}
							</p>
							<Link
								href={`/services/${service.slug}`}
								className="mt-2 inline-block bg-primarySaffron text-black py-2 px-5 rounded-lg font-medium hover:bg-black hover:text-white transition-colors"
							>
								Read More
							</Link>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
