"use client";
import React from "react";
import { motion } from "framer-motion";
import photos from "@/pages/Portfolio/Photo";

const animationVariants = {
    left: { x: [-300, 0], opacity: [0, 1] },
    right: { x: [300, 0], opacity: [0, 1] },
    up: { y: [-300, 0], opacity: [0, 1] },
    down: { y: [300, 0], opacity: [0, 1] },
};

const directions = ["left", "right", "up", "down"];

const Gallery = () => {
    return (
        <div className=" grid grid-cols-3 gap-4 p-4 overflow-hidden">
            {photos.map((photo, index) => {
                const direction = directions[index % directions.length];
                return (
                    <motion.div
                        key={photo.id}
                        className="overflow-hidden rounded-lg shadow-md"
                        initial="hidden"
                        animate={direction}
                        variants={animationVariants}
                        transition={{ duration: 3, delay: index * 0.4 }}
                    >
                        <img
                            src={photo.src}
                            alt={photo.alt}
                            className="w-full h-full object-cover duration-300 hover:scale-110 cursor-pointer"
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default Gallery;
