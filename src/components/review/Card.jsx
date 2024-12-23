import React from "react";
import { FaStar } from "react-icons/fa";

// Sample testimonials array
const Card = ({ name, role, image, text, stars, brand, eventImage }) => {
    return (
        <div className="w-auto">
            {/* Testimonial Content */}
            <div className="w-full mb-6">
                <div className="flex flex-row bg-gray-100 p-3 md:rounded-l-full md:rounded-r-full rounded-lg  justify-center items-center relative  gap-2 sm:gap-4">
                    <div>
                        {/* Brand */}
                        <p className="font-bold italic text-gray-500 text-2xl mb-4 text-center ">{brand}</p>

                        {/* Testimonial Text */}
                        <p className="text-gray-600 text-sm mb-4 text-center">{text}</p>

                        {/* Stars */}
                        <div className="flex text-yellow-400 text-center cursor-pointer justify-center">
                            {[...Array(stars)].map((_, index) => (
                                <FaStar key={index} />
                            ))}
                        </div>
                    </div>
                    {/* Event photo */}
                    <div className="size-1/4 rounded-full overflow-hidden">
                        <img
                            src={eventImage}
                            alt={name}
                            className=" w-full h-full object-cover cursor-pointer"
                        />
                    </div>
                    {/* Speech bubble effect */}
                    <div className="absolute left-16 -bottom-4 w-6 h-6 bg-gray-100 rotate-45"></div>
                </div>
            </div>
            {/* Profile Section */}
            <div className="flex items-center">
                {/* Profile Image */}
                <div className="sm:size-20 size-14 rounded-full overflow-hidden border-4 border-white">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Name and Role */}
                <div className="ml-4">
                    <h3 className="text-blue-600 font-semibold text-lg">{name}</h3>

                </div>
            </div>
        </div>
    );
};

export default Card;

