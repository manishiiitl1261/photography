"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from "framer-motion";
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
// Package data based on the image provided
const packages = [
    {
        id: 'traditional',
        title: 'Traditional Wedding',
        price: '49,999',
        features: [
            'Traditional Photo',
            'Traditional Video',
            'Traditional Highlights',
            '250 Photos Album with Acrylic Pad',
            '2 Photo Frame'
        ]
    },
    {
        id: 'silver',
        title: 'Silver Package',
        price: '75,000',
        features: [
            'Traditional Photo',
            'Traditional Video',
            'Cinematic Video Highlights',
            '300 Photos Album with Acrylic Pad',
            '2 Photo Frame',
            'Drone Coverage'
        ]
    },
    {
        id: 'gold',
        title: 'Gold Package',
        price: '1,05,000',
        features: [
            'Traditional & Candid Photos',
            'Traditional & Cinematic Videos',
            'Cinematic Teaser',
            'Highlights Video & Reels',
            'Edited Photos',
            '400 Photos Album with Bug + Mini Album',
            'Drone Coverage'
        ]
    }
];


const PricePackages = () => {
    const { t } = useLanguage();
    const [packages, setPackages] = useState([]);
    useEffect(() => {
        // Update packages when language changes
        setPackages([
            {
                id: 'traditional',
                title: t.pricing.priceList.weddingPackages.traditional.title,
                price: t.pricing.priceList.weddingPackages.traditional.price,
                features: t.pricing.priceList.weddingPackages.traditional.features
            },
            {
                id: 'silver',
                title: t.pricing.priceList.weddingPackages.silver.title,
                price: t.pricing.priceList.weddingPackages.silver.price,
                features: t.pricing.priceList.weddingPackages.silver.features
            },
            {
                id: 'gold',
                title: t.pricing.priceList.weddingPackages.gold.title,
                price: t.pricing.priceList.weddingPackages.gold.price,
                features: t.pricing.priceList.weddingPackages.gold.features
            }
        ]);
    }, [t]);

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-center  text-3xl sm:text-5xl font-bold mb-2 sm:mb-4 lg:mb-6 italic text-black">{t.pricing.priceList.title}</h2>
                    <p className="text-xl text-black mb-2">{t.pricing.priceList.subtitle}</p>
                </div>

                {/* Wedding images showcase */}
                <div className="grid grid-cols-3 gap-4 p-2  mb-6 sm:mb-8 overflow-hidden">
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
                                    className="w-full h-full  object-cover duration-300 hover:scale-105 cursor-pointer"
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Package cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="shadow-md rounded-lg overflow-hidden border border-gray-200 transition-transform hover:scale-105 p-3 bg-gray-100"
                        >
                            <h3 className="text-xl font-bold text-black text-center">{pkg.title}</h3>
                            <div className="p-6">
                                <ul className="space-y-2 mb-2 min-h-56">
                                    {pkg.features.map((feature, index) => (
                                        <li key={index} className="flex items-start text-black">
                                            <span className="text-black mr-2">•</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-center mt-2 pt-2 border-t border-black">
                                    <p className="text-xl sm:text-2xl font-bold text-black">₹{pkg.price}/ Only</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default PricePackages; 