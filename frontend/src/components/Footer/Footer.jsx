import React from "react";
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Github, Dribbble, MessageCircle } from "lucide-react";

export default function Footer() {

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    return (
        <footer className="bg-white border-t border-indigo-100">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand column */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center mb-6">
                            <span className="text-4xl font-bold">
                                <span className="text-indigo-700">Stack</span>
                                <span className="text-gray-800">IT</span>
                            </span>
                        </Link>
                        <p className="text-gray-600 mb-6">
                            Efficient IT support solutions for businesses of all sizes.
                        </p>
                    </div>

                    {/* Links columns */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200" onClick={scrollToTop}>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200" onClick={scrollToTop}>
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact-us" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200" onClick={scrollToTop}>
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4">Follow Us</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="https://github.com/13puru"
                                    className="text-gray-600 hover:text-indigo-700 transition-colors duration-200"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Github
                                </a>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200">
                                    Discord
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200">
                                    Twitter
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="#" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="my-8 border-indigo-100" />

                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="mb-6 md:mb-0">
                        <p className="text-sm text-gray-600">
                            © 2025 <span className="text-indigo-700 font-medium">Stack</span><span className="text-gray-800 font-medium">IT</span>. All Rights Reserved.
                        </p>
                    </div>

                    <div className="flex space-x-5">
                        <a href="#" className="text-gray-500 hover:text-indigo-700 transition-colors duration-200">
                            <Facebook size={18} />
                            <span className="sr-only">Facebook</span>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-indigo-700 transition-colors duration-200">
                            <Twitter size={18} />
                            <span className="sr-only">Twitter</span>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-indigo-700 transition-colors duration-200">
                            <Github size={18} />
                            <span className="sr-only">GitHub</span>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-indigo-700 transition-colors duration-200">
                            <Dribbble size={18} />
                            <span className="sr-only">Dribbble</span>
                        </a>
                        <a href="#" className="text-gray-500 hover:text-indigo-700 transition-colors duration-200">
                            <MessageCircle size={18} />
                            <span className="sr-only">Discord</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}