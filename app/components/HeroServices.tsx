"use client";
import Link from "next/link";
import { services } from "../../data/services";

export default function HeroServices() {
	return (
		<section className="relative h-screen w-full overflow-hidden">
			{/* Background (can use image/video) */}
			<video
				autoPlay
				muted
				loop
				playsInline
				className="absolute top-0 left-0 w-full h-full object-cover"
			>
				<source src="/videos/services-hero.mp4" type="video/mp4" />
				Your browser does not support the video tag.
			</video>

			{/* Overlay */}
			<div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 z-10" />

			{/* Content */}
			<div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4">
				<div className="mb-12">
					<h1 className="text-5xl font-bold mb-4">
						Explore Our Cybersecurity Services
					</h1>
					<p className="text-lg mb-6 max-w-xl mx-auto">
						From risk assessments to threat detection — AI-powered protection
						for the digital age.
					</p>
				</div>

				{/* Service Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
					{services.map((service) => (
						<Link
							key={service.slug}
							href={`/services/${service.slug}`}
							className="group bg-black bg-opacity-50 border border-white hover:bg-primarySaffron hover:text-black transition-all duration-300 p-6 rounded-lg"
						>
							<div className="flex items-center space-x-4">
								<img
									src={service.icon}
									alt={service.title}
									className="w-12 h-12"
								/>
								<div className="text-left">
									<h3 className="text-xl font-semibold">{service.title}</h3>
									<p className="text-sm opacity-80 group-hover:opacity-100">
										{service.description}
									</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
