"use client";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Card from "@/components/review/Card";
import { useReviews } from "@/contexts/ReviewContext";

const CardSlider = () => {
    const { reviews, loading } = useReviews();
    const [currentCard, setCurrentCard] = useState(0);

    // Debug log the current review
    React.useEffect(() => {
        if (reviews && reviews.length > 0) {
            console.log('Current review data:', reviews[currentCard]);
        }
    }, [reviews, currentCard]);

    const nextCard = () => {
        setCurrentCard((prev) => (prev + 1) % reviews.length);
    };

    const prevCard = () => {
        setCurrentCard((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center p-8 min-h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-lg text-gray-600">No reviews available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
                {/* Card Container - Fixed height to prevent layout shifts */}
                <div className="min-h-[350px] sm:min-h-[320px] md:min-h-[300px] flex items-center justify-center">
                    <Card
                        image={reviews[currentCard].image}
                        name={reviews[currentCard].name}
                        role={reviews[currentCard].role || "Client"}
                        text={reviews[currentCard].text}
                        stars={reviews[currentCard].rating || reviews[currentCard].stars}
                        brand={reviews[currentCard].brand || reviews[currentCard].event}
                        eventImage={reviews[currentCard].eventImage}
                        userAvatar={reviews[currentCard].userAvatar}
                    />
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex flex-row items-center gap-4 sm:gap-8 mt-8">
                <button
                    className="bg-blue-950 text-white sm:size-12 size-10 rounded-full sm:p-3 p-2 cursor-pointer hover:bg-blue-500 focus:bg-blue-500 hover:scale-90 duration-500 focus:scale-90 flex items-center justify-center"
                    onClick={prevCard}
                    aria-label="Previous review"
                >
                    <FaArrowLeft />
                </button>
                <span className="text-black font-medium">
                    {currentCard + 1} / {reviews.length}
                </span>
                <button
                    className="bg-blue-950 text-white sm:size-12 size-10 rounded-full sm:p-3 p-2 cursor-pointer hover:bg-blue-500 focus:bg-blue-500 hover:scale-90 duration-500 focus:scale-90 flex items-center justify-center"
                    onClick={nextCard}
                    aria-label="Next review"
                >
                    <FaArrowRight />
                </button>
            </div>
        </div>
    );
};

export default CardSlider;