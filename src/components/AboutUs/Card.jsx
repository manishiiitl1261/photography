"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Card = () => {
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.2 } // Trigger animation when 20% is visible
        );

        const card = document.querySelector("#animated-card");
        if (card) observer.observe(card);

        return () => observer.disconnect();
    }, []);

    // Animation Variants for Framer Motion
    const textAnimation = {
        hidden: { x: -100, opacity: 0 },
        visible: { x: 0, opacity: 1 },
    };

    const imageAnimation = {
        hidden: { x: 100, opacity: 0 },
        visible: { x: 0, opacity: 1 },
    };

    return (
        <div
            id="animated-card"
            className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 overflow-hidden"
        >
            {/* Card Container */}
            <div className="flex flex-col lg:flex-row items-center gap-10 shadow-lg rounded-lg p-6 md:p-8 lg:p-16 relative">
                {/* Left Section: Text Content */}
                <motion.div
                    className="flex-1"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={textAnimation}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.1,
                    }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6 text-center lg:text-left italic">
                        Hello, I'm <span className="text-lime-600">Arvind Rawat</span>, a
                        professional photographer based on{" "}
                        <span className="text-lime-600">India</span>
                    </h1>
                    <p className="text-gray-600 leading-relaxed mb-6 text-center lg:text-left">
                        Hello! I became interested in landscape photography about five years ago
                        when I moved to New York City. I had a full-time job during the week and
                        spent my weekends getting as far away from the city as possible.
                    </p>

                    {/* List Section */}
                    <ul className="space-y-4 text-gray-800 text-center lg:text-left">
                        <li className="flex items-center justify-center lg:justify-start">
                            <span className="mr-2 text-lime-600">✔</span> 12 Years of Experience
                        </li>
                        <li className="flex items-center justify-center lg:justify-start">
                            <span className="mr-2 text-lime-600">✔</span> Phone: +105 773 321 7771
                        </li>
                        <li className="flex items-center justify-center lg:justify-start">
                            <span className="mr-2 text-lime-600">✔</span> E-mail:
                            demo@example.com
                        </li>
                    </ul>
                </motion.div>

                {/* Right Section: Image */}
                <motion.div
                    className="flex-1 relative"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={imageAnimation}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.3,
                    }}
                >
                    {/* Background dotted pattern */}
                    <div className="absolute -top-4 -left-4 -z-10 w-40 h-40 sm:w-60 sm:h-60 bg-dotted-pattern bg-repeat opacity-20"></div>
                    <Image
                        src="/assest/admin2.jpg"
                        alt="Photographer"
                        width={500}
                        height={600}
                        className="rounded-lg shadow-md object-cover mx-auto lg:mx-0 cursor-pointer"
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default Card;
