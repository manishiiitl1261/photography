"use client"
import React, { useState } from "react";

function CommentForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [comment, setComment] = useState("");

    const [showPopup, setShowPopup] = useState(false); // State to control the popup

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPopup(true); // Show popup when form is submitted

        // Automatically hide the popup after 3 seconds
        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    };

    return (
        <div className=" sm: w-4/6 bg-zinc-300 p-6 rounded-lg shadow-md shadow-slate-100 ">
            <p className="text-red-400 text-center font-bold">Your email address will not be published. Required fields are marked *</p>
            <div onSubmit={handleSubmit} className="">
                {/* Name Field */}
                <div className="mb-2">
                    <label>
                        Name * <br />
                        <input
                            type="text"
                            placeholder="Email"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 mt-1 rounded-lg hover:border-2 hover:border-gray-950 duration-300"
                            required
                        />
                    </label>
                </div>

                {/* Email Field */}
                <div className="mb-2">
                    <label>
                        Email * <br />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 mt-1 rounded-lg hover:border-2 hover:border-gray-950 duration-300"
                            required

                        />
                    </label>
                </div>

                {/* Comment Field */}
                <div className="mb-2">
                    <label>
                        Comment <br />
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="5"
                            className="w-full p-2 mt-1 rounded-lg hover:border-2 hover:border-gray-950 duration-300"
                        ></textarea>
                    </label>
                </div>
                {/* Submit Button */}
                <button
                    type="submit"
                    className="duration-300 px-5 py-2.5 font-[Poppins]
                rounded-md text-white md:w-auto bg-sky-500 hover:bg-sky-600 ">
                    Post Comment
                </button>
            </div>
            {/* Popup Message */}
            {showPopup && (
                <div className=" fixed top-2 right-2 bg-green-500  text-white p-2 shadow shadow-green-400">
                    🎉 Hurray! Your review has been submitted successfully.
                </div>
            )}
        </div>
    );
}

export default CommentForm;
