import React from "react";
import { FaStar } from "react-icons/fa";

// Sample testimonials array
const Card = ({ name, role, image, text, stars, brand }) => {
    return (
        <div className="w-auto">
            {/* Testimonial Content */}
            <div className="mb-8 w-full">
                <div className="bg-gray-100 p-6 rounded-lg justify-center items-center relative">
                    {/* Brand */}
                    <p className="font-bold italic text-gray-500 text-2xl mb-4">{brand}</p>

                    {/* Testimonial Text */}
                    <p className="text-gray-600 text-sm mb-4">{text}</p>

                    {/* Stars */}
                    <div className="flex text-yellow-400 text-center">
                        {[...Array(stars)].map((_, index) => (
                            <FaStar key={index} />
                        ))}
                    </div>
                    {/* Speech bubble effect */}
                    <div className="absolute left-10 -bottom-4 w-6 h-6 bg-gray-100 rotate-45"></div>
                </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center">
                {/* Profile Image */}
                <div className="size-24 rounded-full overflow-hidden border-4 border-white">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Name and Role */}
                <div className="ml-4">
                    <h3 className="text-gray-800 font-semibold text-lg">{name}</h3>
                    <p className="text-blue-600 text-sm">{role}</p>
                </div>
            </div>
        </div>
    );
};

export default Card;
