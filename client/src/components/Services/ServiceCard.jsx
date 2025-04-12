"use client";
import { motion } from "framer-motion";
import services from "@/components/Services/ServiceCardHelper";
const animationVariants = {
    left: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    right: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    top: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    down: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
};

const ServiceCard = () => {
    return (
        <div className="overflow-hidden  gap-4 sm:gap-8 items-center my-4 sm:my-8">
            <div className=" text-center sm:text-4xl lg:text-6xl text-4xl italic text-black"> OUR SERVICES </div>
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden">
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.3 }}
                        variants={animationVariants[service.animation]}
                        transition={{ duration: 0.7, delay: index * 0.2, ease: "easeOut" }}
                        className="p-6 bg-slate-200 rounded-lg shadow-lg text-center hover:shadow-2xl transition-shadow duration-300"
                    >
                        {/* Icon */}
                        <div className="text-5xl mb-4">{service.icon}</div>
                        {/* Title */}
                        <h3 className="text-xl font-semibold mb-2 text-black">{service.title}</h3>
                        {/* Description */}
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        {/* Learn More */}
                        <a href="#" className="text-blue-400 font-medium hover:text-blue-600">
                            + Learn More
                        </a>
                    </motion.div>
                ))}
            </div>
        </div >
    );
};

export default ServiceCard;
