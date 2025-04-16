"use client";
import React, { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReviews } from "@/contexts/ReviewContext";
import { useAuth } from "@/contexts/AuthContext";
import { FaStar } from "react-icons/fa";

function CommentForm() {
    const { t } = useLanguage();
    const { addReview } = useReviews();
    const { user, getAvatarUrl } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [event, setEvent] = useState("");
    const [comment, setComment] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [eventImage, setEventImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const fileInputRef = useRef(null);

    const handleEventImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                setError(t.reviews.comment.imageTypeError);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError(t.reviews.comment.imageSizeError);
                return;
            }

            setEventImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError("");
        }
    };

    const handleStarClick = (value) => setRating(value);
    const handleStarHover = (value) => setHoverRating(value);
    const handleStarLeave = () => setHoverRating(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !event || !comment || rating === 0) {
            alert(t.reviews.comment.fillFields);
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const formData = new FormData();
            formData.append("name", name);
            formData.append("event", event);
            formData.append("text", comment);
            formData.append("rating", rating);
            if (user?._id) formData.append("userId", user._id);
            if (user?.avatar) formData.append("userAvatar", user.avatar);
            if (eventImage) formData.append("eventImage", eventImage);

            const result = await addReview(formData);

            if (result.success) {
                setShowPopup(true);
                setName(user?.name || "");
                setEvent("");
                setComment("");
                setRating(0);
                setEventImage(null);
                setPreviewUrl("");
                if (fileInputRef.current) fileInputRef.current.value = "";

                setTimeout(() => setShowPopup(false), 3000);
            } else {
                setError(result.error || t.reviews.comment.submitError);
            }
        } catch (err) {
            console.error("Error submitting review:", err);
            setError(err.message || t.reviews.comment.submitError);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-opacity-40 bg-purple-300 p-4 rounded-lg shadow-md shadow-slate-200 lg:p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-blue-950">
                {t.reviews.yourReview}
            </h2>

            {user && (
                <div className="flex justify-center mb-6">
                    <div className="flex flex-col items-center">
                        <img
                            src={getAvatarUrl(user.avatar)}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
                            onError={(e) => {
                                e.target.src = "/assets/avtar.png";
                            }}
                        />
                        <p className="mt-2 text-blue-900 font-medium">
                            {t.reviews.comment.reviewingAs} {user.name}
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-black">
                    <div>
                        <label className="block mb-1 font-medium">
                            {t.reviews.comment.name} *
                        </label>
                        <input
                            type="text"
                            placeholder={t.reviews.comment.name}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">
                            {t.reviews.comment.event} *
                        </label>
                        <input
                            type="text"
                            placeholder={t.reviews.comment.event}
                            value={event}
                            onChange={(e) => setEvent(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            required
                            disabled={submitting}
                        />
                    </div>
                </div>

                <div className="mb-4 text-black">
                    <label className="block mb-1 font-medium">
                        {t.reviews.comment.comment} *
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="5"
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        required
                        disabled={submitting}
                        placeholder="Share your experience..."
                    ></textarea>
                </div>

                <div className="mb-4 text-black">
                    <label className="block mb-1 font-medium">
                        {t.reviews.comment.eventImage}{" "}
                        <span className="text-sm text-gray-500">
                            ({t.reviews.comment.optional})
                        </span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-1/2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleEventImageChange}
                                ref={fileInputRef}
                                className="w-full p-2 text-sm text-gray-800 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                                disabled={submitting}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {t.reviews.comment.imageRequirements}
                            </p>
                        </div>

                        {previewUrl && (
                            <div className="w-full sm:w-1/2 h-40 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                                <img
                                    src={previewUrl}
                                    alt="Event Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEventImage(null);
                                        setPreviewUrl("");
                                        if (fileInputRef.current)
                                            fileInputRef.current.value = "";
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs z-10 hover:bg-red-600 transition"
                                    disabled={submitting}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6 text-black">
                    <label className="block mb-2 font-medium">
                        {t.reviews.comment.rating} *
                    </label>
                    <div className="flex items-center gap-1 bg-slate-200 p-3 rounded-lg w-fit">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`text-2xl transition-colors duration-200 ${(hoverRating || rating) >= star
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                    }`}
                                onMouseEnter={() => handleStarHover(star)}
                                onMouseLeave={handleStarLeave}
                                onClick={() => handleStarClick(star)}
                                disabled={submitting}
                                aria-label={`Rate ${star} stars`}
                            >
                                <FaStar />
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 text-red-600 text-sm p-2 bg-red-50 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={
                            submitting || !name || !event || !comment || rating === 0
                        }
                        className={`px-6 py-3 font-medium rounded-md text-white transition-all duration-300 ${submitting || !name || !event || !comment || rating === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                            }`}
                    >
                        {submitting ? (
                            <span className="flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                {t.reviews.comment.submitting || "Submitting..."}
                            </span>
                        ) : (
                            t.reviews.comment.postComment
                        )}
                    </button>
                </div>
            </form>

            {showPopup && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-fadeIn">
                    <div className="flex items-center">
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                        {t.reviews.comment.success}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CommentForm;
