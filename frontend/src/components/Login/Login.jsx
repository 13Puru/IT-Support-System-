import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { publishAuthChange } from '../Header/Header'; // Update this path based on your project structure

function Login() {
    const storedEmail = localStorage.getItem('userEmail');
    const [email, setEmail] = useState(storedEmail ? storedEmail : '');  // Retrieve saved email
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('userEmail'));
    const navigate = useNavigate();
    const LOGIN_URL = import.meta.env.VITE_LOGIN;

    // Clear errors when inputs change
    useEffect(() => {
        if (error) setError('');
    }, [email, password]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            const result = await axios.post(LOGIN_URL, { email, password });
    
            console.log("Full API Response:", result.data);
    
            if (result.data.success) {
                const { token, email, username, role, user_id } = result.data; // Extract role as well
    
                if (!email || !username) {
                    console.error("Email / username is missing in API response");
                    setError("Login response is missing user details.");
                    return;
                }
    
                // Store user data in localStorage
                localStorage.setItem('userToken', token);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('username', username);
                localStorage.setItem('userRole', role); 
                localStorage.setItem('userId', user_id);
                
                // Handle remember me functionality
                if (!rememberMe) {
                    localStorage.removeItem('userEmail');
                }
                
                // Notify Header component to refresh
                publishAuthChange();
                
                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                setError(result.data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(
                err.response?.data?.message ||
                'Unable to connect to the server. Please check your internet connection.'
            );
        } finally {
            setLoading(false);
        }
    };
    
    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
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
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 min-h-screen flex justify-center items-center p-4">
            <motion.div
                className="bg-white rounded-xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden shadow-2xl"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Form Side */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <motion.div variants={itemVariants}>
                        <h2 className="font-extrabold text-3xl md:text-4xl text-gray-800 tracking-tight">
                            Welcome Back!
                        </h2>
                        <p className="text-md mt-3 text-gray-600">
                            Log in to continue exploring StackIt support.
                        </p>
                    </motion.div>

                    {error && (
                        <motion.div
                            className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center rounded"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AlertCircle size={18} className="mr-2" />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}

                    <motion.form
                        onSubmit={handleLogin}
                        className="flex flex-col gap-5 mt-6"
                        variants={itemVariants}
                    >
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                className="p-3 pl-10 rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                type="email"
                                name="email"
                                placeholder="example@teamkarimganj.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                className="p-3 pl-10 pr-10 rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <label className="flex items-center text-sm text-gray-600 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <motion.button
                            className={`${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                                } text-white py-3 rounded-lg transition-all duration-300 font-semibold relative overflow-hidden flex justify-center items-center`}
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
                                    Logging in...
                                </>
                            ) : 'Log In'}
                        </motion.button>
                    </motion.form>

                    <motion.div
                        className="mt-6 text-sm flex justify-center md:justify-between items-center gap-2"
                        variants={itemVariants}
                    >
                        <p className="text-gray-600">Don't have an account?</p>
                        <Link
                            to='/register'
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Register here
                        </Link>
                    </motion.div>
                </div>

                {/* Image Side */}
                <motion.div
                    className="hidden md:block md:w-1/2 bg-blue-50"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="h-full relative">
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.unsplash.com/photo-1552010099-5dc86fcfaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxmcmVzaHxlbnwwfDF8fHwxNzEyMTU4MDk0fDA&ixlib=rb-4.0.3&q=80&w=1080"
                            alt="Login"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <h3 className="text-2xl font-bold mb-2">Streamlined IT Support</h3>
                            <p className="opacity-90">Log in to manage your support tickets and track their progress in real-time.</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}

export default Login;