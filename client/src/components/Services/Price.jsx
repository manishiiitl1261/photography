import React from 'react';
import { motion } from 'framer-motion';
import { usePricing } from '@/contexts/PricingContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Price = () => {
    const { t, language } = useLanguage();
    const { pricingPackages, loading, error } = usePricing();

    const animationVariants = {
        left: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
        right: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
        top: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
        down: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    };

    // Scroll to booking form when button is clicked
    const scrollToBookingForm = () => {
        const bookingFormElement = document.getElementById('booking-form-section');
        if (bookingFormElement) {
            bookingFormElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Get translated titles, prices, and features based on the package type
    const getTranslatedPackage = (card) => {
        let packageKey;

        // Determine which package type this is
        if (card.title.includes("Wedding")) packageKey = "wedding";
        else if (card.title.includes("Birthday")) packageKey = "birthday";
        else if (card.title.includes("Event") && !card.title.includes("Corporate")) packageKey = "event";
        else if (card.title.includes("Song")) packageKey = "song";
        else if (card.title.includes("Corporate")) packageKey = "corporate";
        else if (card.title.includes("Portrait")) packageKey = "portrait";
        else return card; // Fallback to original data

        // Create translated features
        const translatedFeatures = [];

        // Map features to translated ones
        card.features.forEach(feature => {
            if (feature.includes("Hours Session")) {
                const hours = feature.split(" ")[0];
                translatedFeatures.push(`${hours} ${t.pricing.hours}`);
            }
            else if (feature.includes("Quality Images")) {
                const count = feature.split(" ")[0];
                if (count === "Unlimited") {
                    translatedFeatures.push(`${t.pricing.unlimited} ${t.pricing.images}`);
                } else {
                    translatedFeatures.push(`${count} ${t.pricing.images}`);
                }
            }
            else if (feature.includes("Private Online Photo Gallery")) {
                translatedFeatures.push(t.pricing.gallery);
            }
            else if (feature.includes("Unlimited Coverage Locations")) {
                translatedFeatures.push(t.pricing.locations);
            }
            else if (feature.includes("Minute Edited HD")) {
                translatedFeatures.push(t.pricing.film);
            }
            else {
                translatedFeatures.push(feature); // Fallback
            }
        });

        return {
            ...card,
            title: t.pricing.packages[packageKey].title,
            price: t.pricing.packages[packageKey].price,
            features: translatedFeatures
        };
    };

    // Get animation direction based on index
    const getAnimationDirection = (index) => {
        const directions = ['left', 'top', 'right', 'down'];
        return directions[index % directions.length];
    };

    return (
        <div className="overflow-hidden gap-4 sm:gap-8 items-center">
            {loading && (
                <div className="text-center py-4">
                    <p>Loading pricing packages...</p>
                </div>
            )}

            {error && (
                <div className="text-center py-4 text-red-500">
                    <p>Error loading pricing packages. Using default data.</p>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="max-h-[calc(100vh-200px)] md:max-h-[80vh] overflow-y-auto pr-2 border-2 border-white rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden p-4 sm:p-6  xl:p-8">
                        {pricingPackages.map((card, index) => {
                            const translatedCard = getTranslatedPackage(card);
                            const animationDirection = card.animation || getAnimationDirection(index);

                            return (
                                <motion.div
                                    key={card._id || index}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false, amount: 0.3 }}
                                    variants={animationVariants[animationDirection]}
                                    transition={{ duration: 0.7, delay: index * 0.2, ease: "easeOut" }}
                                    className="p-6 bg-slate-200 rounded-lg shadow-lg text-center hover:shadow-2xl transition-shadow duration-300"
                                >
                                    <div className="bg-white rounded-lg shadow-lg p-6">
                                        <h2 className="text-2xl font-bold mb-4 text-black">{translatedCard.title}</h2>
                                        <p className="text-3xl font-bold mb-4 text-black">{translatedCard.price}</p>
                                        <ul className="mb-4">
                                            {translatedCard.features.map((feature, i) => (
                                                <li key={i} className="mb-2 text-black">{feature}</li>
                                            ))}
                                        </ul>
                                        <button
                                            className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 duration-300"
                                            onClick={scrollToBookingForm}
                                        >
                                            {t.pricing.buyNow}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Price;
