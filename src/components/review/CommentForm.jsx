"use client";
import React, { useState, useRef } from "react";

function CommentForm() {
    const [name, setName] = useState("");
    const [event, setEvent] = useState("");
    const [comment, setComment] = useState("");
    const [photo, setPhoto] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const fileInputRef = useRef(null);
    const fileInputRef2 = useRef(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file ? file.name : "");
    };

    const handleProfilePhotoChange = (e) => {
        const file = e.target.files[0];
        setProfilePhoto(file ? file.name : "");
    };

    const handleStarClick = (ratingValue) => {
        setRating(ratingValue);
    };

    const handleStarHover = (ratingValue) => {
        setHoverRating(ratingValue);
    };

    const handleStarLeave = () => {
        setHoverRating(0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !event || !comment || !photo || !profilePhoto || rating === 0) {
            alert("Please fill all required fields! (rating,photo,profile,name,event,comment)");
            return;
        }

        setShowPopup(true);

        setTimeout(() => {
            setShowPopup(false);
        }, 3000);

        setName("");
        setEvent("");
        setComment("");
        setPhoto("");
        setProfilePhoto("");
        setRating(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (fileInputRef2.current) fileInputRef2.current.value = "";
    };

    return (
        <div className="bg-slate-200 p-4 rounded-lg shadow-md shadow-slate-200 lg:py-10">
            <form onSubmit={handleSubmit} className="gap-4">
                <div className="mb-2 text-black">
                    <label>
                        Name * <br />
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 mt-1 rounded-lg hover:border-2 hover:border-gray-950 duration-300 text-black"
                            required
                        />
                    </label>
                </div>
                <div className="mb-2 text-black">
                    <label>
                        Event * <br />
                        <input
                            type="text"
                            placeholder="Event"
                            value={event}
                            onChange={(e) => setEvent(e.target.value)}
                            className="w-full p-2 mt-1 rounded-lg hover:border-2 hover:border-gray-950 duration-300 text-black"
                            required
                        />
                    </label>
                </div>
                <div className="mb-2 text-black">
                    <label>
                        Comment * <br />
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="5"
                            className="w-full p-2 mt-1 rounded-lg hover:border-2 hover:border-gray-950 duration-300 text-black"
                            required
                        ></textarea>
                    </label>
                </div>
                <div className="flex flex-col sm:flex-row justify-evenly">
                    <div className="mb-2 text-black">
                        <label>
                            Photo of the Event * <br />
                            <input
                                type="file"
                                onChange={handlePhotoChange}
                                ref={fileInputRef}
                                className="mt-2 text-black"
                                required
                            />
                        </label>
                    </div>
                    <div className="mb-2 text-black">
                        <label>
                            Profile photo * <br />
                            <input
                                type="file"
                                onChange={handleProfilePhotoChange}
                                ref={fileInputRef2}
                                className="mt-2 text-black"
                                required
                            />
                        </label>
                    </div>
                </div>
                <div className="mb-2 text-black flex sm:flex-row flex-col sm:mt-4 gap-4 ">
                    <h1>Rating *</h1>
                    <div className="flex flex-row border border-black rounded-full bg-lime-400 gap-4 px-6 w-fit">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`text-2xl duration-300 ${(hoverRating || rating) >= star ? "text-blue-500" : "text-white"
                                    }`}
                                onMouseEnter={() => handleStarHover(star)}
                                onMouseLeave={handleStarLeave}
                                onClick={() => handleStarClick(star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    className="duration-300 px-5 py-2.5 font-[Poppins] rounded-md text-white md:w-auto bg-sky-500 hover:bg-sky-600 mt-4 sm:ml-60"
                >
                    Post Comment
                </button>
            </form>
            {showPopup && (
                <div className="fixed top-2 right-2 z-50 bg-green-500 text-white p-2 shadow shadow-green-400 rounded-sm">
                    🎉 Hurray! Your review has been submitted successfully.
                </div>
            )}
        </div>
    );
}

export default CommentForm;
