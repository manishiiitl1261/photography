"use client";

import { useRef } from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useLanguage } from "@/contexts/LanguageContext";

const CustomPrevArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="w-10 h-10 flex items-center justify-center bg-lime-400 bg-opacity-60 text-white text-xl rounded-full hover:bg-opacity-80 transition hover:bg-lime-500 border border-white"
    >
        ←
    </button>
);

const CustomNextArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="w-10 h-10 flex items-center justify-center bg-lime-400 bg-opacity-60 text-white text-xl rounded-full hover:bg-opacity-80 transition hover:bg-lime-500 border border-white"
    >
        →
    </button>
);


const HomeC = ({ sliderContent }) => {
    const { t } = useLanguage();
    const sliderRef = useRef(null);

    const settings = {
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false, // We'll render custom arrows outside
    };

    return (
        <div className="overflow-hidden w-full h-[80vh] relative">
            {/* Slider */}
            {sliderContent?.length > 0 ? (
                <>
                    <Slider {...settings} ref={sliderRef}>
                        {sliderContent.map((slide) => (
                            <div key={slide.id} className="relative w-full h-[80vh]">
                                {/* Background Image */}
                                <div className="absolute top-0 left-0 w-full h-full">
                                    <Image
                                        src={slide.imageSrc}
                                        alt={slide.id === 1 ? t.home.sliderTitle1 : t.home.sliderTitle2}
                                        fill
                                        className="object-cover"
                                        priority
                                        quality={100}
                                    />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 h-full flex flex-col justify-center items-start p-10 md:p-20 text-white">
                                    <p className="text-lg md:text-xl uppercase font-semibold mb-4 text-white">
                                        {slide.id === 1 ? t.home.greeting : t.home.welcome}
                                    </p>
                                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-lime-400 italic">
                                        {slide.id === 1 ? t.home.sliderTitle1 : t.home.sliderTitle2}
                                    </h1>
                                    <p className="text-md md:text-lg mb-8 max-w-md text-white">
                                        {t.home.sliderSubtitle}
                                    </p>
                                    <div className="flex space-x-4">
                                        <a
                                            className="border border-white px-6 py-2 rounded-md hover:bg-white hover:text-black transition duration-300 text-white"
                                            href="/ContactUs"
                                        >
                                            {t.home.exploreServices}
                                        </a>
                                        <a
                                            className="border border-white px-6 py-2 rounded-md hover:bg-white hover:text-black transition duration-300 text-white"
                                            href="/ContactUs"
                                        >
                                            {t.home.contactMe}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>

                    {/* Arrows - positioned once, outside the slider */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-4">
                        <CustomPrevArrow onClick={() => sliderRef.current?.slickPrev()} />
                        <CustomNextArrow onClick={() => sliderRef.current?.slickNext()} />
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-500 py-20">{t.home.noContent}</div>
            )}
        </div>
    );
};

export default HomeC;
