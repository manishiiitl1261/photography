"use client";
import React, { useState } from 'react';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        whatsappNumber: '',
        phoneNumber: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [showPopup, setShowPopup] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const validatePhone = (phone) => {
        const re = /^\+91\d{10}$/;
        return re.test(phone);
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.name) tempErrors.name = "Name is required";
        if (!formData.whatsappNumber) {
            tempErrors.whatsappNumber = "Phone is required";
        } else if (!validatePhone(formData.whatsappNumber)) {
            tempErrors.phone = "Invalid phone format. Format: +911234567890";
        }
        if (!formData.phoneNumber) {
            tempErrors.phoneNumber = "Phone is required";
        } else if (!validatePhone(formData.phoneNumber)) {
            tempErrors.phoneNumber = "Invalid phone format. Format: +911234567890";
        }
        if (!formData.subject) tempErrors.subject = "Subject is required";
        if (!formData.message) tempErrors.message = "Message is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Form submitted:', formData);
            setShowPopup(true);

            setTimeout(() => {
                setShowPopup(false);
            }, 3000);

            setFormData({
                name: '',
                whatsappNumber: '',
                phoneNumber: '',
                subject: '',
                message: ''
            });
            setErrors({});
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-4">
                    <div className="w-full">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded hover:border hover:border-gray-900 hover:rounded duration-300 text-black`}
                            required
                        />
                        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                    </div>
                    <div className="w-full ">
                        <input
                            type="number"
                            name="whatsappNumber"
                            placeholder="Whatsapp Number"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'} rounded hover:border hover:border-gray-900  duration-300 text-black`}
                            required
                        />
                        {errors.email && <div className="text-red-500 text-sm">{errors.whatsappNumber}</div>}
                    </div>
                </div>
                <div className="flex space-x-4">
                    <div className="w-full">
                        <input
                            type="number"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded hover:border hover:border-gray-900 duration-300 text-black`}
                            required
                        />
                        {errors.phone && <div className="text-red-500 text-sm">{errors.phoneNumber}</div>}
                    </div>
                    <div className="w-full">
                        <input
                            type="text"
                            name="subject"
                            placeholder="Event"
                            value={formData.subject}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.subject ? 'border-red-500' : 'border-gray-300'} roundedhover:border hover:border-gray-900  duration-300 text-black`}
                            required
                        />
                        {errors.subject && <div className="text-red-500 text-sm">{errors.subject}</div>}
                    </div>
                </div>
                <div className="w-full">
                    <textarea
                        name="message"
                        placeholder="description"
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full p-2 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded h-32 hover:border hover:border-gray-900 duration-300 text-black`}
                        required
                    ></textarea>
                    {errors.message && <div className="text-red-500 text-sm">{errors.message}</div>}
                </div>
                <button type="submit" className="bg-purple-500 text-white py-2 px-4 sm:px-8 rounded hover:bg-purple-600 duration-300 hover:border hover:border-black">Send </button>
            </form>

            {showPopup && (
                <div className="fixed top-2 right-2 z-50 bg-green-500 text-white p-2 shadow shadow-green-400 rounded-sm">
                    🎉 Hurray! Your message has been sent successfully.
                </div>
            )}
        </div>
    );
};

export default ContactForm;
