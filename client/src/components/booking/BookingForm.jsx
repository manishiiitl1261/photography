"use client";

import { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';

const BookingForm = () => {
    const { createBooking, loading, error } = useBooking();
    const { user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [message, setMessage] = useState({ text: '', type: '' });
    const [minDate, setMinDate] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [packageTypes, setPackageTypes] = useState([]);

    const [formData, setFormData] = useState({
        serviceType: '',
        packageType: '',
        date: '',
        location: '',
        additionalRequirements: '',
        price: 0
    });

    // Set minimum date and load service/package types on initial load
    useEffect(() => {
        // Set minimum date only on client side to prevent hydration error
        setMinDate(new Date().toISOString().split('T')[0]);

        // Load translations once they're available
        if (t && Object.keys(t).length > 0) {
            // Load service types with translations
            setServiceTypes([
                { value: 'Wedding Shoot', label: t.booking.services.wedding.label, price: 500 },
                { value: 'Birthday Celebration', label: t.booking.services.birthday.label, price: 300 },
                { value: 'Event Shoot', label: t.booking.services.event.label, price: 400 },
                { value: 'Song Video Shoot', label: t.booking.services.song.label, price: 700 },
                { value: 'Corporate Event', label: t.booking.services.corporate.label, price: 600 },
                { value: 'Portrait Session', label: t.booking.services.portrait.label, price: 200 }
            ]);

            // Load package types with translations
            setPackageTypes([
                {
                    value: 'Traditional Wedding',
                    label: t.booking.packages.traditional.label,
                    details: t.booking.packages.traditional.details,
                    price: 49999
                },
                {
                    value: 'Silver Package',
                    label: t.booking.packages.silver.label,
                    details: t.booking.packages.silver.details,
                    price: 75000
                },
                {
                    value: 'Gold Package',
                    label: t.booking.packages.gold.label,
                    details: t.booking.packages.gold.details,
                    price: 105000
                }
            ]);
        }
    }, [t]);

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
                text: t.booking.requiredFields,
                type: 'error'
            });
            return;
        }

        try {
            const booking = await createBooking(formData);
            setMessage({
                text: t.booking.success,
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
                text: error.message || t.booking.failure,
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t.booking.title}</h2>

                {message.text && (
                    <div className={`mb-6 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                                {t.booking.serviceType} <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleServiceTypeChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">{t.booking.selectService}</option>
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
                                {t.booking.packageType} <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="packageType"
                                value={formData.packageType}
                                onChange={handlePackageTypeChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">{t.booking.selectPackage}</option>
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
                                {t.booking.eventDate} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min={minDate || ""}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.booking.eventLocation} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Additional Requirements */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.booking.additionalRequirements}
                        </label>
                        <textarea
                            name="additionalRequirements"
                            value={formData.additionalRequirements}
                            onChange={handleChange}
                            rows={4}
                            placeholder={t.booking.additionalInfo}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    {/* Price Display - only render client-side */}
                    {formData.price > 0 && (
                        <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.booking.price}</h3>
                            <p className="text-2xl font-bold text-blue-600">₹{formData.price.toLocaleString()}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? '...' : t.booking.submitButton}
                        </button>
                    </div>
                </form>
            </div>

            {/* Auth Modal */}
            {showAuthModal && <AuthModal onClose={handleAuthModalClose} />}
        </>
    );
};

export default BookingForm; 