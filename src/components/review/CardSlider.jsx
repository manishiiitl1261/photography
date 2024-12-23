"use client";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Card from "@/components/review/Card";
import cardData from "@/components/review/CardHelper";

const CardSlider = () => {

    const [currentCard, setCurrentCard] = useState(0);
    const nextCard = () => {
        setCurrentCard((prev) => (prev + 1) % cardData.length);
    };
    const prevCard = () => {
        setCurrentCard((prev) => (prev - 1 + cardData.length) % cardData.length);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                <Card
                    image={cardData[currentCard].image}
                    name={cardData[currentCard].name}
                    role={cardData[currentCard].role}
                    text={cardData[currentCard].text}
                    stars={cardData[currentCard].stars}
                    brand={cardData[currentCard].brand}
                    eventImage={cardData[currentCard].eventImage}
                />
            </div>
            <div className="flex flex-row items-center gap-4 sm:gap-8">
                <FaArrowLeft
                    className="bg-blue-950 text-white sm:size-12 size-10 rounded-full sm:p-3 p-2 cursor-pointer hover:bg-blue-500 focus:bg-blue-500 hover:scale-90 duration-500 focus:scale-90"
                    onClick={prevCard}
                />
                <FaArrowRight
                    className="bg-blue-950 text-white sm:size-12 size-10 rounded-full sm:p-3 p-2 cursor-pointer hover:bg-blue-500 focus:bg-blue-500 hover:scale-90 duration-500 focus:scale-90"
                    onClick={nextCard}
                />
            </div>
        </div>
    );
};

export default CardSlider;

