import React from 'react';
import { motion } from 'framer-motion';
import cardData from '@/pages/Services/PriceingHelper';
const Price = () => {
    const animationVariants = {
        left: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
        right: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
        top: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
        down: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    };
    return (
        <div className="overflow-hidden  gap-4 sm:gap-8 items-center my-4 sm:my-8">
            <div className=" text-center sm:text-4xl lg:text-6xl text-4xl italic"> Pricing Plan </div>
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden">
                {cardData.map((card, index) => (
                    <motion.div
                        key={index}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.3 }}
                        variants={animationVariants[card.animation]}
                        transition={{ duration: 0.7, delay: index * 0.2, ease: "easeOut" }}
                        className="p-6 bg-slate-200 rounded-lg shadow-lg text-center hover:shadow-2xl transition-shadow duration-300"
                    >
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">{card.title}</h2>
                            <p className="text-3xl font-bold mb-4">{card.price}</p>
                            <ul className="mb-4">
                                {card.features.map((feature, i) => (
                                    <li key={i} className="mb-2">{feature}</li>
                                ))}
                            </ul>
                            <button className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 duration-300">
                                Buy Now
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div >
    );
};

export default Price;
