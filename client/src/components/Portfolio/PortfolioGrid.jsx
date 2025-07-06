"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { fetchPortfolioItems } from "@/utils/api";
import { useLanguage } from "@/contexts/LanguageContext";

const animationVariants = {
    left: { x: [-300, 0], opacity: [0, 1] },
    right: { x: [300, 0], opacity: [0, 1] },
    up: { y: [-300, 0], opacity: [0, 1] },
    down: { y: [300, 0], opacity: [0, 1] },
};

const directions = ["left", "right", "up", "down"];

const PortfolioGrid = () => {
    const { t } = useLanguage();
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [categories, setCategories] = useState([]);
    const [sortBy, setSortBy] = useState("newest");
    const [fullImageModal, setFullImageModal] = useState(null);

    useEffect(() => {
        const getPortfolioItems = async () => {
            try {
                setLoading(true);
                const items = await fetchPortfolioItems();
                setPortfolioItems(items);

                // Extract unique categories
                const uniqueCategories = [...new Set(items.map(item => item.category))];
                setCategories(uniqueCategories);

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch portfolio items:", err);
                setError("Failed to load portfolio items. Please try again later.");
                setLoading(false);
            }
        };

        getPortfolioItems();
    }, []);

    // Filter and sort items
    const filteredItems = useMemo(() => {
        // First filter by category
        let items = activeCategory === "all"
            ? [...portfolioItems]
            : portfolioItems.filter(item => item.category === activeCategory);

        // Then sort
        if (sortBy === "newest") {
            items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (sortBy === "oldest") {
            items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else if (sortBy === "title-asc") {
            items.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (sortBy === "title-desc") {
            items.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        }

        return items;
    }, [portfolioItems, activeCategory, sortBy]);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const openFullImage = (item) => {
        setFullImageModal(item);
    };

    const closeFullImage = () => {
        setFullImageModal(null);
    };

    // Close modal when clicking outside or pressing ESC
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && fullImageModal) {
                closeFullImage();
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [fullImageModal]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-screen-xl mx-auto p-6 sm:py-10 sm:px-6">
            <h2 className="text-center text-3xl sm:text-5xl font-bold mb-8 italic text-black">
                {t?.portfolio?.title?.toUpperCase() || "PORTFOLIO"}
            </h2>

            <div className="bg-white rounded-lg shadow-md p-6 mb-10">
                {/* Controls Section */}
                <div className="mb-6">
                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        <button
                            onClick={() => handleCategoryChange("all")}
                            className={`px-4 py-1 rounded-full ${activeCategory === "all"
                                ? "bg-lime-400 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                                }`}
                        >
                            All
                        </button>

                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`px-4 py-1 rounded-full text-black ${activeCategory === category
                                    ? "bg-lime-400 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Sort and Results Count */}
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-gray-600 mb-2 sm:mb-0">
                            Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                            {activeCategory !== 'all' && ` in ${activeCategory}`}
                        </p>

                        <div className="flex items-center gap-2">
                            <label htmlFor="sort-select" className="text-gray-700">Sort by:</label>
                            <select
                                id="sort-select"
                                value={sortBy}
                                onChange={handleSortChange}
                                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-lime-400 text-black"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title-asc">Title (A-Z)</option>
                                <option value="title-desc">Title (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Portfolio Grid - Scrollable */}
                <div className="h-[550px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item, index) => {
                                const direction = directions[index % directions.length];
                                return (
                                    <motion.div
                                        key={item._id}
                                        className="overflow-hidden rounded-lg shadow-md h-auto flex flex-col"
                                        initial="hidden"
                                        animate={direction}
                                        variants={animationVariants}
                                        transition={{ duration: 1.5, delay: index * 0.2 }}
                                    >
                                        {/* Image Container */}
                                        <div
                                            className="h-64 overflow-hidden bg-gray-100 cursor-pointer"
                                            onClick={() => openFullImage(item)}
                                        >
                                            <img
                                                src={item.src}
                                                alt={item.alt || item.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Card Footer with Info and Button */}
                                        <div className="p-4 bg-white flex-grow flex justify-between items-center">
                                            {/* Left Side - Title and Category */}
                                            <div>
                                                <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                                                {item.category && (
                                                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-1">
                                                        {item.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Right Side - View Button */}
                                            <button
                                                onClick={() => openFullImage(item)}
                                                className="bg-lime-400 text-white px-3 py-1.5 rounded-full hover:bg-lime-500 transition-colors text-sm flex items-center"
                                                aria-label="View full image"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p>No portfolio items found for this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full Image Modal */}
            {fullImageModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
                    onClick={closeFullImage}
                >
                    <div
                        className="max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 bg-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">{fullImageModal.title}</h3>
                            <button
                                onClick={closeFullImage}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center justify-center bg-gray-200 h-[70vh] p-2">
                            <img
                                src={fullImageModal.src}
                                alt={fullImageModal.alt || fullImageModal.title}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                        <div className="p-4 bg-white">
                            {fullImageModal.description && (
                                <p className="text-gray-700 mb-2">{fullImageModal.description}</p>
                            )}
                            {fullImageModal.tags && fullImageModal.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {fullImageModal.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioGrid; 