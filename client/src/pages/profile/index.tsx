"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/navbar/Navbar';
import { CameraIcon } from '@heroicons/react/24/outline';

// Debounce function to prevent excessive API calls
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  
  const debouncedFunction = function(...args: Parameters<F>): ReturnType<F> | void {
    const later = () => {
      if (timeout) clearTimeout(timeout);
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    return undefined;
  };
  
  // Add cancel method to the debounced function
  (debouncedFunction as any).cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debouncedFunction as ((...args: Parameters<F>) => void) & { cancel: () => void };
};

const ProfilePage = () => {
  const { user, getUserProfile, updateProfile, uploadAvatar, getAvatarUrl } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const hasAttemptedFetch = useRef(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Memoized fetch profile function with cleanup logic
  const fetchProfile = useCallback(async () => {
    // Skip if already attempted to avoid excessive calls
    if (hasAttemptedFetch.current) return;
    
    hasAttemptedFetch.current = true;
    
    try {
      const userData = await getUserProfile();
      if (userData) {
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          avatar: userData.avatar || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [getUserProfile]);

  // Debounced version of fetchProfile to prevent multiple simultaneous calls
  const debouncedFetchProfile = useCallback(
    debounce(() => fetchProfile(), 300),
    [fetchProfile]
  );

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push('/');
      return;
    }

    // Use the debounced fetch profile
    const fetchProfileCall = debouncedFetchProfile();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      // Cancel any pending debounced calls when component unmounts
      // Using type assertion to access cancel method
      const cancelable = debouncedFetchProfile as unknown as { cancel: () => void };
      if (typeof cancelable.cancel === 'function') {
        cancelable.cancel();
      }
    };
  }, [user, debouncedFetchProfile, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle verification code input
  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  // Handle submitting verification code
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setMessage({
        text: 'Please enter the verification code',
        type: 'error'
      });
      return;
    }
    
    setVerifyingCode(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Call API to verify email change
      const response = await fetch('http://localhost:5000/api/auth/verify-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ otp: verificationCode })
      });
      
      // Always parse the response, even for error cases
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing verification response:', parseError);
        // If can't parse JSON, create a generic error object
        data = { 
          success: false, 
          message: 'Unable to process verification. Please try again.' 
        };
      }
      
      if (response.ok && data.success) {
        // Update local user data
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Reset states
        setShowVerification(false);
        setVerificationEmail('');
        setVerificationCode('');
        
        // Show success message
        setMessage({
          text: data.message || 'Email changed successfully!',
          type: 'success'
        });
        
        // Refresh user data
        getUserProfile();
      } else {
        // If the email is already in use
        if (data.message && data.message.includes('already associated with another account')) {
          // Exit verification mode and show error
          setShowVerification(false);
          setVerificationEmail('');
          setVerificationCode('');
          
          // Show more helpful error message
          setMessage({
            text: 'The email address is already being used by another account. Please try a different email address.',
            type: 'error'
          });
          
          // Refresh profile to get original email
          getUserProfile();
        } else {
          // Standard error handling
          setMessage({
            text: data.message || 'Failed to verify email',
            type: 'error'
          });
        }
      }
    } catch (error: any) {
      console.error('Error verifying email:', error);
      
      // Handle network error or unexpected error 
      setShowVerification(false);
      setVerificationCode('');
      
      setMessage({
        text: error.message || 'Failed to connect to the server. Please try again later.',
        type: 'error'
      });
      
      // Refresh profile to get original email
      getUserProfile();
    } finally {
      setVerifyingCode(false);
    }
  };

  // Request a new verification code
  const handleResendCode = async () => {
    if (!verificationEmail) return;
    
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email: verificationEmail })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({
          text: 'A new verification code has been sent to your email',
          type: 'success'
        });
      } else {
        // If the email is already in use
        if (data.message && data.message.includes('already associated with another account')) {
          // Exit verification mode and show error
          setShowVerification(false);
          setVerificationEmail('');
          setVerificationCode('');
          
          // Show more helpful error message
          setMessage({
            text: 'The email address is already being used by another account. Please try a different email address.',
            type: 'error'
          });
          
          // Refresh profile to get original email
          getUserProfile();
        } else {
          setMessage({
            text: data.message || 'Failed to resend verification code',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error resending code:', error);
      setMessage({
        text: 'Failed to connect to the server. Please try again later.',
        type: 'error'
      });
    }
  };

  // Handle successful email verification
  const handleVerificationSuccess = (data: any) => {
    setShowVerification(false);
    setVerificationEmail('');
    
    setMessage({
      text: 'Email changed successfully!',
      type: 'success'
    });
    
    // Refresh user data
    getUserProfile();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ 
        text: 'Please enter a valid email address',
        type: 'error'
      });
      return;
    }

    // Check if email is being changed
    if (user && user.email && formData.email !== user.email) {
      // Ask for confirmation before changing email
      const confirmChange = window.confirm(
        'Are you sure you want to change your email address? You will need to verify the new email address before the change takes effect.'
      );
      
      if (!confirmChange) {
        // If user cancels, revert the email back to original
        setFormData(prev => ({
          ...prev,
          email: user.email || ''
        }));
        return;
      }
    }

    try {
      // If email is unchanged or user confirmed change
      const result = await updateProfile(formData);
      
      // Check if the result is an error object
      if (result && typeof result === 'object' && 'error' in result && result.error === true) {
        // Handle formatted error object
        setMessage({ 
          text: result.message || 'This email address is already being used by another account. Please try a different email address.',
          type: 'error' 
        });
        
        // Revert the email field back to the original value
        if (user && user.email) {
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
        return;
      }
      
      // Check if result contains a requiresVerification flag (from email change)
      if (result && typeof result === 'object' && 'requiresVerification' in result) {
        // Show verification modal
        setVerificationEmail(result.email || formData.email);
        setShowVerification(true);
        setMessage({ 
          text: result.message || 'Verification code sent to your new email.',
          type: 'success' 
        });
      } else {
        // Regular success message
        setMessage({ 
          text: result?.message || t.auth.profileUpdated, 
          type: 'success' 
        });
      }
      
      // Refresh the profile data if not doing email verification
      if (!(result && typeof result === 'object' && 'requiresVerification' in result)) {
        getUserProfile();
      }
    } catch (error: any) {
      // Check for duplicate email error
      if (error.message && error.message.includes('already associated with another account')) {
        setMessage({ 
          text: 'This email address is already being used by another account. Please try a different email address.',
          type: 'error' 
        });
        
        // Revert the email field back to the original value
        if (user && user.email) {
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } else {
        setMessage({ 
          text: error.message || t.auth.updateError, 
          type: 'error' 
        });
      }
    }
  };

  const handleAvatarClick = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      setMessage({
        text: t.reviews.comment.imageTypeError,
        type: 'error'
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        text: t.reviews.comment.imageSizeError,
        type: 'error'
      });
      return;
    }

    setUploading(true);
    setMessage({ text: '', type: '' });

    try {
      await uploadAvatar(file);
      setMessage({
        text: t.auth.avatarUpdated,
        type: 'success'
      });
    } catch (error: any) {
      setMessage({
        text: error.message || t.auth.avatarUpdateError,
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
    setVerificationCode('');
    setVerificationEmail('');
    
    // Refresh profile to get original email
    getUserProfile();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </>
    );
  }

  // If showing email verification form
  if (showVerification) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Email Change Verification</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              {message.text && (
                <div 
                  className={`mb-6 p-4 rounded ${
                    message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}
              
              <p className="mb-4 text-gray-700">
                We've sent a verification code to <span className="font-semibold">{verificationEmail}</span>.
                Please enter the code below to verify your new email address.
              </p>
              
              <form onSubmit={handleVerifyEmail} className="mt-6">
                <div className="mb-4">
                  <label 
                    className="block text-gray-700 text-sm font-bold mb-2" 
                    htmlFor="verificationCode"
                  >
                    Verification Code
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="verificationCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={handleVerificationCodeChange}
                    maxLength={6}
                    required
                  />
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Resend Code
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleVerificationCancel}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Cancel Change
                  </button>
                </div>
                
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={verifyingCode}
                  >
                    {verifyingCode ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify Email'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">{t.auth.profile}</h1>

          {message.text && (
            <div 
              className={`mb-6 p-4 rounded ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}
          
          {/* Avatar upload section */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <img 
                src={getAvatarUrl(user?.avatar)} 
                alt={t.auth.userAvatar} 
                className="h-32 w-32 object-cover rounded-full border-4 border-gray-200"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.src = '/assets/avtar.png';
                }}
              />
              
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full 
                           opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                <div className="text-white flex flex-col items-center justify-center">
                  <CameraIcon className="h-8 w-8 mb-1" />
                  <span className="text-xs">{t.auth.changePhoto}</span>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/jpg"
                onChange={handleFileChange}
              />
              
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label 
                className="block text-gray-700 text-sm font-bold mb-2" 
                htmlFor="name"
              >
                {t.auth.name}
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-6">
              <label 
                className="block text-gray-700 text-sm font-bold mb-2" 
                htmlFor="email"
              >
                {t.auth.email}
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Changing your email will require verification via a code sent to the new email address.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline"
              >
                {t.auth.editProfile}
              </button>
            </div>
          </form>

          {/* Links to other user pages */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/orders" legacyBehavior>
              <a className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-center">
                {t.auth.orders}
              </a>
            </Link>
            <Link href="/wallet" legacyBehavior>
              <a className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-center">
                {t.auth.wallet}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;