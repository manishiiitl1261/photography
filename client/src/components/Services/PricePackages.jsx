"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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

// Extra equipment options
const extraEquipment = [
    'LED WALL',
    'SAME DAY EDIT',
    'PLASMA TV'
];

const PricePackages = () => {
    const { t } = useLanguage();

    return (
        <div className="py-12 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Price List</h2>
                    <p className="text-xl text-gray-600">Wedding Photography & Videography</p>
                </div>

                {/* Wedding images showcase */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    <div className="overflow-hidden rounded-lg shadow-lg">
                        <img
                            src="/assest/wedding1.jpg"
                            alt="Wedding Couple"
                            className="w-full h-64 object-cover"
                            onError={(e) => { e.target.src = "/assest/work-1.jpg" }}
                        />
                    </div>
                    <div className="overflow-hidden rounded-lg shadow-lg lg:col-span-2">
                        <img
                            src="/assest/wedding2.jpg"
                            alt="Wedding Venue"
                            className="w-full h-64 object-cover"
                            onError={(e) => { e.target.src = "/assest/work-2.jpg" }}
                        />
                    </div>
                </div>

                {/* Package cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 transition-transform hover:scale-105"
                        >
                            <div className="bg-brown-300 py-4">
                                <h3 className="text-xl font-bold text-white text-center">{pkg.title}</h3>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-2 mb-6 min-h-56">
                                    {pkg.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="text-brown-500 mr-2">•</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-center mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-2xl font-bold">₹{pkg.price}/ Only</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional equipment section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
                        <div className="bg-brown-300 py-4">
                            <h3 className="text-xl font-bold text-white text-center">Extra Add Equipment</h3>
                        </div>
                        <div className="p-6">
                            <ul className="space-y-3 mb-6">
                                {extraEquipment.map((item, index) => (
                                    <li key={index} className="flex items-center">
                                        <span className="h-5 w-5 flex-shrink-0 rounded-full bg-brown-100 mr-3 flex items-center justify-center">•</span>
                                        <span className="text-lg font-semibold">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-center text-gray-600 mt-4">available on reasonable price</p>
                        </div>
                    </div>

                    {/* Contact information */}
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
                        <div className="bg-brown-300 py-4">
                            <h3 className="text-xl font-bold text-white text-center">PahariWorld Photography</h3>
                        </div>
                        <div className="p-6">
                            <h4 className="text-lg font-semibold mb-4">Contact Us:</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-brown-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>+91 97600 24028</span>
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-brown-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>pahariworld@gmail.com</span>
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-brown-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>www.pahariworld.com</span>
                                </li>
                                <li className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-brown-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Pahari Gali, Vikasnagar, DDun</span>
                                </li>
                            </ul>
                            <div className="text-center mt-8">
                                <p className="text-xl font-semibold text-brown-500">Thank You</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricePackages; 