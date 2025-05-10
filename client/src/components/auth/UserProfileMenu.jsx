"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import {
    UserIcon,
    ShoppingBagIcon,
    CreditCardIcon,
    CalendarIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const UserProfileMenu = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
    };

    // Handle avatar path - support both server-uploaded and local images
    const getAvatarUrl = () => {
        if (!user?.avatar) {
            return '/assets/avtar.png'; // Default avatar
        }

        // If avatar path starts with /uploads/, it's from the server
        if (user.avatar.startsWith('/uploads/')) {
            return `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`;
        }

        // Otherwise, use the path as is (might be a full URL or local path)
        return user.avatar;
    };

    const avatarUrl = getAvatarUrl();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="flex items-center focus:outline-none"
                onClick={toggleDropdown}
            >
                <img
                    src={avatarUrl}
                    alt={t.auth.userAvatar}
                    className="h-8 w-8 rounded-full object-cover border-2 border-slate-100"
                    onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        e.target.src = '/assets/avtar.png';
                    }}
                />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                        {/* User name and email */}
                        <div className="px-4 py-2 border-b">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                        {/* Profile link */}
                        <Link href="/profile" legacyBehavior>
                            <a
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <UserIcon className="h-4 w-4 mr-2" />
                                {t.auth.personalInfo}
                            </a>
                        </Link>

                        {/* My Bookings link */}
                        <Link href="/profile/bookings" legacyBehavior>
                            <a
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                My Bookings
                            </a>
                        </Link>

                        {/* Logout button */}
                        <button
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={handleLogout}
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                            {t.auth.logout}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfileMenu; 