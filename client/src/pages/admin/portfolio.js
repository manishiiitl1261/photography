import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { usePortfolio } from '@/contexts/PortfolioContext';

export default function AdminPortfolio() {
  const router = useRouter();
  const { portfolioItems, loading, error, addPortfolioItem, updatePortfolioItem, deletePortfolioItem } = usePortfolio();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form state
  const [newItem, setNewItem] = useState({
    src: '',
    alt: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login page');
          router.push('/admin/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Validate admin status
        const response = await fetch(
          `${apiUrl}/api/admin/validate`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        const data = await response.json();

        if (!data.success || !data.isAdmin) {
          console.log('Not an admin, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/admin/login');
        } else {
          setIsAuthenticated(true);
          setAdminChecking(false);
        }
      } catch (error) {
        console.error('Admin validation error:', error);
        router.push('/admin/login');
      }
    };

    checkAdminAuth();
  }, [router]);

  const openAddForm = () => {
    setEditingItem(null);
    setNewItem({
      src: '',
      alt: ''
    });
    setPreviewImage(null);
    setUploadFile(null);
    setFormOpen(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setNewItem({
      src: item.src,
      alt: item.alt || ''
    });
    setPreviewImage(item.src);
    setUploadFile(null);
    setFormOpen(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setNewItem({
      src: '',
      alt: ''
    });
    setPreviewImage(null);
    setUploadFile(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setUploadFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const formData = new FormData();
      
      // If we have a new file, add it to formData
      if (uploadFile) {
        formData.append('image', uploadFile);
      } else if (!editingItem) {
        // For new items without a file upload, require a URL
        if (!newItem.src) {
          throw new Error('Please provide an image file or URL');
        }
        formData.append('src', newItem.src);
      }
      
      formData.append('alt', newItem.alt || '');

      let result;
      if (editingItem) {
        // Update existing item
        result = await updatePortfolioItem(editingItem.id, formData);
      } else {
        // Add new item
        result = await addPortfolioItem(formData);
      }

      if (result.success) {
        setSubmitSuccess(true);
        // Close form after a brief delay
        setTimeout(() => {
          closeForm();
        }, 1500);
      } else {
        setSubmitError(result.error || 'Failed to save portfolio item');
      }
    } catch (error) {
      console.error('Error submitting portfolio item:', error);
      setSubmitError(error.message || 'An error occurred while saving the portfolio item');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        const result = await deletePortfolioItem(itemId);
        if (!result.success) {
          alert(result.error || 'Failed to delete the portfolio item');
        }
      } catch (error) {
        console.error('Error deleting portfolio item:', error);
        alert('An error occurred while deleting the portfolio item');
      }
    }
  };

  if (adminChecking) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-700">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Portfolio Management | Admin Dashboard</title>
      </Head>
      
      <AdminNavbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Portfolio Management</h1>
            <button
              onClick={openAddForm}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add New Photo
            </button>
          </div>
          
          {loading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-3 text-gray-700">Loading portfolio items...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && portfolioItems && portfolioItems.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-gray-500">No portfolio items found. Add your first photo to get started.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-56 bg-gray-200 relative">
                  <img
                    src={item.src}
                    alt={item.alt || 'Portfolio image'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditForm(item)}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                        title="Edit"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100"
                        title="Delete"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-500 text-sm truncate">{item.alt || 'No description'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Add/Edit Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit Portfolio Photo' : 'Add New Portfolio Photo'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Photo
                </label>
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 inline-block"
                  >
                    Choose File
                  </label>
                  <span className="ml-2 text-sm text-gray-500">
                    {uploadFile ? uploadFile.name : 'No file chosen'}
                  </span>
                </div>
                
                {previewImage && (
                  <div className="mt-2 mb-4">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-40 object-contain"
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="src">
                    Image URL (only needed if not uploading a file)
                  </label>
                  <input
                    type="text"
                    id="src"
                    name="src"
                    value={newItem.src}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="alt">
                  Alt Text / Description
                </label>
                <input
                  type="text"
                  id="alt"
                  name="alt"
                  value={newItem.alt}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Describe the image"
                />
              </div>
              
              {submitError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                  <p>{submitError}</p>
                </div>
              )}
              
              {submitSuccess && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                  <p>Portfolio item saved successfully!</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    submitLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
 
 
 