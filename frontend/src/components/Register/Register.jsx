import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, AlertCircle, Eye, EyeOff, Check, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';


function Registration() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formStep, setFormStep] = useState(0);
    const navigate = useNavigate();
    const API_REGISTER = import.meta.env.VITE_REGISTER;

    // Password strength indicator
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: '',
        color: 'bg-gray-200'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear specific error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Update password strength whenever password changes
    useEffect(() => {
        if (formData.password) {
            const strength = calculatePasswordStrength(formData.password);
            setPasswordStrength(strength);
        } else {
            setPasswordStrength({
                score: 0,
                message: '',
                color: 'bg-gray-200'
            });
        }
    }, [formData.password]);

    const calculatePasswordStrength = (password) => {
        // Simple password strength calculation for demonstration
        let score = 0;

        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        const strengthMap = {
            0: { message: 'Too weak', color: 'bg-red-500' },
            1: { message: 'Weak', color: 'bg-red-400' },
            2: { message: 'Fair', color: 'bg-yellow-400' },
            3: { message: 'Good', color: 'bg-green-400' },
            4: { message: 'Strong', color: 'bg-green-500' }
        };

        return {
            score,
            message: strengthMap[score].message,
            color: strengthMap[score].color
        };
    };

    const validateForm = () => {
        const newErrors = {};

        // First step validation
        if (formStep === 0) {
            if (!formData.username.trim()) {
                newErrors.username = 'Username is required';
            } else if (formData.username.length < 3) {
                newErrors.username = 'Username must be at least 3 characters';
            }

            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid';
            }
        }

        // Second step validation
        if (formStep === 1) {
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = (e) => {
        e.preventDefault(); // Add this to prevent default form submission

        if (validateForm()) {
            setFormStep(1);
        }
    };

    const handleRegistration = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const { username, email, password } = formData;
            const result = await axios.post(API_REGISTER, { username, email, password });

            if (result.data.success) {
                localStorage.setItem("userEmail", email);
                navigate('/otp');
            } else {
                setErrors({ general: result.data.message || 'Registration failed' });
            }
        } catch (error) {
            console.error("Registration error:", error);
            setErrors({
                general: error.response?.data?.message || 'An error occurred during registration. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    return (
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 min-h-screen flex justify-center items-center p-4">
            <motion.div
                className="bg-white rounded-xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden shadow-2xl"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Form Side */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <motion.div variants={itemVariants}>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
                            Join StackIt
                        </h2>
                        <p className="text-md mt-3 text-gray-600">
                            Create your account and start managing IT issues efficiently.
                        </p>
                    </motion.div>

                    {errors.general && (
                        <motion.div
                            className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center rounded"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AlertCircle size={18} className="mr-2" />
                            <span className="text-sm">{errors.general}</span>
                        </motion.div>
                    )}

                    <motion.form
                        onSubmit={formStep === 0 ? handleNextStep : handleRegistration}
                        className="flex flex-col gap-5 mt-6"
                        variants={itemVariants}
                    >
                        {/* Step progress indicator */}
                        <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep >= 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                                    {formStep > 0 ? <Check size={16} /> : '1'}
                                </div>
                                <div className={`h-1 w-10 ${formStep > 0 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                            </div>
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                                    2
                                </div>
                            </div>
                        </div>

                        {formStep === 0 ? (
                            <>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        className={`p-3 pl-10 rounded-lg border ${errors.username ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'} w-full focus:outline-none focus:ring-2 transition-all`}
                                        type="text"
                                        name="username"
                                        placeholder="Choose a username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                    />
                                    {errors.username && (
                                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        className={`p-3 pl-10 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'} w-full focus:outline-none focus:ring-2 transition-all`}
                                        type="email"
                                        name="email"
                                        placeholder="example@teamkarimganj.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <motion.button
                                    className="mt-4 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 font-semibold flex justify-center items-center"
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Continue
                                    <ChevronRight size={18} className="ml-1" />
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        className={`p-3 pl-10 pr-10 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'} w-full focus:outline-none focus:ring-2 transition-all`}
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Password strength indicator */}
                                {formData.password && (
                                    <div className="mb-1">
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color}`}
                                                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 flex justify-between">
                                            <span>Password strength:</span>
                                            <span className={
                                                passwordStrength.score <= 1 ? 'text-red-500' :
                                                    passwordStrength.score === 2 ? 'text-yellow-500' :
                                                        'text-green-500'
                                            }>
                                                {passwordStrength.message}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        className={`p-3 pl-10 rounded-lg border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'} w-full focus:outline-none focus:ring-2 transition-all`}
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-2">
                                    <motion.button
                                        type="button"
                                        onClick={() => setFormStep(0)}
                                        className="flex-1 border border-indigo-200 text-indigo-600 py-3 rounded-lg hover:bg-indigo-50 transition-all duration-300 font-medium"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Back
                                    </motion.button>

                                    <motion.button
                                        className={`flex-1 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3 rounded-lg transition-all duration-300 font-semibold relative overflow-hidden flex justify-center items-center`}
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Registering...
                                            </>
                                        ) : 'Create Account'}
                                    </motion.button>
                                </div>
                            </>
                        )}
                    </motion.form>

                    <motion.div
                        className="mt-6 text-sm flex justify-center md:justify-between items-center gap-2"
                        variants={itemVariants}
                    >
                        <p className="text-gray-600">Already have an account?</p>
                        <Link
                            to='/login'
                            className="text-indigo-600 font-medium hover:underline"
                        >
                            Log in
                        </Link>
                    </motion.div>
                </div>

                {/* Image Side */}
                <motion.div
                    className="hidden md:block md:w-1/2 bg-indigo-50"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="h-full relative">
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.unsplash.com/photo-1552010099-5dc86fcfaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxmcmVzaHxlbnwwfDF8fHwxNzEyMTU4MDk0fDA&ixlib=rb-4.0.3&q=80&w=1080"
                            alt="Registration"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <h3 className="text-2xl font-bold mb-2">Get Started Today</h3>
                            <p className="opacity-90">Join thousands of IT professionals using StackIt to streamline their support workflows.</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}

export default Registration;