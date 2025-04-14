"use client";

import React from 'react';
import Header from '../header/Header';
import PricePackages from './PricePackages';
import Footer from '../footer/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const ServicesPage = () => {
    const { t } = useLanguage();

    const services = [
        {
            title: 'Wedding Photography',
            description: 'Capture your special day with our professional wedding photography services. We offer a range of packages to suit your needs and budget.',
            image: '/assest/wedding.jpg'
        },
        {
            title: 'Portrait Photography',
            description: 'Professional portrait photography for individuals, families, and groups. Perfect for professional profiles, family albums, or special occasions.',
            image: '/assest/portrait.jpg'
        },
        {
            title: 'Event Coverage',
            description: 'Complete coverage of your events including corporate functions, birthdays, anniversaries, and more. We capture the moments that matter.',
            image: '/assest/event.jpg'
        },
        {
            title: 'Commercial Photography',
            description: 'High-quality commercial photography for your business needs. Product photography, brand imagery, and marketing materials.',
            image: '/assest/commercial.jpg'
        }
    ];

    return (
        <div>
            <Header title="Our Services" />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Photography Services</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We offer a range of professional photography services to capture your special moments.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-cream-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.src = `/assest/work-${index + 1}.jpg` }}
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                                    <p className="text-gray-700">{service.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Include the price packages component */}
            <PricePackages />

            {/* Our Process Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Process</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From booking to delivery, our process ensures a seamless experience.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
                        <div className="text-center max-w-xs">
                            <div className="w-24 h-24 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-brown-500 text-3xl font-bold">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Consultation</h3>
                            <p className="text-gray-600">We discuss your vision, requirements, and preferences.</p>
                        </div>

                        <div className="text-center max-w-xs">
                            <div className="w-24 h-24 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-brown-500 text-3xl font-bold">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Booking</h3>
                            <p className="text-gray-600">Secure your date with a booking and select your preferred package.</p>
                        </div>

                        <div className="text-center max-w-xs">
                            <div className="w-24 h-24 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-brown-500 text-3xl font-bold">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Shoot Day</h3>
                            <p className="text-gray-600">Our professional team captures your special moments.</p>
                        </div>

                        <div className="text-center max-w-xs">
                            <div className="w-24 h-24 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-brown-500 text-3xl font-bold">4</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Delivery</h3>
                            <p className="text-gray-600">Receive your professionally edited photos and videos.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ServicesPage; 