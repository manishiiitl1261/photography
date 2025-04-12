"use client";
import { motion } from "framer-motion";
import services from "@/components/Services/ServiceCardHelper";
import { useLanguage } from "@/contexts/LanguageContext";

const animationVariants = {
    left: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    right: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    top: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    down: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
};

const ServiceCard = () => {
    const { t } = useLanguage();

    // Function to get translated title and description based on service type
    const getTranslatedService = (service) => {
        let serviceKey;

        // Determine which service type this is
        if (service.title === "Photography") serviceKey = "photography";
        else if (service.title === "Videography") serviceKey = "videography";
        else if (service.title === "Drone Photography") serviceKey = "drone";
        else if (service.title === "Product Photography") serviceKey = "product";
        else if (service.title === "Lightning Setup") serviceKey = "lighting";
        else if (service.title === "Video Editing") serviceKey = "editing";
        else return service; // Fallback to original data

        return {
            ...service,
            title: t.services.serviceList[serviceKey].title,
            description: t.services.serviceList[serviceKey].description
        };
    };

    return (
        <div className="overflow-hidden  gap-4 sm:gap-8 items-center my-4 sm:my-8">
            <div className=" text-center sm:text-4xl lg:text-6xl text-4xl italic text-black">{t.services.title}</div>
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden">
                {services.map((service, index) => {
                    const translatedService = getTranslatedService(service);

                    return (
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
                            <h3 className="text-xl font-semibold mb-2 text-black">{translatedService.title}</h3>
                            {/* Description */}
                            <p className="text-gray-600 mb-4">{translatedService.description}</p>
                            {/* Learn More */}
                            <a href="#" className="text-blue-400 font-medium hover:text-blue-600">
                                + {t.services.learnMore}
                            </a>
                        </motion.div>
                    );
                })}
            </div>
        </div >
    );
};

export default ServiceCard;
