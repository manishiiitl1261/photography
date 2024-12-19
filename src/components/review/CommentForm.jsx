"use client";
import React, { useState, useRef } from "react";

function CommentForm() {
    const [name, setName] = useState("");
    const [event, setEvent] = useState("");
    const [comment, setComment] = useState("");
    const [photo, setPhoto] = useState("");
    const [showPopup, setShowPopup] = useState(false); // State to control the popup
    const fileInputRef = useRef(null);
    //  for if photo is choosed and submit button is click after that photo name is cleared
    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        setPhoto(file ? file.name : "")
    }

    //  for submit button is click after
    const handleSubmit = (e) => {
        e.preventDefault();
        // Check if inputs are filled (optional as 'required' already enforces this)
        if (!name || !event || !comment || !photo) {
            alert("Please fill all required fields!");
            return;
        }

        setShowPopup(true); // Show popup when form is submitted

        // Automatically hide the popup after 3 seconds
        setTimeout(() => {
            setShowPopup(false);
        }, 3000);

        // Clear form fields
        setName("");
        setEvent("");
        setComment("");
        setPhoto("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    return (
        <div className="sm:w-4/6 bg-slate-200 p-6 rounded-lg shadow-md shadow-slate-100">
            {/* <p className="text-red-400 text-center font-bold">
                Your email address will not be published. Required fields are marked *
            </p> */}

            {/* Use FORM here */}
            <form onSubmit={handleSubmit} className="">
                {/* Name Field */}
                <div className="mb-2">
                    <label>
                        Name * <br />
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 mt-1 rounded-lg hover:border-2 hover:border-gray-950 duration-300"
                            required
                        />
                    </label>
                </div>

                {/* Email Field */}
                {/* <div className="mb-2">
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
                </div> */}

                {/*  Event Details */}
                <div className="mb-2">
                    <label>
                        Event * <br />
                        <input
                            type="text"
                            placeholder="Event"
                            value={event}
                            onChange={(e) => setEvent(e.target.value)}
                            className="w-full p-2 mt-1 rounded-lg hover:border-2 hover:border-gray-950 duration-300"
                            required
                        />
                    </label>
                </div>

                {/* Comment Field */}
                <div className="mb-2">
                    <label>
                        Comment * <br />
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="5"
                            className="w-full p-2 mt-1 rounded-lg hover:border-2 hover:border-gray-950 duration-300"
                            required
                        ></textarea>
                    </label>
                </div>

                {/* Photo of the Event */}
                <div className="mb-2 w-fit">
                    <label>
                        Photo of the Event * <br />
                        <input
                            type="file"
                            onChange={handlePhotoChange}
                            ref={fileInputRef}
                            className="mt-2"
                            required
                        />
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="duration-300 px-5 py-2.5 font-[Poppins] rounded-md text-white md:w-auto bg-sky-500 hover:bg-sky-600 mt-4 "
                >
                    Post Comment
                </button>
            </form>

            {/* Popup Message */}
            {showPopup && (
                <div className="fixed top-2 right-2 z-50 bg-green-500 text-white p-2 shadow shadow-green-400 rounded-sm">
                    🎉 Hurray! Your review has been submitted successfully.
                </div>
            )}
        </div>
    );
}

export default CommentForm;
