import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { usePricing } from '@/contexts/PricingContext';

export default function AdminPricing() {
  const router = useRouter();
  const { 
    pricingPackages, 
    weddingPackages, 
    loading, 
    error, 
    addPricingPackage, 
    updatePricingPackage, 
    deletePricingPackage,
    addWeddingPackage,
    updateWeddingPackage 
  } = usePricing();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [activeTab, setActiveTab] = useState('standard'); // 'standard' or 'wedding'
  
  // Form state
  const [newPackage, setNewPackage] = useState({
    title: '',
    price: '',
    features: [''],
    animation: 'left',
    packageType: 'standard'
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Animation options for dropdown
  const animationOptions = ['left', 'right', 'top', 'down'];

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
    setEditingPackage(null);
    
    // Create the package data object for a new package
    const packageData = {
      title: '',
      price: '',
      features: [''],
      packageType: activeTab
    };
    
    // Only add animation for standard packages
    if (activeTab === 'standard') {
      packageData.animation = 'left';
    }
    
    setNewPackage(packageData);
    setFormOpen(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const openEditForm = (pkg) => {
    setEditingPackage(pkg);
    
    // Create the package data object for editing
    const packageData = {
      title: pkg.title || '',
      price: pkg.price || '',
      features: pkg.features || [''],
      packageType: pkg.packageType || activeTab
    };
    
    // Only add animation for standard packages
    if (pkg.packageType === 'standard' || activeTab === 'standard') {
      packageData.animation = pkg.animation || 'left';
    }
    
    setNewPackage(packageData);
    setFormOpen(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPackage(null);
    
    // Create empty package data
    const packageData = {
      title: '',
      price: '',
      features: [''],
      packageType: activeTab
    };
    
    // Only add animation for standard packages
    if (activeTab === 'standard') {
      packageData.animation = 'left';
    }
    
    setNewPackage(packageData);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPackage({
      ...newPackage,
      [name]: value
    });
  };

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...newPackage.features];
    updatedFeatures[index] = value;
    setNewPackage({
      ...newPackage,
      features: updatedFeatures
    });
  };

  const addFeatureField = () => {
    setNewPackage({
      ...newPackage,
      features: [...newPackage.features, '']
    });
  };

  const removeFeatureField = (index) => {
    if (newPackage.features.length > 1) {
      const updatedFeatures = [...newPackage.features];
      updatedFeatures.splice(index, 1);
      setNewPackage({
        ...newPackage,
        features: updatedFeatures
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Validate form
      if (!newPackage.title) {
        throw new Error('Package title is required');
      }
      if (!newPackage.price) {
        throw new Error('Package price is required');
      }
      if (newPackage.features.some(feature => !feature)) {
        throw new Error('Empty features are not allowed');
      }

      // Prepare package data
      const packageToSave = {
        ...newPackage,
        packageType: activeTab
      };

      // For wedding packages, we don't need animation
      if (activeTab === 'wedding') {
        delete packageToSave.animation;
      }

      let result;
      if (editingPackage) {
        // Update existing package
        if (activeTab === 'wedding') {
          result = await updateWeddingPackage(editingPackage._id, packageToSave);
        } else {
          result = await updatePricingPackage(editingPackage._id, packageToSave);
        }
      } else {
        // Add new package
        if (activeTab === 'wedding') {
          result = await addWeddingPackage(packageToSave);
        } else {
          result = await addPricingPackage(packageToSave);
        }
      }

      if (result.success) {
        setSubmitSuccess(true);
        // Close form after a brief delay
        setTimeout(() => {
          closeForm();
        }, 1500);
      } else {
        setSubmitError(result.error || `Failed to save ${activeTab} package`);
      }
    } catch (error) {
      console.error(`Error submitting ${activeTab} package:`, error);
      setSubmitError(error.message || `An error occurred while saving the ${activeTab} package`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this pricing package?')) {
      try {
        const result = await deletePricingPackage(packageId);
        if (!result.success) {
          alert(result.error || 'Failed to delete the pricing package');
        }
      } catch (error) {
        console.error('Error deleting pricing package:', error);
        alert('An error occurred while deleting the pricing package');
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
        <title>Pricing Management | Admin Dashboard</title>
      </Head>
      
      <AdminNavbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Pricing Management</h1>
            <button
              onClick={openAddForm}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add New {activeTab === 'wedding' ? 'Wedding' : 'Standard'} Package
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'standard'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('standard')}
              >
                Standard Packages
              </button>
              <button
                className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'wedding'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('wedding')}
              >
                Wedding Packages
              </button>
            </nav>
          </div>
          
          {loading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-3 text-gray-700">Loading pricing packages...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {/* Standard Packages */}
          {activeTab === 'standard' && !loading && pricingPackages && pricingPackages.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-gray-500">No pricing packages found. Add your first package to get started.</p>
            </div>
          )}
          
          {activeTab === 'standard' && (
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pricingPackages.map((pkg) => (
                  <div key={pkg._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{pkg.title}</h3>
                          <p className="text-2xl font-bold text-indigo-600 mt-1">{pkg.price}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditForm(pkg)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(pkg._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 h-5 w-5 text-indigo-500">•</span>
                            <span className="ml-2 text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 text-sm text-gray-500">
                        Animation: <span className="font-medium">{pkg.animation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Wedding Packages */}
          {activeTab === 'wedding' && !loading && weddingPackages && weddingPackages.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-gray-500">No wedding packages found. Add your first package to get started.</p>
            </div>
          )}
          
          {activeTab === 'wedding' && (
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weddingPackages.map((pkg) => (
                  <div key={pkg._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{pkg.title}</h3>
                          <p className="text-2xl font-bold text-indigo-600 mt-1">{pkg.price}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditForm(pkg)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(pkg._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 h-5 w-5 text-indigo-500">•</span>
                            <span className="ml-2 text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                {editingPackage 
                  ? `Edit ${activeTab === 'wedding' ? 'Wedding' : 'Standard'} Package` 
                  : `Add New ${activeTab === 'wedding' ? 'Wedding' : 'Standard'} Package`}
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Package Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newPackage.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Wedding Shoot"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Price *
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={newPackage.price}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., ₹49999"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Features *
                </label>
                {newPackage.features.map((feature, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="e.g., 8 Hours Session"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeFeatureField(index)}
                      className="ml-2 bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors"
                      title="Remove feature"
                      disabled={newPackage.features.length <= 1}
                    >
                      <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeatureField}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center mt-2"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Feature
                </button>
              </div>
              
              {/* Only show animation field for standard packages */}
              {activeTab === 'standard' && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="animation">
                    Animation Type
                  </label>
                  <select
                    id="animation"
                    name="animation"
                    value={newPackage.animation}
                    onChange={handleInputChange}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    {animationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {submitError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                  <p>{submitError}</p>
                </div>
              )}
              
              {submitSuccess && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                  <p>{activeTab === 'wedding' ? 'Wedding' : 'Standard'} package saved successfully!</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 sticky bottom-0 bg-white pb-2 pt-4 mt-4 border-t">
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
 
 
 