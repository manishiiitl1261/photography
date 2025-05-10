"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePricing } from '@/contexts/PricingContext';
import { motion } from "framer-motion";
import { useRouter } from 'next/router';

const directions = ["left", "right", "up", "down"];

const animationVariants = {
    left: { x: [-300, 0], opacity: [0, 1] },
    right: { x: [300, 0], opacity: [0, 1] },
    up: { y: [-300, 0], opacity: [0, 1] },
    down: { y: [300, 0], opacity: [0, 1] },
};

const images = [
    {
        id: 1,
        src: "/assets/wedding.jpeg",
        alt: "Wedding Couple"
    },
    {
        id: 2,
        src: "/assets/wedding4.jpeg",
        alt: "Wedding Couple"
    },
    {
        id: 3,
        src: "/assets/wedding2.jpeg",
        alt: "Wedding Couple"
    }
];

const PricePackages = () => {
    const { t } = useLanguage();
    const { weddingPackages, loading, error } = usePricing();
    const router = useRouter();
    const isAdmin = router.pathname.startsWith('/admin');
    const [packages, setPackages] = useState([]);

    useEffect(() => {
        if (weddingPackages && weddingPackages.length > 0) {
            // Use API data
            setPackages(weddingPackages.map(pkg => ({
                id: pkg._id,
                title: pkg.title,
                price: pkg.price,
                features: pkg.features
            })));
        } else {
            // Set empty array when no data is available
            setPackages([]);
        }
    }, [weddingPackages]);

    return (
        <>
            <div className="mt-4 sm:mt-6 lg:mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-center text-3xl sm:text-5xl font-bold mb-2 sm:mb-4 lg:mb-6 italic text-black">{t.pricing.priceList.title}</h2>
                    <p className="text-xl text-black mb-2">{t.pricing.priceList.subtitle}</p>
                </div>

                {/* Wedding images showcase */}
                <div className="grid grid-cols-3 gap-4 p-2 mb-6 sm:mb-8 overflow-hidden">
                    {images.map((photo, index) => {
                        const direction = directions[index % directions.length];
                        return (
                            <motion.div
                                key={photo.id}
                                className="overflow-hidden rounded-lg shadow-md"
                                initial="hidden"
                                animate={direction}
                                variants={animationVariants}
                                transition={{ duration: 3, delay: index * 0.5 }}
                            >
                                <img
                                    src={photo.src}
                                    alt={photo.alt}
                                    className="w-full h-full object-cover duration-300 hover:scale-105 cursor-pointer"
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        <p className="ml-3 text-gray-700">Loading wedding packages...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-10 px-4">
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-auto max-w-2xl">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                            {isAdmin && (
                                <p className="mt-2">
                                    Please add wedding packages from the admin panel or run the database seed script.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {!loading && !error && packages.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No wedding packages available at the moment.</p>
                        {isAdmin && (
                            <p className="mt-2 text-gray-500">
                                Please add wedding packages from the admin panel or run the database seed script.
                            </p>
                        )}
                    </div>
                )}

                {/* Package cards */}
                {packages.length > 0 && (
                    <div className="max-h-[calc(100vh-250px)] md:max-h-[80vh] overflow-y-auto pr-2 mt-6 border-2 border-white rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mb-12 p-4 sm:p-6  xl:p-8">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="shadow-md rounded-lg overflow-hidden border border-gray-200 transition-transform hover:scale-105 p-2 cursor-pointer bg-gray-100"
                                >
                                    <h3 className="text-xl font-bold text-black text-center">{pkg.title}</h3>
                                    <div className="p-2">
                                        <ul className="space-y-2 mb-2 min-h-56">
                                            {pkg.features.map((feature, index) => (
                                                <li key={index} className="flex items-start text-black">
                                                    <span className="text-black mr-2">•</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="text-center mt-2 pt-2 border-t border-black">
                                            <p className="text-xl sm:text-2xl font-bold text-black">{pkg.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PricePackages; 