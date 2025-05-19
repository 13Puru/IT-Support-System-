import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
    const [formStatus, setFormStatus] = useState('idle'); // idle, sending, success, error
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('sending');
        
        // Simulate form submission
        setTimeout(() => {
            setFormStatus('success');
            // Reset form after 3 seconds
            setTimeout(() => setFormStatus('idle'), 3000);
        }, 1500);
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };
    
    const buttonVariants = {
        idle: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };
    
    const inputVariants = {
        focus: { 
            boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.3)",
            borderColor: "#6366F1" 
        }
    };

    return (
        <motion.div 
            className="bg-white py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-6xl mx-auto px-6">
                <motion.h1 
                    className="text-3xl font-bold text-gray-800 mb-8"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                >
                    <span className="text-indigo-700">Contact</span> Us
                </motion.h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <motion.div 
                        className="bg-gray-50 p-6 rounded-lg border border-indigo-100"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Get in touch</h2>
                        <p className="text-gray-600 mb-8">
                            Fill in the form to start a conversation with our expert team.
                        </p>

                        <motion.div 
                            className="space-y-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div className="flex items-start" variants={itemVariants}>
                                <motion.div 
                                    className="flex-shrink-0 bg-indigo-100 p-2 rounded-md"
                                    whileHover={{ scale: 1.1, backgroundColor: "#c7d2fe" }}
                                >
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        viewBox="0 0 24 24"
                                        className="w-6 h-6 text-indigo-700"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </motion.div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase">Address</h3>
                                    <p className="text-gray-600 mt-1">StackIT Inc, 123 Main Street, Tech Valley, 12345</p>
                                </div>
                            </motion.div>

                            <motion.div className="flex items-start" variants={itemVariants}>
                                <motion.div 
                                    className="flex-shrink-0 bg-indigo-100 p-2 rounded-md"
                                    whileHover={{ scale: 1.1, backgroundColor: "#c7d2fe" }}
                                >
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        viewBox="0 0 24 24"
                                        className="w-6 h-6 text-indigo-700"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                </motion.div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase">Phone</h3>
                                    <p className="text-gray-600 mt-1">+44 1234567890</p>
                                </div>
                            </motion.div>

                            <motion.div className="flex items-start" variants={itemVariants}>
                                <motion.div 
                                    className="flex-shrink-0 bg-indigo-100 p-2 rounded-md"
                                    whileHover={{ scale: 1.1, backgroundColor: "#c7d2fe" }}
                                >
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        viewBox="0 0 24 24"
                                        className="w-6 h-6 text-indigo-700"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </motion.div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase">Email</h3>
                                    <p className="text-gray-600 mt-1">info@stackit.com</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div 
                        className="bg-white p-6 rounded-lg border border-indigo-100"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <motion.div variants={itemVariants}>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-2">
                                    Full Name
                                </label>
                                <motion.input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none transition-colors duration-200"
                                    whileFocus="focus"
                                    variants={inputVariants}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">
                                    Email Address
                                </label>
                                <motion.input
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none transition-colors duration-200"
                                    whileFocus="focus"
                                    variants={inputVariants}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="phone" className="text-sm font-medium text-gray-700 block mb-2">
                                    Phone Number
                                </label>
                                <motion.input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none transition-colors duration-200"
                                    whileFocus="focus"
                                    variants={inputVariants}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="message" className="text-sm font-medium text-gray-700 block mb-2">
                                    Message
                                </label>
                                <motion.textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    placeholder="How can we help you?"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none transition-colors duration-200"
                                    whileFocus="focus"
                                    variants={inputVariants}
                                ></motion.textarea>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <motion.button
                                    type="submit"
                                    className="w-full md:w-auto px-6 py-3 bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
                                    variants={buttonVariants}
                                    initial="idle"
                                    whileHover="hover"
                                    whileTap="tap"
                                    disabled={formStatus === 'sending' || formStatus === 'success'}
                                >
                                    {formStatus === 'idle' && "Send Message"}
                                    {formStatus === 'sending' && (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </div>
                                    )}
                                    {formStatus === 'success' && (
                                        <div className="flex items-center justify-center">
                                            <svg className="-ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Message Sent!
                                        </div>
                                    )}
                                </motion.button>
                            </motion.div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}