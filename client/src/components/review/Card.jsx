import React from "react";
import { FaStar, FaRegUserCircle } from "react-icons/fa";

const Card = ({ name, text, stars, brand, eventImage, image }) => {
    return (
        <div className="w-full min-w-[300px] sm:min-w-[340px] md:min-w-[400px] lg:min-w-[480px]">
            {/* Testimonial Content */}
            <div className="w-full mb-6">
                <div className="flex flex-col sm:flex-row bg-slate-200 p-4 rounded-lg justify-between items-center relative gap-4 sm:gap-6 hover:shadow-md transition-shadow duration-300 min-h-[200px] sm:min-h-[180px]">
                    <div className="w-full sm:w-2/3 flex flex-col justify-between">
                        {/* Brand */}
                        <p className="font-bold italic text-black text-xl sm:text-2xl mb-3 text-center sm:text-left">{brand}</p>
                        {/* Testimonial Text */}
                        <div className="min-h-[80px]">
                            <p className="text-gray-600 text-sm mb-3 text-center sm:text-left">{text}</p>
                        </div>
                        {/* Stars */}
                        <div className="flex text-yellow-400 justify-center sm:justify-start">
                            {[...Array(stars)].map((_, index) => (
                                <FaStar key={index} className="text-lg" />
                            ))}
                        </div>
                    </div>

                    {/* Event photo */}
                    <div className="w-full sm:w-1/3 h-32 sm:h-40 rounded-lg overflow-hidden shadow-md">
                        {eventImage ? (
                            <img
                                src={eventImage}
                                alt={name}
                                className="w-full h-full object-cover cursor-pointer"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-500">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Speech bubble effect */}
                    <div className="absolute left-8 -bottom-4 w-6 h-6 bg-slate-200 rotate-45"></div>
                </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center">
                {/* Profile Image */}
                <div className="size-12 sm:size-14 md:size-16 rounded-full overflow-hidden border-4 border-white hover:border-slate-400 cursor-pointer duration-300 shadow-md">
                    {image ? (
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <FaRegUserCircle className="w-full h-full object-cover text-black bg-slate-200" />
                    )}
                </div>

                {/* Name and Role */}
                <div className="ml-4">
                    <h3 className="text-blue-600 font-semibold text-base sm:text-lg">{name}</h3>
                </div>
            </div>
        </div>
    );
};

export default Card;