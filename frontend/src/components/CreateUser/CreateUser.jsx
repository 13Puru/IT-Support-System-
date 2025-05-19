import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Key, Briefcase, Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../Card/Card";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast from react-toastify

const CreateUser = ({setActiveView}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [roleOfUser, setUserRole] = useState(localStorage.getItem("userRole"));
  const API_CREATE_USER = import.meta.env.VITE_CREATE_USER;

  const departments = [
    "IT",
    "HR",
    "Finance",
    "Marketing",
    "Sales",
    "Support",
    "Operations",
    "Customer Service",
    "Research & Development",
    "Legal"
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { opacity: 1, y: 0, height: "auto", transition: { type: "spring", stiffness: 300 } }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.username.trim()) {
      tempErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!formData.role) {
      tempErrors.role = "Please select a user role";
      isValid = false;
    }

    if (!formData.department) {
      tempErrors.department = "Please select a department";
      isValid = false;
    }
    
    setErrors(tempErrors);

    // Show toast for validation errors
    if (!isValid) {
      toast.error("Please correct the errors in the form");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem("userToken");
        
        if (!token) {
          throw new Error("Authentication token not found");
        }
        
        // Prepare data for API
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          role: formData.role
        };
        
        // Make API call
        const response = await axios.post(
          API_CREATE_USER, 
          userData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Handle success
        if (response.data.success) {
          // Success toast notification
          toast.success("User created successfully! Login credentials sent via email.");
          setErrors({});
          
          // Redirect after a short delay
          setTimeout(() => {
            setActiveView("ViewUsers");
          }, 500);
        } else {
          throw new Error(response.data.message || "Failed to create user");
        }
        
      } catch (error) {
        console.error("Error creating user:", error);
        
        // Handle specific error messages from the API
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || "Failed to create user. Please try again.";
          toast.error(errorMessage);
          setErrors({
            submit: errorMessage
          });
        } else {
          const errorMessage = error.message || "Failed to create user. Please try again.";
          toast.error(errorMessage);
          setErrors({
            submit: errorMessage
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getUserInfo = () => {
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const username = localStorage.getItem("username") || "";
      const role = localStorage.getItem("userRole") || "";
      return { email: userEmail, username, role };
    } catch (error) {
      console.error("Error retrieving user info:", error);
      return { email: "", username: "", role: "" };
    }
  };

  const { email, username, role } = getUserInfo();

  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <motion.button 
          onClick={() => {
            toast.info("Returning to dashboard");
            setActiveView("dashboard");
          }}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </motion.button>
        <motion.h1 
          className="text-2xl font-bold text-gray-800"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create New User
        </motion.h1>
      </motion.div>
      
      <motion.div 
        className="mb-4 ml-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      > 
        <b>{username}</b> with email: <b>{email}</b> is creating a new user for the system 
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 70 }}
      >
        <Card>
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {errors.submit && (
                <motion.div 
                  className="bg-red-50 p-4 rounded-md flex items-start"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <AlertTriangle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-red-700 text-sm">{errors.submit}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {/* Username Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="johndoe"
                  />
                </div>
                <AnimatePresence>
                  {errors.username && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {errors.username}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Department Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase size={16} className="text-gray-400" />
                  </div>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.department ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <AnimatePresence>
                  {errors.department && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {errors.department}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={16} className="text-gray-400" />
                  </div>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="••••••••"
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {passwordVisible ? 
                      <EyeOff size={16} className="text-gray-400" /> : 
                      <Eye size={16} className="text-gray-400" />
                    }
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={16} className="text-gray-400" />
                  </div>
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="••••••••"
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {confirmPasswordVisible ? 
                      <EyeOff size={16} className="text-gray-400" /> : 
                      <Eye size={16} className="text-gray-400" />
                    }
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600"
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Role Selection */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>
              <div className="flex flex-wrap gap-4">
                {roleOfUser === "admin" && (
                  <>
                    <motion.label 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        formData.role === 'admin' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={formData.role === 'admin'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Shield size={20} className="text-indigo-600 mr-2" />
                      <div>
                        <span className="block font-medium text-gray-900">Administrator</span>
                        <span className="block text-xs text-gray-500">Full system access</span>
                      </div>
                    </motion.label>
                    
                    <motion.label 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        formData.role === 'agent' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="agent"
                        checked={formData.role === 'agent'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <User size={20} className="text-blue-600 mr-2" />
                      <div>
                        <span className="block font-medium text-gray-900">Support Agent</span>
                        <span className="block text-xs text-gray-500">Can manage tickets</span>
                      </div>
                    </motion.label>
                  </>
                )}
                
                <motion.label 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    formData.role === 'user' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <User size={20} className="text-gray-600 mr-2" />
                  <div>
                    <span className="block font-medium text-gray-900">Standard User</span>
                    <span className="block text-xs text-gray-500">Can create and view tickets</span>
                  </div>
                </motion.label>
              </div>
              <AnimatePresence>
                {errors.role && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {errors.role}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="flex justify-end space-x-3 pt-4 border-t"
              variants={itemVariants}
            >
              <motion.button
                type="button"
                onClick={() => {
                  toast.info("Changes discarded");
                  setActiveView("dashboard");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-700 rounded-md text-sm font-medium text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                whileHover={{ scale: 1.05, backgroundColor: "#4338ca" }}
                whileTap={{ scale: 0.95 }}
                initial={{ boxShadow: "0 0 0 rgba(79, 70, 229, 0)" }}
                animate={{ 
                  boxShadow: isSubmitting 
                    ? "0 0 10px rgba(79, 70, 229, 0.7)" 
                    : "0 0 0 rgba(79, 70, 229, 0)" 
                }}
                transition={{ duration: 0.5, repeat: isSubmitting ? Infinity : 0, repeatType: "reverse" }}
              >
                {isSubmitting ? (
                  <>
                    <motion.svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </motion.svg>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CreateUser;