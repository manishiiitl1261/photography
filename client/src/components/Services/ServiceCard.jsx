"use client";
import { motion } from "framer-motion";
import { useServices } from "@/contexts/ServicesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from 'next/router';

const animationVariants = {
    left: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    right: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    top: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    down: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
};

const ServiceCard = () => {
    const { t } = useLanguage();
    const { serviceItems, loading, error } = useServices();
    const router = useRouter();
    const isAdmin = router.pathname.startsWith('/admin');

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

    // Get animation direction based on index
    const getAnimationDirection = (index) => {
        const directions = ['left', 'top', 'right', 'down'];
        return directions[index % directions.length];
    };

    // Render loading state
    if (loading) {
        return (
            <div className="overflow-hidden gap-4 sm:gap-8 items-center my-4 sm:my-8">
                <div className="text-center sm:text-4xl lg:text-6xl text-4xl italic text-black font-bold">{t.services.title}</div>
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    <p className="ml-3 text-gray-700">Loading services...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="overflow-hidden gap-4 sm:gap-8 items-center my-4 sm:my-8">
                <div className="text-center sm:text-4xl lg:text-6xl text-4xl italic text-black font-bold">{t.services.title}</div>
                <div className="text-center py-10 px-4">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-auto max-w-2xl">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                        {isAdmin && (
                            <p className="mt-2">
                                Please add services from the admin panel or run the database seed script.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Render empty state
    if (!serviceItems || serviceItems.length === 0) {
        return (
            <div className="overflow-hidden gap-4 sm:gap-8 items-center my-4 sm:my-8">
                <div className="text-center sm:text-4xl lg:text-6xl text-4xl italic text-black font-bold">{t.services.title}</div>
                <div className="text-center py-10">
                    <p className="text-gray-500">No services available at the moment.</p>
                    {isAdmin && (
                        <p className="mt-2 text-gray-500">
                            Please add services from the admin panel or run the database seed script.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Render services
    return (
        <div className="overflow-hidden gap-4 sm:gap-8 items-center my-4 sm:my-8">
            <div className="text-center sm:text-4xl lg:text-6xl text-4xl italic text-black font-bold">{t.services.title}</div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden max-h-[calc(100vh-200px)] md:max-h-[80vh] overflow-y-auto pr-2 border-2 border-white rounded-lg p-4 sm:p-6 xl:p-8">
                    {serviceItems.map((service, index) => {
                        const translatedService = getTranslatedService(service);
                        const animationDirection = service.animation || getAnimationDirection(index);

                        return (
                            <motion.div
                                key={service._id || index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.3 }}
                                variants={animationVariants[animationDirection]}
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
            </div>
        </div>
    );
};

export default ServiceCard;
