import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle } from "lucide-react";

// Custom event for auth status changes
const AUTH_STATUS_CHANGE = "authStatusChange";

// Helper function to publish auth status changes
export const publishAuthChange = () => {
    const event = new CustomEvent(AUTH_STATUS_CHANGE);
    document.dispatchEvent(event);
};

export default function Header({ setActiveView }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();

    // Check authentication status function
    const checkAuthStatus = () => {
        const token = localStorage.getItem('userToken');
        setIsLoggedIn(!!token);
    };

    const name = localStorage.getItem("username")

    // Main effect for auth status
    useEffect(() => {
        // Initial check
        checkAuthStatus();

        // Set up event listeners for auth changes
        document.addEventListener(AUTH_STATUS_CHANGE, checkAuthStatus);
        window.addEventListener('storage', checkAuthStatus);

        return () => {
            document.removeEventListener(AUTH_STATUS_CHANGE, checkAuthStatus);
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []);

    // Extra effect to check auth on route changes
    useEffect(() => {
        checkAuthStatus();
    }, [location]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className="sticky z-50 top-0 bg-white shadow-md">
            <nav className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex flex-wrap justify-between items-center">
                    <Link to="/" className="flex items-center">
                        <span className="text-3xl font-bold">
                            <span className="text-indigo-700">Stack</span>
                            <span className="text-gray-800">IT</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <NavLink
                            to='/'
                            className={({ isActive }) =>
                                `font-medium transition-colors duration-200 ${isActive ? "text-indigo-700" : "text-gray-600"} hover:text-indigo-600`
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to='/contact-us'
                            className={({ isActive }) =>
                                `font-medium transition-colors duration-200 ${isActive ? "text-indigo-700" : "text-gray-600"} hover:text-indigo-600`
                            }
                        >
                            Contact Us
                        </NavLink>
                        <NavLink
                            to='/about'
                            className={({ isActive }) =>
                                `font-medium transition-colors duration-200 ${isActive ? "text-indigo-700" : "text-gray-600"} hover:text-indigo-600`
                            }
                        >
                            About
                        </NavLink>
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                <button
                                    className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-800 font-medium cursor-pointer"
                                >
                                    <UserCircle size={24} />
                                    <span>Welcome {name}</span>
                                </button>

                                <Link
                                    to="/dashboard"
                                    className="text-indigo-700 hover:text-indigo-800 border border-indigo-200 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors duration-200"
                                >
                                    View Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-indigo-700 hover:text-indigo-800 border border-indigo-200 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors duration-200"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md transition-colors duration-200"
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? (
                            <X size={24} className="text-indigo-700" />
                        ) : (
                            <Menu size={24} className="text-indigo-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 mt-4 border-t border-gray-100">
                        <div className="flex flex-col space-y-4">
                            <NavLink
                                to='/'
                                className={({ isActive }) =>
                                    `font-medium transition-colors duration-200 py-2 ${isActive ? "text-indigo-700" : "text-gray-600"} hover:text-indigo-600`
                                }
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to='/contact-us'
                                className={({ isActive }) =>
                                    `font-medium transition-colors duration-200 py-2 ${isActive ? "text-indigo-700" : "text-gray-600"} hover:text-indigo-600`
                                }
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contact Us
                            </NavLink>

                            <div className="flex flex-col space-y-3 pt-4">
                                {isLoggedIn ? (
                                    <button
                                        className="flex items-center justify-center space-x-2 text-indigo-700 hover:text-indigo-800 border border-indigo-200 px-4 py-2 rounded-md font-medium cursor-pointer"
                                    >
                                        <UserCircle size={20} />
                                        <span>Welcome {name}</span>
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="text-indigo-700 hover:text-indigo-800 border border-indigo-200 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors duration-200 text-center"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 text-center"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}