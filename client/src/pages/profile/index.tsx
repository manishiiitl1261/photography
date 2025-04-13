"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/navbar/Navbar';
import { CameraIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push('/');
      return;
    }

    // Fetch user profile
    const fetchProfile = async () => {
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
    };

    fetchProfile();
  }, [user, getUserProfile, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      await updateProfile(formData);
      setMessage({ 
        text: t.auth.profileUpdated, 
        type: 'success' 
      });
    } catch (error) {
      setMessage({ 
        text: error.message || t.auth.updateError, 
        type: 'error' 
      });
    }
  };

  const handleAvatarClick = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
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
    } catch (error) {
      setMessage({
        text: error.message || t.auth.avatarUpdateError,
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
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