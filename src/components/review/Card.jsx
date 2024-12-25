import React from "react";
import { FaStar, FaRegUserCircle } from "react-icons/fa";
// Sample testimonials array
const Card = ({ name, text, stars, brand, eventImage }) => {
    return (
        <div className="w-auto">
            {/* Testimonial Content */}
            <div className="w-full mb-6">
                <div className="flex flex-row bg-slate-300 p-3 md:rounded-l-full md:rounded-r-full rounded-lg  justify-center items-center relative  gap-2 sm:gap-4 hover:shadow-md transition-shadow duration-300">
                    <div>
                        {/* Brand */}
                        <p className="font-bold italic text-black text-2xl mb-4 text-center ">{brand}</p>
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
                    <div className="absolute left-16 -bottom-4 w-6 h-6 bg-slate-300 rotate-45"></div>
                </div>
            </div>
            {/* Profile Section */}
            <div className="flex items-center">
                {/* Profile Image */}
                <div className="sm:size-16 size-12 rounded-full overflow-hidden">
                    {/* <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                    /> */}
                    <FaRegUserCircle className="w-full h-full object-cover text-black bg-slate-200" />

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

