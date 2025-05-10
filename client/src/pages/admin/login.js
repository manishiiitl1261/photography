import { useState } from "react";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle the email submission to request OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setIsRedirecting(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    console.log("Using API URL:", apiUrl);

    try {
      console.log("Submitting admin email for OTP...");

      // Create request config with error handling
      const requestConfig = {
        url: `${apiUrl}/api/admin/login`,
        method: "post",
        data: { email },
        validateStatus: function (status) {
          // Consider all status codes valid to handle them manually
          console.log("Request status:", status);
          return true;
        },
      };

      const response = await axios(requestConfig);
      console.log("Email submission response status:", response.status);
      console.log("Email submission response data:", response.data);

      // Handle successful response
      if (response.status === 200 && response.data.success) {
        setStep("otp");
        setLoading(false);
      }
      // Handle forbidden (not an admin)
      else if (response.status === 403) {
        console.log("403 Forbidden response received");
        setError(
          "You do not have admin access privileges. This email is not registered as an admin."
        );
        setLoading(false);
      }
      // Handle other status codes
      else {
        const message =
          response.data?.message || "An error occurred during the request";
        console.log("Error response:", message);
        setError(message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Admin login error:", error);

      // This should now only catch network errors
      setError(
        "Network error: Unable to connect to the server. Please check your internet connection and try again."
      );
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setIsRedirecting(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    console.log("Using API URL for OTP verification:", apiUrl);

    try {
      console.log("Verifying OTP...");

      // Create request config with error handling
      const requestConfig = {
        url: `${apiUrl}/api/admin/verify-otp`,
        method: "post",
        data: { email, otp },
        validateStatus: function (status) {
          console.log("Request status:", status);
          // Consider all status codes valid to handle them manually
          return true;
        },
      };

      const response = await axios(requestConfig);
      console.log("OTP verification response status:", response.status);
      console.log("OTP verification response data:", response.data);

      // Handle successful response
      if (response.status === 200 && response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Show a "redirecting" message
        setIsRedirecting(true);

        // Better redirect with timeout to ensure localStorage is updated
        console.log("Authentication successful, redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 500);
      }
      // Handle forbidden (not an admin)
      else if (response.status === 403) {
        console.log("403 Forbidden response received");
        setError(
          "You do not have admin access privileges. This email is not registered as an admin."
        );
        setLoading(false);
      }
      // Handle bad request (invalid OTP)
      else if (response.status === 400) {
        console.log("400 Bad Request response received");
        setError(
          "Invalid or expired verification code. Please try again or request a new code."
        );
        setLoading(false);
      }
      // Handle other status codes
      else {
        const message =
          response.data?.message || "Verification failed. Please try again.";
        console.log("Error response:", message);
        setError(message);
        setLoading(false);
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      // This should now only catch network errors
      setError(
        "Network error: Unable to connect to the server. Please check your internet connection and try again."
      );
      setLoading(false);
    }
  };

  // Handle resending OTP
  const handleResendOTP = async () => {
    setError(null);
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    console.log("Using API URL for resending OTP:", apiUrl);

    try {
      console.log("Resending OTP...");

      // Create request config with error handling
      const requestConfig = {
        url: `${apiUrl}/api/admin/login`,
        method: "post",
        data: { email },
        validateStatus: function (status) {
          console.log("Request status:", status);
          // Consider all status codes valid to handle them manually
          return true;
        },
      };

      const response = await axios(requestConfig);
      console.log("Resend OTP response status:", response.status);
      console.log("Resend OTP response data:", response.data);

      // Handle successful response
      if (response.status === 200 && response.data.success) {
        // Show success message temporarily
        setError(null);
        setLoading(false);
        // Display a temporary success message
        const tempElement = document.createElement("div");
        tempElement.className = "text-green-600 text-sm mt-2";
        tempElement.textContent = "Verification code resent successfully!";
        const form = document.querySelector("form");
        form.appendChild(tempElement);
        setTimeout(() => {
          if (form.contains(tempElement)) {
            form.removeChild(tempElement);
          }
        }, 3000);
      }
      // Handle forbidden (not an admin)
      else if (response.status === 403) {
        console.log("403 Forbidden response received");
        setError(
          "You do not have admin access privileges. This email is not registered as an admin."
        );
        setLoading(false);
      }
      // Handle other status codes
      else {
        const message =
          response.data?.message || "Failed to resend code. Please try again.";
        console.log("Error response:", message);
        setError(message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);

      // This should now only catch network errors
      setError(
        "Network error: Unable to connect to the server. Please check your internet connection and try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Admin Login | Photography App</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Access
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === "email" ? (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Admin Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-300">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Sending..." : "Continue"}
                </button>
              </div>

              <div className="text-sm text-center">
                <Link
                  href="/"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Return to main site
                </Link>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div>
                <div className="text-center text-sm text-gray-600 mb-4">
                  A verification code has been sent to <strong>{email}</strong>
                </div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                    placeholder="Enter 6-digit code"
                    autoComplete="one-time-code"
                    maxLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-300">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isRedirecting
                    ? "Redirecting..."
                    : loading
                    ? "Verifying..."
                    : "Login"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
