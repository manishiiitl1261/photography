"use client";

import { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';

const serviceTypes = [
    { value: 'Wedding Shoot', label: 'Wedding Shoot', price: 500 },
    { value: 'Birthday Celebration', label: 'Birthday Celebration', price: 300 },
    { value: 'Event Shoot', label: 'Event Shoot', price: 400 },
    { value: 'Song Video Shoot', label: 'Song Video Shoot', price: 700 },
    { value: 'Corporate Event', label: 'Corporate Event', price: 600 },
    { value: 'Portrait Session', label: 'Portrait Session', price: 200 }
];

const packageTypes = [
    { value: 'Traditional Wedding', label: 'Traditional Wedding', details: '250 Photos & Traditional Video', price: 49999 },
    { value: 'Silver Package', label: 'Silver Package', details: '300 Photos, Cinematic Video & Drone Coverage', price: 75000 },
    { value: 'Gold Package', label: 'Gold Package', details: '400 Photos, Cinematic Video, Teaser & Drone Coverage', price: 105000 }
];

const BookingForm = () => {
    const { createBooking, loading, error } = useBooking();
    const { user } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState({ text: '', type: '' });
    const [minDate, setMinDate] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    const [formData, setFormData] = useState({
        serviceType: '',
        packageType: '',
        date: '',
        location: '',
        additionalRequirements: '',
        price: 0
    });

    // Set minimum date on client-side only to prevent hydration mismatch
    useEffect(() => {
        setMinDate(new Date().toISOString().split('T')[0]);
    }, []);

    // Update price when service type or package changes
    const handleServiceTypeChange = (e) => {
        const selectedService = e.target.value;
        const selectedPackage = formData.packageType;

        let price = 0;

        // If we have both service and package selected, calculate price
        if (selectedService && selectedPackage) {
            const packageInfo = packageTypes.find(pkg => pkg.value === selectedPackage);
            if (packageInfo) {
                price = packageInfo.price;
            }
        }

        setFormData({
            ...formData,
            serviceType: selectedService,
            price
        });
    };

    const handlePackageTypeChange = (e) => {
        const selectedPackage = e.target.value;
        let price = 0;

        // Get price from the selected package
        if (selectedPackage) {
            const packageInfo = packageTypes.find(pkg => pkg.value === selectedPackage);
            if (packageInfo) {
                price = packageInfo.price;
            }
        }

        setFormData({
            ...formData,
            packageType: selectedPackage,
            price
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle auth modal close
    const handleAuthModalClose = () => {
        setShowAuthModal(false);

        // Check if user is now logged in after closing the modal
        setTimeout(() => {
            // This timeout ensures the user state has been updated if login was successful
            const token = localStorage.getItem('token');
            if (token && user) {
                // User is logged in, proceed with booking
                handleBookingSubmit();
            }
        }, 500);
    };

    // Actual booking submission logic
    const handleBookingSubmit = async () => {
        // Validate form data
        if (!formData.serviceType || !formData.packageType || !formData.date || !formData.location) {
            setMessage({
                text: 'Please fill in all required fields',
                type: 'error'
            });
            return;
        }

        try {
            const booking = await createBooking(formData);
            setMessage({
                text: 'Booking created successfully! We will review your request and get back to you soon.',
                type: 'success'
            });

            // Reset form
            setFormData({
                serviceType: '',
                packageType: '',
                date: '',
                location: '',
                additionalRequirements: '',
                price: 0
            });

            // Redirect to bookings page after a brief delay
            setTimeout(() => {
                router.push('/profile/bookings');
            }, 3000);
        } catch (error) {
            setMessage({
                text: error.message || 'Failed to create booking. Please try again.',
                type: 'error'
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        // Check if user is logged in
        if (!user) {
            // Show auth modal instead of redirecting
            setShowAuthModal(true);
            return;
        }

        // User is logged in, proceed with booking
        await handleBookingSubmit();
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Book a Photography Service</h2>

                {message.text && (
                    <div className={`mb-6 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded bg-red-100 text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Service Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Type *
                            </label>
                            <select
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleServiceTypeChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a service</option>
                                {serviceTypes.map(service => (
                                    <option key={service.value} value={service.value}>
                                        {service.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Package Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Package Type *
                            </label>
                            <select
                                name="packageType"
                                value={formData.packageType}
                                onChange={handlePackageTypeChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a package</option>
                                {packageTypes.map(pkg => (
                                    <option key={pkg.value} value={pkg.value}>
                                        {pkg.label} - ₹{pkg.price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min={minDate} // Use state variable to prevent hydration mismatch
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter location"
                                required
                            />
                        </div>
                    </div>

                    {/* Additional Requirements */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Requirements
                        </label>
                        <textarea
                            name="additionalRequirements"
                            value={formData.additionalRequirements}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any special requests or additional information"
                        />
                    </div>

                    {/* Price Display */}
                    {formData.price > 0 && (
                        <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Total Price:</span>
                                <span className="text-xl font-bold text-blue-600">₹{formData.price}</span>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Book Now'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-sm text-gray-500">
                    <p>* Required fields</p>
                    <p className="mt-2">Note: Your booking will be pending until confirmed by our team. You will receive a confirmation once approved.</p>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} />
        </>
    );
};

export default BookingForm; 