"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { services } from "../../data/services";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

export default function ServicesSection() {
	const [mounted, setMounted] = useState(false);

	// This ensures Swiper only runs on the client side
	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<section className="relative py-16 px-6 bg-white text-gray-800 z-10">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">Our Services</h2>
					<p className="text-lg text-gray-600 max-w-3xl mx-auto">
						Comprehensive cybersecurity solutions designed to protect your
						business against evolving digital threats.
					</p>
				</div>

				{mounted ? (
					<div className="overflow-hidden pb-16 services-swiper">
						<Swiper
							modules={[Navigation, Pagination, Autoplay]}
							spaceBetween={20}
							slidesPerView={1}
							navigation={true}
							pagination={{ clickable: true }}
							autoplay={{ delay: 5000, disableOnInteraction: false }}
							breakpoints={{
								640: { slidesPerView: 2, spaceBetween: 20 },
								768: { slidesPerView: 2, spaceBetween: 20 },
								1024: { slidesPerView: 3, spaceBetween: 20 },
							}}
							className="!pb-10"
						>
							{services.map((service) => (
								<SwiperSlide key={service.slug} className="h-auto">
									<div className="group border border-gray-200 rounded-lg p-6 shadow-md text-center hover:shadow-xl transition duration-300 bg-white h-full flex flex-col hover:border-primarySaffron">
										<div className="mb-3">
											{service.icon && (
												<Image
													src={service.icon}
													alt={service.title}
													width={64}
													height={64}
													className="w-16 h-16 mx-auto mb-4"
													onError={(e) => {
														console.error(
															`Error loading image for ${service.title}`
														);
														e.currentTarget.style.display = "none";
													}}
												/>
											)}
											<h3 className="text-xl font-semibold mb-3">
												{service.title}
											</h3>
										</div>
										<p className="text-sm mb-5 flex-grow text-gray-600">
											{service.description}
										</p>
										<Link
											href={`/services/${service.slug}`}
											className="inline-flex items-center text-sm font-semibold text-primarySaffron hover:text-black transition mt-auto"
										>
											Read More
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-4 w-4 ml-1"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</Link>
									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{services.slice(0, 3).map((service) => (
							<div
								key={service.slug}
								className="group border border-gray-200 rounded-lg p-6 shadow-md text-center hover:shadow-xl transition duration-300 bg-white h-full flex flex-col hover:border-primarySaffron"
							>
								<div className="mb-3">
									{service.icon && (
										<Image
											src={service.icon}
											alt={service.title}
											width={64}
											height={64}
										/>
									)}
									<h3 className="text-xl font-semibold mb-3">
										{service.title}
									</h3>
								</div>
								<p className="text-sm mb-5 flex-grow text-gray-600">
									{service.description}
								</p>
								<Link
									href={`/services/${service.slug}`}
									className="inline-flex items-center text-sm font-semibold text-primarySaffron hover:text-black transition mt-auto"
								>
									Read More
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4 ml-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</Link>
							</div>
						))}
					</div>
				)}

				<div className="text-center mt-8">
					<Link
						href="/services"
						className="inline-flex items-center px-6 py-3 bg-primarySaffron text-black font-semibold rounded-lg hover:bg-black hover:text-white transition duration-300"
					>
						View All Services
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 ml-2"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							/>
						</svg>
					</Link>
				</div>
			</div>
		</section>
	);
}
