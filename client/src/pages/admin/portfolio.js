import { useState, useEffect, useMemo } from 'react';
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
  const [fullImageModal, setFullImageModal] = useState(null);
  
  // Filtering and sorting state
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Form state
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    src: '',
    alt: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Add state for image optimization options
  const [optimizationOptions, setOptimizationOptions] = useState({
    quality: 'high', // high, medium, low
    resize: 'none', // none, small, medium, large
  });

  // Get unique categories from portfolio items
  const categories = portfolioItems ? 
    ['all', ...new Set(portfolioItems.map(item => item.category).filter(Boolean))] : 
    ['all'];
  
  // Filter and sort portfolio items
  const filteredAndSortedItems = useMemo(() => {
    // Filter by category
    let items = [...portfolioItems];
    
    if (filterCategory !== 'all') {
      items = items.filter(item => item.category === filterCategory);
    }
    
    // Sort items
    if (sortBy === 'newest') {
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'title-asc') {
      items.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'title-desc') {
      items.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }
    
    return items;
  }, [portfolioItems, filterCategory, sortBy]);

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
      title: '',
      description: '',
      category: '',
      tags: '',
      src: '',
      alt: ''
    });
    setOptimizationOptions({
      quality: 'high',
      resize: 'none'
    });
    setPreviewImage(null);
    setUploadFile(null);
    setFormOpen(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const openEditForm = (item) => {
    // Ensure we have a consistent item structure with all necessary fields
    const editItem = {
      id: item.id || item._id,
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      src: item.src || '',
      alt: item.alt || item.title || ''
    };
    
    setEditingItem(editItem);
    setNewItem(editItem);
    
    // Set optimization options if they exist
    setOptimizationOptions({
      quality: item.quality || 'high',
      resize: item.resize || 'none'
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
      title: '',
      description: '',
      category: '',
      tags: '',
      src: '',
      alt: ''
    });
    setPreviewImage(null);
    setUploadFile(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  // Enhance the handleInputChange function to handle optimization options
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));

    // Handle optimization options separately
    if (name === 'quality' || name === 'resize') {
      setOptimizationOptions(prev => ({ ...prev, [name]: value }));
    }
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

  // Enhanced validation function
  const validateForm = () => {
    const errors = {};
    
    // Validate title
    if (!newItem.title || newItem.title.trim() === '') {
      errors.title = 'Title is required';
    } else if (newItem.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    // Validate category
    if (!newItem.category || newItem.category.trim() === '') {
      errors.category = 'Category is required';
    }
    
    // Description is optional, no validation needed
    
    // Validate image - required for new items, optional for updates
    if (!editingItem && !uploadFile) {
      errors.image = 'Please upload an image';
    }
    
    // Check image file type if uploaded
    if (uploadFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(uploadFile.type)) {
        errors.image = 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
      }
      
      // Check file size (max 5MB)
      if (uploadFile.size > 5 * 1024 * 1024) {
        errors.image = 'Image size must be less than 5MB';
      }
    }
    
    return errors;
  };

  // Enhanced submit handler with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      // Display the first error message
      setSubmitError(Object.values(formErrors)[0]);
      return;
    }
    
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        setSubmitError("Your session has expired. Please log in again.");
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
        return;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add basic form fields
      formData.append('title', newItem.title);
      formData.append('description', newItem.description || '');
      formData.append('category', newItem.category);
      
      if (newItem.tags) {
        formData.append('tags', newItem.tags);
      }
      
      // Add image optimization options
      formData.append('quality', optimizationOptions.quality);
      formData.append('resize', optimizationOptions.resize);
      
      // Add image file if provided
      if (uploadFile) {
        formData.append('image', uploadFile);
      }

      let result;
      if (editingItem) {
        // Use the appropriate ID (id or _id)
        const itemId = editingItem.id || editingItem._id;
        // Update existing item
        result = await updatePortfolioItem(itemId, formData);
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
        // Handle authentication errors
        if (result.error && (
          result.error.includes("Authentication required") || 
          result.error.includes("Authentication expired") ||
          result.error.includes("401")
        )) {
          setSubmitError("Your session has expired. Redirecting to login...");
          setTimeout(() => {
            router.push('/admin/login');
          }, 2000);
        } else {
          // More specific error message handling
          if (result.error && result.error.includes('duplicate')) {
            setSubmitError('A portfolio item with this title already exists');
          } else if (result.error && result.error.includes('size')) {
            setSubmitError('The image file is too large');
          } else if (result.error && result.error.includes('format')) {
            setSubmitError('Invalid image format');
          } else {
            setSubmitError(result.error || 'Failed to save portfolio item');
          }
        }
      }
    } catch (error) {
      console.error('Error submitting portfolio item:', error);
      
      // Handle authentication errors
      if (error.message && (
        error.message.includes("Authentication required") || 
        error.message.includes("Authentication expired") ||
        error.message.includes("401")
      )) {
        setSubmitError("Your session has expired. Redirecting to login...");
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } else {
        setSubmitError(error.message || 'An error occurred while saving the portfolio item');
      }
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

  // Open full image modal
  const openFullImage = (item) => {
    setFullImageModal(item);
  };

  // Close full image modal
  const closeFullImage = () => {
    setFullImageModal(null);
  };

  // Close modal when pressing ESC
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && fullImageModal) {
        closeFullImage();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [fullImageModal]);

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
          
          {/* Fixed height scrollable container for portfolio grid */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg font-medium text-gray-900">
                Portfolio Items ({filteredAndSortedItems.length} of {portfolioItems.length})
              </h2>
              
              <div className="flex space-x-2">
                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                
                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>
              </div>
            </div>
            
            <div className="h-[600px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedItems.map((item) => (
                  <div key={item.id || item._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
                    <div className="h-48 bg-gray-100 relative">
                      <img
                        src={item.src}
                        alt={item.alt || item.title || 'Portfolio image'}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => openFullImage(item)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openFullImage(item)}
                            className="bg-white text-blue-600 p-2 rounded-full hover:bg-gray-100"
                            title="View"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
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
                            onClick={() => handleDelete(item.id || item._id)}
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
                    <div className="p-4 flex-grow">
                      <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                      <p className="mt-1 text-gray-500 text-sm truncate">{item.description || 'No description'}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.category && (
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {item.category}
                          </span>
                        )}
                        {item.quality && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {item.quality} quality
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Add/Edit Form Modal */}
      {formOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={(e) => {
            // Close modal when clicking the overlay (outside the form)
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-1 z-10">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit Portfolio Photo' : 'Add New Portfolio Photo'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
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
                    value={newItem.src || ''}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Image Optimization Options */}
                <div className="mb-4 mt-6 border-t pt-4">
                  <h3 className="text-gray-700 text-sm font-bold mb-3">Image Optimization Options</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="quality">
                        Quality
                      </label>
                      <select
                        id="quality"
                        name="quality"
                        value={optimizationOptions.quality}
                        onChange={handleInputChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="high">High (Best quality)</option>
                        <option value="medium">Medium (Good balance)</option>
                        <option value="low">Low (Smaller file size)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {optimizationOptions.quality === 'high' && 'Best quality, larger file size'}
                        {optimizationOptions.quality === 'medium' && 'Good balance of quality and size'}
                        {optimizationOptions.quality === 'low' && 'Smaller file size, reduced quality'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="resize">
                        Resize
                      </label>
                      <select
                        id="resize"
                        name="resize"
                        value={optimizationOptions.resize}
                        onChange={handleInputChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="none">No resizing</option>
                        <option value="large">Large (1200px width)</option>
                        <option value="medium">Medium (800px width)</option>
                        <option value="small">Small (400px width)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {optimizationOptions.resize === 'none' && 'Keep original dimensions'}
                        {optimizationOptions.resize === 'large' && 'Ideal for hero images'}
                        {optimizationOptions.resize === 'medium' && 'Ideal for portfolio display'}
                        {optimizationOptions.resize === 'small' && 'Ideal for thumbnails'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newItem.title || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Photo title"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 100 characters</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newItem.description || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Photo description"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={newItem.category || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="wedding">Wedding</option>
                  <option value="portrait">Portrait</option>
                  <option value="event">Event</option>
                  <option value="landscape">Landscape</option>
                  <option value="commercial">Commercial</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={newItem.tags || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="wedding, summer, outdoor (comma separated)"
                />
              </div>
              
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                  {submitError}
                </div>
              )}
              
              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded">
                  Portfolio item saved successfully!
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Image Modal */}
      {fullImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={closeFullImage}
        >
          <div 
            className="max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 bg-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{fullImageModal.title}</h3>
              <button 
                onClick={closeFullImage}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-center bg-gray-200 h-[70vh] p-2">
              <img 
                src={fullImageModal.src} 
                alt={fullImageModal.alt || fullImageModal.title} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-4 bg-white">
              {fullImageModal.description && (
                <p className="text-gray-700 mb-2">{fullImageModal.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {fullImageModal.category && (
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    Category: {fullImageModal.category}
                  </span>
                )}
                {fullImageModal.quality && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Quality: {fullImageModal.quality}
                  </span>
                )}
                {fullImageModal.resize && fullImageModal.resize !== 'none' && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Resize: {fullImageModal.resize}
                  </span>
                )}
              </div>
              {fullImageModal.tags && fullImageModal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {fullImageModal.tags.map(tag => (
                    <span key={tag} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
 
 
 