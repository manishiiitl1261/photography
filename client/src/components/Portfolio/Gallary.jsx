"use client";
import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import photos from "@/components/Portfolio/Photo";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Collection from "@/components/Portfolio/Collection";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Gallery() {
    const { t } = useLanguage();
    const [animate, setAnimate] = useState(false);
    const galleryRef = useRef(null);


    const CustomPrevArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-lime-400 hover:bg-lime-500 text-white w-10 h-10 rounded-full z-10 flex items-center justify-center border-2 border-white shadow-md"
        >
            ←
        </button>
    );

    const CustomNextArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-lime-400 hover:bg-lime-500 text-white w-10 h-10 rounded-full z-10 flex items-center justify-center border-2 border-white shadow-md"
        >
            →
        </button>
    );

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setAnimate(true);
                    } else {
                        setAnimate(false);
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (galleryRef.current) {
            observer.observe(galleryRef.current);
        }

        return () => {
            if (galleryRef.current) {
                observer.unobserve(galleryRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={galleryRef}
            className={`max-w-screen-xl mx-auto p-6 sm:py-20 sm:px-6 transition-all duration-1000 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                }`}
        >
            <h2 className="text-center  text-3xl sm:text-5xl font-bold mb-8 italic text-black">{t.portfolio.title.toUpperCase()}</h2>
            <div className="relative">
                <Slider {...settings}>
                    {photos.map((photo) => (
                        <div key={photo.id} className="p-2 overflow-hidden">
                            <img
                                src={photo.src}
                                alt={photo.alt}
                                className="rounded-lg object-cover w-full h-64 transform transition-transform duration-300 hover:scale-110 cursor-pointer"
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}
