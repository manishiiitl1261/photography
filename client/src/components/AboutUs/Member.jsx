"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTeamMembers } from "@/contexts/TeamMemberContext";

const Member = () => {
    const { t } = useLanguage();
    const { members, loading, error } = useTeamMembers();
    const [selectedImage, setSelectedImage] = useState(null);

    const animationVariants = {
        left: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
        right: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
        top: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
        down: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    };

    const openImagePreview = (imageUrl, name) => {
        setSelectedImage({ url: imageUrl, name });
    };

    const closeImagePreview = () => {
        setSelectedImage(null);
    };

    if (loading) {
        return (
            <div className="overflow-hidden gap-4 sm:gap-8 items-center my-4 sm:my-8 bg-opacity-70 bg-purple-200">
                <div className="text-center sm:text-4xl lg:text-6xl text-4xl italic text-black">{t.aboutUs.teamTitle}</div>
                <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    <p className="ml-3 text-gray-700">Loading team members...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="overflow-hidden gap-4 sm:gap-8 items-center my-4 sm:my-8 bg-opacity-70 bg-purple-200">
                <div className="text-center sm:text-4xl lg:text-6xl text-4xl italic text-black">{t.aboutUs.teamTitle}</div>
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden gap-4 sm:gap-8 items-center my-4 sm:my-8 bg-opacity-70 bg-purple-200">
            <div className="text-center sm:text-4xl lg:text-6xl text-4xl italic text-black">{t.aboutUs.teamTitle}</div>

            {/* Scrollable container for team members */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2 pb-4">
                        {members.map((member, index) => (
                            <motion.div
                                key={member._id || index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.3 }}
                                variants={animationVariants[member.animation]}
                                transition={{ duration: 0.7, delay: index * 0.2, ease: "easeOut" }}
                                className="p-4 bg-slate-300 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
                            >
                                <div className="relative overflow-hidden rounded-t-lg">
                                    <img
                                        src={member.image || member.img}
                                        alt={member.name}
                                        className="w-full h-60 object-cover"
                                    />
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-black">{member.name}</h3>
                                        <p className="text-purple-500">{member.role}</p>
                                    </div>
                                    <button
                                        onClick={() => openImagePreview(member.image || member.img, member.name)}
                                        className="text-sm px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                                    >
                                        View
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-600">
                        No team members to display
                    </div>
                )}
            </div>

            {/* Full Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl w-full">
                        <button
                            onClick={closeImagePreview}
                            className="absolute top-4 right-4 text-white bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center hover:bg-purple-700 transition-colors z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="bg-white p-2 rounded-lg overflow-hidden">
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.name}
                                className="max-h-[80vh] w-auto mx-auto"
                            />
                            <div className="text-center p-4 text-xl font-semibold">{selectedImage.name}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Member;
