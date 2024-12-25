"use client";
import teamMembers from "@/components/AboutUs/MembersHelper";
import { motion } from "framer-motion";
const Member = () => {
    const animationVariants = {
        left: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
        right: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
        top: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
        down: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    };
    return (
        <div className="overflow-hidden  gap-4 sm:gap-8 items-center my-4 sm:my-8 bg-opacity-70 bg-purple-200">
            <div className=" text-center sm:text-4xl lg:text-6xl text-4xl italic text-black"> OUR MEMBERS </div>
            <div className=" max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden">
                {teamMembers.map((member, index) => (
                    <motion.div
                        key={index}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.3 }}
                        variants={animationVariants[member.animation]}
                        transition={{ duration: 0.7, delay: index * 0.2, ease: "easeOut" }}
                        className="p-6 bg-slate-300 rounded-lg shadow-lg text-center hover:shadow-2xl transition-shadow duration-300"
                    >
                        <img
                            src={member.img}
                            alt={member.name}
                            className="w-full h-auto object-cover cursor-pointer"
                        />
                        < h3 className="text-lg font-semibold mt-4 text-black" > {member.name}</h3>
                        <p className="text-purple-500">{member.role}</p>
                    </motion.div >
                ))}
            </div >
        </div >
    );
};

export default Member;
