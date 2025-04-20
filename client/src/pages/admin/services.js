import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useServices } from '@/contexts/ServicesContext';

export default function AdminServices() {
  const router = useRouter();
  const { serviceItems, loading, error, addServiceItem, updateServiceItem, deleteServiceItem } = useServices();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Animation options for dropdown
  const animationOptions = ['left', 'right', 'top', 'down'];
  
  // Form state
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    icon: '',
    animation: '',
    active: true,
    order: 0,
    translations: {
      hi: {
        title: '',
        description: ''
      }
    }
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form tabs
  const [activeFormTab, setActiveFormTab] = useState('main'); // 'main', 'hi'

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
      icon: '',
      animation: '',
      active: true,
      order: 0,
      translations: {
        hi: {
          title: '',
          description: ''
        }
      }
    });
    setFormOpen(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setNewItem({
      title: item.title || '',
      description: item.description || '',
      icon: item.icon || '',
      animation: item.animation || '',
      active: item.active || true,
      order: item.order || 0,
      translations: {
        hi: item.translations?.hi || { title: '', description: '' }
      }
    });
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
      icon: '',
      animation: '',
      active: true,
      order: 0,
      translations: {
        hi: {
          title: '',
          description: ''
        }
      }
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Validate form
      if (!newItem.title) {
        throw new Error('Service title is required');
      }
      if (!newItem.description) {
        throw new Error('Service description is required');
      }
      if (!newItem.icon) {
        throw new Error('Service icon is required');
      }

      let result;
      if (editingItem) {
        // Update existing item - use _id instead of id
        result = await updateServiceItem(editingItem._id, newItem);
      } else {
        // Add new item
        result = await addServiceItem(newItem);
      }

      if (result.success) {
        setSubmitSuccess(true);
        // Close form after a brief delay
        setTimeout(() => {
          closeForm();
        }, 1500);
      } else {
        setSubmitError(result.error || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error submitting service:', error);
      setSubmitError(error.message || 'An error occurred while saving the service');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const result = await deleteServiceItem(itemId);
        if (!result.success) {
          alert(result.error || 'Failed to delete the service');
        }
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('An error occurred while deleting the service');
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
        <title>Services Management | Admin Dashboard</title>
      </Head>
      
      <AdminNavbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Services Management</h1>
            <button
              onClick={openAddForm}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add New Service
            </button>
          </div>
          
          {loading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-3 text-gray-700">Loading services...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && serviceItems && serviceItems.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-gray-500">No services found. Add your first service to get started.</p>
            </div>
          )}
          
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{item.icon}</span>
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditForm(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    <div className="mt-3 text-sm text-gray-500">
                      Animation: <span className="font-medium">{item.animation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* Add/Edit Form Modal */}
      {formOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-2 z-10">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit Service' : 'Add New Service'}
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
            
            {/* Tabs for languages */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeFormTab === 'main'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveFormTab('main')}
                >
                  English (Main)
                </button>
                <button
                  className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
                    activeFormTab === 'hi'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveFormTab('hi')}
                >
                  Hindi
                </button>
              </nav>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Main content (English) */}
              {activeFormTab === 'main' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newItem.title}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={newItem.description}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="icon" className="block text-gray-700 text-sm font-bold mb-2">
                      Icon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="icon"
                      name="icon"
                      value={newItem.icon}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Emoji or icon character"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="animation" className="block text-gray-700 text-sm font-bold mb-2">
                      Animation Effect
                    </label>
                    <select
                      id="animation"
                      name="animation"
                      value={newItem.animation}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      {animationOptions.map(option => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {/* Hindi Translations */}
              {activeFormTab === 'hi' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="title-hi" className="block text-gray-700 text-sm font-bold mb-2">
                      Hindi Title
                    </label>
                    <input
                      type="text"
                      id="title-hi"
                      value={newItem.translations.hi.title}
                      onChange={(e) => {
                        setNewItem({
                          ...newItem,
                          translations: {
                            ...newItem.translations,
                            hi: {
                              ...newItem.translations.hi,
                              title: e.target.value
                            }
                          }
                        });
                      }}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description-hi" className="block text-gray-700 text-sm font-bold mb-2">
                      Hindi Description
                    </label>
                    <textarea
                      id="description-hi"
                      value={newItem.translations.hi.description}
                      onChange={(e) => {
                        setNewItem({
                          ...newItem,
                          translations: {
                            ...newItem.translations,
                            hi: {
                              ...newItem.translations.hi,
                              description: e.target.value
                            }
                          }
                        });
                      }}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                    />
                  </div>
                </>
              )}
              
              {submitError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {submitError}
                </div>
              )}
              
              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                  Service {editingItem ? 'updated' : 'added'} successfully!
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="mr-2 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
    </div>
  );
} 
 
 
 