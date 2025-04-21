import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminNavbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  useEffect(() => {
    // Handle clicks outside of dropdown to close it
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    // Add event listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      current: router.pathname === "/admin/dashboard",
    },
    {
      name: "Portfolio",
      href: "/admin/portfolio",
      current: router.pathname === "/admin/portfolio",
    },
    {
      name: "Services",
      href: "/admin/services",
      current: router.pathname === "/admin/services",
    },
    {
      name: "Pricing",
      href: "/admin/pricing",
      current: router.pathname === "/admin/pricing",
    },
    {
      name: "Reviews",
      href: "/admin/reviews",
      current: router.pathname === "/admin/reviews",
    },
    {
      name: "Users",
      href: "/admin/users",
      current: router.pathname === "/admin/users",
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      current: router.pathname === "/admin/bookings",
    },
    {
      name: "Members",
      href: "/admin/members",
      current: router.pathname === "/admin/members",
    },
  ];

  return (
    <nav className="bg-indigo-600 w-full sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin/dashboard" className="flex items-center">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="ml-2 text-white font-bold">Admin Panel</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center justify-between flex-1">
              <div className="ml-6 flex space-x-3 lg:space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-2 py-2 rounded-md text-sm font-medium ${
                      item.current
                        ? "bg-indigo-700 text-white"
                        : "text-white hover:bg-indigo-500 hover:bg-opacity-75"
                    }`}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Profile dropdown */}
              <div className="ml-3 relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-indigo-600"
                  id="user-menu-button"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center text-white">
                    {user && user.email
                      ? user.email.charAt(0).toUpperCase()
                      : "A"}
                  </div>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-56 max-w-[90vw] rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex="-1"
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b flex">
                      <span className="truncate w-full">
                        {user ? user.email : "Admin"}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden bg-indigo-700 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* <h3 className="text-white text-xs uppercase tracking-wider font-semibold px-3 mb-1">
              Navigation
            </h3> */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  item.current
                    ? "bg-indigo-800 text-white"
                    : "text-white hover:bg-indigo-600"
                }`}
                aria-current={item.current ? "page" : undefined}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-indigo-800 mt-2">
            <h3 className="text-white text-xs uppercase tracking-wider font-semibold px-5 mb-1">
              Your Account
            </h3>
            <div className="flex items-center px-5 py-3 bg-indigo-800 rounded-md mx-2">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  {user && user.email
                    ? user.email.charAt(0).toUpperCase()
                    : "A"}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white truncate max-w-[200px]">
                  {user ? user.email : "Admin"}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1 pb-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
