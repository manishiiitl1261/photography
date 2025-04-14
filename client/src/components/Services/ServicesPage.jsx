"use client";

import React, { useEffect, useState } from 'react';
import Header from '../header/Header';
import PricePackages from './PricePackages';
import Footer from '../footer/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const ServicesPage = () => {
    const { t } = useLanguage();
    const [services, setServices] = useState([]);

    useEffect(() => {
        // Update services when language changes
        setServices([
            {
                title: t.services.servicesPage.serviceTypes.wedding.title,
                description: t.services.servicesPage.serviceTypes.wedding.description,
                image: '/assest/wedding.jpg'
            },
            {
                title: t.services.servicesPage.serviceTypes.portrait.title,
                description: t.services.servicesPage.serviceTypes.portrait.description,
                image: '/assest/portrait.jpg'
            },
            {
                title: t.services.servicesPage.serviceTypes.event.title,
                description: t.services.servicesPage.serviceTypes.event.description,
                image: '/assest/event.jpg'
            },
            {
                title: t.services.servicesPage.serviceTypes.commercial.title,
                description: t.services.servicesPage.serviceTypes.commercial.description,
                image: '/assest/commercial.jpg'
            }
        ]);
    }, [t]);

    return (
        <div>
            <Header title={t.services.title} />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.services.servicesPage.title}</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            {t.services.servicesPage.description}
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
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.services.servicesPage.process.title}</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            {t.services.servicesPage.process.description}
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
                        <div className="text-center max-w-xs">
                            <div className="w-24 h-24 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-brown-500 text-3xl font-bold">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{t.services.servicesPage.process.steps.consultation.title}</h3>
                            <p className="text-gray-600">{t.services.servicesPage.process.steps.consultation.description}</p>
                        </div>

                        <div className="text-center max-w-xs">
                            <div className="w-24 h-24 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-brown-500 text-3xl font-bold">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{t.services.servicesPage.process.steps.booking.title}</h3>
                            <p className="text-gray-600">{t.services.servicesPage.process.steps.booking.description}</p>
                        </div>

                        <div className="text-center max-w-xs">
                            <div className="w-24 h-24 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-brown-500 text-3xl font-bold">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{t.services.servicesPage.process.steps.shootDay.title}</h3>
                            <p className="text-gray-600">{t.services.servicesPage.process.steps.shootDay.description}</p>
                        </div>

                        <div className="text-center max-w-xs">
                            <div className="w-24 h-24 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-brown-500 text-3xl font-bold">4</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{t.services.servicesPage.process.steps.delivery.title}</h3>
                            <p className="text-gray-600">{t.services.servicesPage.process.steps.delivery.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ServicesPage; 