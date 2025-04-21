import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function AdminMembers() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    animation: "left",
    isActive: true,
    order: 0,
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login page");
          router.push("/admin/login");
          return;
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // Validate admin status
        const response = await axios.get(`${apiUrl}/api/admin/validate`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data.success || !response.data.isAdmin) {
          console.log("Admin validation failed, clearing auth data");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          router.push("/admin/login");
        } else {
          console.log("Admin validation successful");
          fetchMembers();
        }
      } catch (error) {
        console.error("Admin validation error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push("/admin/login");
      }
    };

    checkAdminAuth();
  }, [router]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setFormOpen(false);
      }
    }

    // Add the event listener
    if (formOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [formOpen]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await axios.get(`${apiUrl}/api/team-members/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setMembers(response.data.members);
      } else {
        setError("Failed to fetch team members");
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setError("Error fetching team members");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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

  const validateForm = () => {
    const errors = {};

    // Validate name
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Name is required";
    }

    // Validate role
    if (!formData.role || formData.role.trim() === "") {
      errors.role = "Role is required";
    }

    // Validate image - required for new members, optional for updates
    if (!isEditing && !uploadFile) {
      errors.image = "Please upload an image";
    }

    // Check image file type if uploaded
    if (uploadFile) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(uploadFile.type)) {
        errors.image =
          "Please select a valid image file (JPEG, PNG, GIF, WebP)";
      }

      // Check file size (max 5MB)
      if (uploadFile.size > 5 * 1024 * 1024) {
        errors.image = "Image size must be less than 5MB";
      }
    }

    return errors;
  };

  // Add this new function for testing file uploads only
  const testCloudinaryUpload = async () => {
    if (!uploadFile) {
      setError("Please select a file first");
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Create a simple FormData with just the image
      const testFormData = new FormData();
      testFormData.append("image", uploadFile);

      console.log("Testing Cloudinary upload...");
      console.log(
        "Image file size:",
        uploadFile
          ? `${(uploadFile.size / 1024 / 1024).toFixed(2)}MB`
          : "No file"
      );

      // Call the test endpoint
      const response = await axios.post(
        `${apiUrl}/api/team-members/test-upload`,
        testFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // Increase timeout to 60 seconds for testing
        }
      );

      console.log("Test upload successful:", response.data);
      setError(null);
      alert(
        "File upload test successful! Your Cloudinary configuration is working."
      );
    } catch (error) {
      console.error("Test upload failed:", error);

      // More detailed error handling
      if (error.response) {
        setError(
          `Test failed with status ${error.response.status}: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        setError(
          "No response received during test. Please check your network connection and ensure the server is running."
        );
      } else {
        setError(`Test error: ${error.message}`);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      // Display the first error message
      setError(Object.values(formErrors)[0]);
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("animation", formData.animation);
      formDataToSend.append("isActive", formData.isActive);
      formDataToSend.append("order", formData.order);

      // Add image file if provided
      if (uploadFile) {
        formDataToSend.append("image", uploadFile);
      }

      console.log(
        "Sending request to:",
        `${apiUrl}/api/team-members${isEditing ? `/${currentId}` : ""}`
      );
      console.log("Form data keys:", [...formDataToSend.keys()]);
      console.log(
        "Image file size:",
        uploadFile
          ? `${(uploadFile.size / 1024 / 1024).toFixed(2)}MB`
          : "No file"
      );

      let response;
      if (isEditing) {
        // Update existing member
        response = await axios.put(
          `${apiUrl}/api/team-members/${currentId}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000, // Increase timeout to 30 seconds
          }
        );
      } else {
        // Create new member
        response = await axios.post(
          `${apiUrl}/api/team-members`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000, // Increase timeout to 30 seconds
          }
        );
      }

      console.log("Server response:", response.data);

      // Reset form and fetch updated data
      resetForm();
      setFormOpen(false);
      fetchMembers();
    } catch (error) {
      console.error("Error saving team member:", error);

      // More detailed error handling
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error("Server error data:", error.response.data);
        console.error("Server error status:", error.response.status);
        setError(
          `Server error: ${
            error.response.data.message ||
            error.response.statusText ||
            "Unknown error"
          }`
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setError(
          "No response from server. Please check your network connection and ensure the server is running."
        );
      } else {
        // Something happened in setting up the request
        setError(`Error: ${error.message}`);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (member) => {
    setIsEditing(true);
    setCurrentId(member._id);
    setFormData({
      name: member.name,
      role: member.role,
      animation: member.animation,
      isActive: member.isActive,
      order: member.order || 0,
    });
    setPreviewImage(member.image);
    setUploadFile(null);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      await axios.delete(`${apiUrl}/api/team-members/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
      setError("Error deleting team member");
    }
  };

  const openAddForm = () => {
    resetForm();
    setIsEditing(false);
    setFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      animation: "left",
      isActive: true,
      order: 0,
    });
    setIsEditing(false);
    setCurrentId(null);
    setPreviewImage(null);
    setUploadFile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Manage Team Members | Photography App</title>
      </Head>

      <AdminNavbar />

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Team Members
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage team members displayed on the About Us page.
              </p>
            </div>
            <button
              onClick={openAddForm}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Team Member
            </button>
          </div>

          {error && (
            <div
              className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {/* Member Form Modal */}
          {formOpen && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                  <div
                    className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4"
                    ref={modalRef}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {isEditing ? "Edit Team Member" : "Add Team Member"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setFormOpen(false)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Role
                          </label>
                          <input
                            type="text"
                            name="role"
                            id="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="image"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Profile Photo
                          </label>
                          <div className="mt-1 flex items-center">
                            <input
                              type="file"
                              id="image"
                              name="image"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="image"
                              className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Choose File
                            </label>
                            <span className="ml-3 text-sm text-gray-500">
                              {uploadFile ? uploadFile.name : "No file chosen"}
                            </span>
                          </div>
                          {previewImage && (
                            <div className="mt-2">
                              <img
                                src={previewImage}
                                alt="Preview"
                                className="h-24 w-24 object-cover rounded-full"
                              />
                            </div>
                          )}
                          {isEditing && !uploadFile && (
                            <p className="mt-2 text-sm text-gray-500">
                              Leave empty to keep the current image
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="animation"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Animation
                          </label>
                          <select
                            name="animation"
                            id="animation"
                            value={formData.animation}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top">Top</option>
                            <option value="down">Down</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="order"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Display Order
                          </label>
                          <input
                            type="number"
                            name="order"
                            id="order"
                            value={formData.order}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div className="flex items-center h-full pt-5">
                          <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="isActive"
                            className="ml-2 block text-sm text-gray-900"
                          >
                            Active (visible on website)
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        {diagnosticMode && uploadFile && (
                          <button
                            type="button"
                            onClick={testCloudinaryUpload}
                            disabled={submitLoading}
                            className="inline-flex items-center px-4 py-2 border border-orange-500 shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Test Upload Only
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setFormOpen(false)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={submitLoading}
                          className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            submitLoading ? "opacity-75 cursor-not-allowed" : ""
                          }`}
                        >
                          {submitLoading && (
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          )}
                          {isEditing
                            ? submitLoading
                              ? "Updating..."
                              : "Update Team Member"
                            : submitLoading
                            ? "Adding..."
                            : "Add Team Member"}
                        </button>
                      </div>
                    </form>

                    {/* Diagnostic Mode Toggle */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="diagnosticMode"
                          checked={diagnosticMode}
                          onChange={() => setDiagnosticMode(!diagnosticMode)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="diagnosticMode"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Enable diagnostic mode
                        </label>
                      </div>
                      {diagnosticMode && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p>
                            Diagnostic mode enables direct testing of Cloudinary
                            uploads to help troubleshoot issues.
                          </p>
                          <p>1. Select an image using the file upload field</p>
                          <p>
                            2. Click "Test Upload Only" to test just the image
                            upload part
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Team Members List
            </h3>

            <div className="mt-4 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Order
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Member
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Role
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Animation
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {members.length === 0 ? (
                            <tr>
                              <td
                                colSpan="6"
                                className="px-6 py-4 text-center text-sm text-gray-500"
                              >
                                No team members found. Add some using the "Add
                                Team Member" button.
                              </td>
                            </tr>
                          ) : (
                            members.map((member) => (
                              <tr key={member._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {member.order || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <img
                                        className="h-10 w-10 rounded-full object-cover"
                                        src={member.image}
                                        alt={member.name}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src =
                                            "/assest/placeholder.jpg";
                                        }}
                                      />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {member.name}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {member.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      member.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {member.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {member.animation}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleEdit(member)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(member._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
