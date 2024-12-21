"use client";
import React, { useState } from "react";

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        whatsappNumber: "",
        phoneNumber: "",
        subject: "",
        message: "",
    });

    const [countryCode, setCountryCode] = useState({
        whatsappNumber: "+91",
        phoneNumber: "+91",
    });

    const [errors, setErrors] = useState({});
    const [showPopup, setShowPopup] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleCountryCodeChange = (e, field) => {
        setCountryCode({
            ...countryCode,
            [field]: e.target.value,
        });
    };

    const validatePhone = (phone) => /^\d{10}$/.test(phone);

    const validate = () => {
        let tempErrors = {};
        if (!formData.name) tempErrors.name = "Name is required";
        if (formData.whatsappNumber && !validatePhone(formData.whatsappNumber)) {
            tempErrors.whatsappNumber = "Invalid WhatsApp number format. Enter 10 digits.";
        }
        if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
            tempErrors.phoneNumber = "Invalid phone number format. Enter 10 digits.";
        }
        if (!formData.subject) tempErrors.subject = "Subject is required";
        if (!formData.message) tempErrors.message = "Message is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            const adminWhatsAppNumber = "+918279659726";

            const message = `Name: ${formData.name}
Event: ${formData.subject}
Message: ${formData.message}
WhatsApp: ${countryCode.whatsappNumber} ${formData.whatsappNumber || "Not Provided"}
Phone: ${countryCode.phoneNumber} ${formData.phoneNumber || "Not Provided"}`;

            const whatsappURL = `https://api.whatsapp.com/send?phone=${adminWhatsAppNumber}&text=${encodeURIComponent(
                message
            )}`;
            window.open(whatsappURL, "_blank");

            setShowPopup(true);

            setTimeout(() => {
                setShowPopup(false);
            }, 3000);

            setFormData({
                name: "",
                whatsappNumber: "",
                phoneNumber: "",
                subject: "",
                message: "",
            });
            setErrors({});
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="w-full">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.name ? "border-red-500" : "border-gray-300"
                                } rounded text-black`}
                            required
                        />
                        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                    </div>
                </div>
                <div className="flex flex-col space-y-4 md:space-y-0">
                    <div className="flex space-x-2">
                        <select
                            name="whatsappCountryCode"
                            value={countryCode.whatsappNumber}
                            onChange={(e) => handleCountryCodeChange(e, "whatsappNumber")}
                            className="p-2 border border-gray-300 rounded bg-white"
                        >
                            <option value="+91">+91 (India)</option>
                            <option value="+1">+1 (USA)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+61">+61 (Australia)</option>
                            <option value="+81">+81 (Japan)</option>
                        </select>
                        <input
                            type="text"
                            name="whatsappNumber"
                            placeholder="WhatsApp Number"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            className={`flex-grow p-2 border ${errors.whatsappNumber ? "border-red-500" : "border-gray-300"
                                } rounded text-black`}
                        />
                    </div>
                    {errors.whatsappNumber && (
                        <div className="text-red-500 text-sm">{errors.whatsappNumber}</div>
                    )}
                </div>
                <div className="flex flex-col space-y-4 md:space-y-0">
                    <div className="flex space-x-2">
                        <select
                            name="phoneCountryCode"
                            value={countryCode.phoneNumber}
                            onChange={(e) => handleCountryCodeChange(e, "phoneNumber")}
                            className="p-2 border border-gray-300 rounded bg-white"
                        >
                            <option value="+91">+91 (India)</option>
                            <option value="+1">+1 (USA)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+61">+61 (Australia)</option>
                            <option value="+81">+81 (Japan)</option>
                        </select>
                        <input
                            type="text"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={`flex-grow p-2 border ${errors.phoneNumber ? "border-red-500" : "border-gray-300"
                                } rounded text-black`}
                        />
                    </div>
                    {errors.phoneNumber && (
                        <div className="text-red-500 text-sm">{errors.phoneNumber}</div>
                    )}
                </div>
                <div className="w-full">
                    <input
                        type="text"
                        name="subject"
                        placeholder="Event"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full p-2 border ${errors.subject ? "border-red-500" : "border-gray-300"
                            } rounded text-black`}
                        required
                    />
                    {errors.subject && (
                        <div className="text-red-500 text-sm">{errors.subject}</div>
                    )}
                </div>
                <div className="w-full">
                    <textarea
                        name="message"
                        placeholder="Description"
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full p-2 border ${errors.message ? "border-red-500" : "border-gray-300"
                            } rounded h-32 text-black`}
                        required
                    ></textarea>
                    {errors.message && <div className="text-red-500 text-sm">{errors.message}</div>}
                </div>
                <button
                    type="submit"
                    className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
                >
                    Send
                </button>
            </form>

            {showPopup && (
                <div className="fixed top-2 right-2 bg-green-500 text-white p-2 rounded">
                    🎉 Message sent! Redirecting to WhatsApp.
                </div>
            )}
        </div>
    );
};

export default ContactForm;
