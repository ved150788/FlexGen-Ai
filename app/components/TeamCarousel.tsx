"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const teamMembers = [
	{
		name: "Kondal Rao",
		title: "Co-Founder & Security Strategist",
		image: "Images/logo.png",
		bio: "Expert in threat assessment and AI-driven defense systems.",
	},
	{
		name: "Kondal Rao",
		title: "Co-Founder & Security Strategist",
		image: "Images/logo.png",
		bio: "Expert in threat assessment and AI-driven defense systems.",
	},
	{
		name: "Kondal Rao",
		title: "Co-Founder & Security Strategist",
		image: "Images/logo.png",
		bio: "Expert in threat assessment and AI-driven defense systems.",
	},
	{
		name: "Kondal Rao",
		title: "Co-Founder & Security Strategist",
		image: "Images/logo.png",
		bio: "Expert in threat assessment and AI-driven defense systems.",
	},
	{
		name: "Kondal Rao",
		title: "Co-Founder & Security Strategist",
		image: "Images/logo.png",
		bio: "Expert in threat assessment and AI-driven defense systems.",
	},
	{
		name: "Kondal Rao",
		title: "Co-Founder & Security Strategist",
		image: "Images/logo.png",
		bio: "Expert in threat assessment and AI-driven defense systems.",
	},
	{
		name: "Kondal Rao",
		title: "Co-Founder & Security Strategist",
		image: "Images/logo.png",
		bio: "Expert in threat assessment and AI-driven defense systems.",
	},
	// Add more team members...
];

export default function TeamCarousel() {
	return (
		<section className="py-16 px-4 bg-gray-100 relative">
			<h2 className="text-3xl font-bold text-center mb-10">Meet Our Team</h2>

			{/* ✅ Swiper with built-in Navigation */}
			<Swiper
				modules={[Navigation, Autoplay]}
				navigation={true} // Let Swiper handle the buttons
				autoplay={{ delay: 2000, disableOnInteraction: false }}
				loop={true}
				spaceBetween={20}
				breakpoints={{
					640: { slidesPerView: 1 },
					768: { slidesPerView: 2 },
					1024: { slidesPerView: 3 },
				}}
				className="relative"
			>
				{teamMembers.map((member, index) => (
					<SwiperSlide key={index}>
						<div className="bg-white rounded-xl shadow p-6 text-center h-full flex flex-col items-center justify-center">
							<img
								src={member.image}
								alt={member.name}
								className="w-24 h-24 rounded-full mb-4 object-cover"
							/>
							<h3 className="text-lg font-semibold">{member.name}</h3>
							<p className="text-sm text-gray-500">{member.title}</p>
							<p className="mt-2 text-gray-700 text-sm">{member.bio}</p>
						</div>
					</SwiperSlide>
				))}

				{/* Optional: Style Swiper's built-in buttons */}
				{/* Use Tailwind to override Swiper default arrows */}
				<style jsx global>{`
					.swiper-button-next,
					.swiper-button-prev {
						background-color: black;
						color: white;
						border-radius: 9999px;
						width: 40px;
						height: 40px;
						display: flex;
						align-items: center;
						justify-content: center;
						transition: background 0.3s ease;
					}
					.swiper-button-next:hover,
					.swiper-button-prev:hover {
						background-color: #f59e0b; /* Tailwind's primarySaffron */
					}
					.swiper-button-next::after,
					.swiper-button-prev::after {
						font-size: 16px;
					}
				`}</style>
			</Swiper>
		</section>
	);
}
