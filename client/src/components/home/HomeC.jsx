"use client";

import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom Prev Arrow (bottom-right corner)
const CustomPrevArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute bottom-4 right-1/2 z-20 bg-lime-400 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80 transition hover:bg-lime-500 border border-white"
    >
        ←
    </button>
);

// Custom Next Arrow (bottom-right corner)
const CustomNextArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute bottom-4  right-1/3 z-20 bg-lime-400 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80 transition hover:bg-lime-500 border border-white"
    >
        →
    </button>
);

const HomeC = ({ sliderContent }) => {
    // Slider settings
    const settings = {
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true, // Show custom arrows
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
    };

    return (
        <div className="overflow-hidden w-full h-[80vh] relative"> {/* Slider container */}
            {sliderContent && sliderContent.length > 0 ? (
                <Slider {...settings}>
                    {sliderContent.map((slide) => (
                        <div key={slide.id} className="relative w-full h-[80vh]">
                            {/* Background Image */}
                            <div className="absolute top-0 left-0 w-full h-full">
                                <Image
                                    src={slide.imageSrc}
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    quality={100}
                                />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-center items-start p-10 md:p-20 text-white">
                                <p className="text-lg md:text-xl uppercase font-semibold mb-4 text-white">
                                    {slide.id === 1 ? "HELLO THERE!" : "WELCOME TO MY"}
                                </p>
                                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-lime-400 italic">
                                    {slide.title}
                                </h1>
                                <p className="text-md md:text-lg mb-8 max-w-md text-white">
                                    {slide.subtitle}
                                </p>
                                <div className="flex space-x-4">

                                    <a className="border border-white bg-lime-400 hover:bg-lime-500 px-6 py-2 rounded-md font-semibold text-black" href="/Services">
                                        {slide.buttonText1}
                                    </a>
                                    <a className="border border-white px-6 py-2 rounded-md hover:bg-white hover:text-black transition duration-300 text-white" href="/ContactUs">
                                        {slide.buttonText2}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            ) : (
                <div className="text-center text-gray-500 py-20 ">
                    No content available for the slider.
                </div>
            )}
        </div>
    );
};
export default HomeC;
