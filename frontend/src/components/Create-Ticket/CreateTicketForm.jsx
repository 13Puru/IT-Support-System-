import React, { useState, useEffect, useRef } from 'react';
import Card from '../Card/Card';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export const CreateTicketForm = ({ setActiveView }) => {
  // File upload constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
  const ALLOWED_FILE_TYPES = [
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const getUserInfo = () => {
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const username = localStorage.getItem("username") || "";
      return { email: userEmail, username };
    } catch (error) {
      console.error("Error retrieving user info:", error);
      return { email: "", username: "" };
    }
  };

  const { email, username } = getUserInfo();

  // Form state
  const [subject, setSubject] = useState("");
  const [issue, setIssue] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [priority, setPriority] = useState("");
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0); // New state for tracking upload progress
  const API_CREATE_TICKET = import.meta.env.VITE_CREATE_TICKET;
  const API_GET_CATEGORIES = import.meta.env.VITE_GET_CATEGORY;
  const fileInputRef = useRef(null);

  // File handling functions - moved inside the component
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      const file = newFiles[0];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE/1024/1024}MB`);
        return;
      }
      
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error("File type not supported. Please upload PDF, Word, or image files.");
        return;
      }
      
      setFiles([file]);
    } else {
      setFiles([]);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const file = droppedFiles[0];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE/1024/1024}MB`);
        return;
      }
      
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error("File type not supported. Please upload PDF, Word, or image files.");
        return;
      }
      
      setFiles([file]);
      
      // Notify if multiple files were dropped but only one will be used
      if (droppedFiles.length > 1) {
        toast.info("Only the first file will be used as attachment.");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };
  
  // Render file preview based on file type
  const renderFilePreview = (file) => {
    if (!file) return null;
    
    // Check file type and render appropriate preview
    if (file.type.startsWith('image/')) {
      return (
        <div className="mt-2 border rounded-md overflow-hidden">
          <img 
            src={URL.createObjectURL(file)} 
            alt="Preview" 
            className="max-h-40 max-w-full object-contain mx-auto"
          />
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="mt-2 flex items-center justify-center border rounded-md p-3 bg-gray-50">
          <svg className="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
            <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          <span className="ml-2 text-sm">PDF Document</span>
        </div>
      );
    } else if (file.type.includes('word')) {
      return (
        <div className="mt-2 flex items-center justify-center border rounded-md p-3 bg-gray-50">
          <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <span className="ml-2 text-sm">Word Document</span>
        </div>
      );
    } else {
      // Generic file icon for other types
      return (
        <div className="mt-2 flex items-center justify-center border rounded-md p-3 bg-gray-50">
          <svg className="h-10 w-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <span className="ml-2 text-sm">Document</span>
        </div>
      );
    }
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        toast.error("Unauthorized! Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          API_GET_CATEGORIES,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log("API response for categories:", response.data); // Debug log
        
        // Handle different response formats
        let categoryData = response.data;
        
        // Check if the response is an object with a data property
        if (response.data && response.data.data) {
          categoryData = response.data.data;
        }
        
        // Ensure categoryData is an array with proper format
        if (!Array.isArray(categoryData)) {
          // If it's an object with category keys
          if (typeof categoryData === 'object' && categoryData !== null) {
            categoryData = Object.keys(categoryData).map(key => ({
              id: key,
              category: categoryData[key]
            }));
          } else {
            // Fallback to default categories
            categoryData = getDefaultCategories();
            console.warn("API didn't return categories in expected format, using defaults");
          }
        }
        
        setCategories(categoryData);
      } catch (err) {
        console.error("Failed to fetch categories:", err.response?.data || err);
        toast.error("Failed to load categories. Please refresh the page.");
        
        // Set default categories on error
        setCategories(getDefaultCategories());
      } finally {
        setIsLoading(false);
      }
    };
    
    // Helper function to get default categories
    const getDefaultCategories = () => {
      return [
        { id: "hardware", category: "Hardware" },
        { id: "software", category: "Software" },
        { id: "network", category: "Network" },
        { id: "account_access", category: "Account Access" },
        { id: "other", category: "Other" }
      ];
    };

    fetchCategories();
  }, [API_GET_CATEGORIES]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!subject || !issue || !category || !priority) {
      toast.error("All fields are required.");
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      return;
    }

    // Reset progress
    setUploadProgress(0);
    
    // Show loading toast
    const loadingToastId = toast.loading("Creating your ticket...");
    setIsSubmitting(true);

    try {
      // Create FormData object to handle files
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('issue', issue);
      formData.append('category', category);
      formData.append('priority', priority);
      
      // Append each file to the form data
      files.forEach((file) => {
        formData.append('file', file);
      });

      const response = await axios.post(
        API_CREATE_TICKET,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      // Update loading toast to success
      toast.update(loadingToastId, { 
        render: "Ticket created successfully!", 
        type: "success", 
        isLoading: false,
        autoClose: 5000,
        closeButton: true
      });
      
      // Reset form fields
      setSubject("");
      setIssue("");
      setCategory("");
      setPriority("");
      setFiles([]);
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        setActiveView("dashboard");
      }, 2000);
      
    } catch (err) {
      console.error("Creation error:", err.response?.data || err);
      
      // Check for specific file-related errors
      const errorMessage = err.response?.data?.message || "Error creating ticket. Please try again.";
      
      // Update loading toast to error
      toast.update(loadingToastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          className="text-2xl font-bold text-gray-800"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create New Ticket
        </motion.h1>
        <motion.button
          onClick={() => setActiveView("dashboard")}
          className="border-2 border-[#432dd7] hover:bg-[#432da1] font-semibold text-gray-800 hover:text-white px-10 py-1.5 rounded-lg transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Dashboard
        </motion.button>
      </div>
      <motion.h5 
        className="font-stretch-100% text-gray-800 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A new ticket is being created by <b>{username}</b> having mail-id: <b>{email}</b>
      </motion.h5>
      
      <Card title="Ticket Details">
        <motion.form 
          onSubmit={handleCreateTicket} 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            Fields marked with (*) are mandatory
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <motion.input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief description of the issue"
              whileFocus={{ boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)" }}
              disabled={isSubmitting}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category*
            </label>
            <motion.select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              whileFocus={{ boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)" }}
              disabled={isSubmitting || isLoading}
            >
              <option value="">Select a category</option>
              {isLoading ? (
                <option value="" disabled>Loading categories...</option>
              ) : (
                Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat.id} value={cat.category || cat.id}>
                    {cat.category || 'Unnamed Category'}
                  </option>
                ))
              )}
            </motion.select>
            {isLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority*
            </label>
            <motion.select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              whileFocus={{ boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)" }}
              disabled={isSubmitting}
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </motion.select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <motion.textarea
              rows="4"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Please provide detailed information about the issue"
              whileFocus={{ boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)" }}
              disabled={isSubmitting}
            ></motion.textarea>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment
            </label>
            <div className="text-xs text-gray-500 mb-2">
              Note: Only a single file can be uploaded (max 5MB). Supported formats: PDF, JPEG, PNG, GIF, DOC, DOCX
            </div>
            <motion.div 
              className={`border border-dashed ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-md p-6 text-center cursor-pointer`}
              whileHover={{ 
                borderColor: "#4F46E5", 
                backgroundColor: "rgba(79, 70, 229, 0.05)" 
              }}
              onClick={openFileDialog}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              />
              <p className="text-sm text-gray-500 mb-2">
                Drag and drop a file here, or click to select a file
              </p>
              {files.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Selected file:</p>
                  <div className="max-h-32 overflow-y-auto">
                    {files.slice(0, 1).map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md mb-1 text-xs">
                        <div className="flex items-center truncate">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="truncate max-w-xs">{file.name}</span>
                          <span className="text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* File preview display */}
                  {renderFilePreview(files[0])}
                </div>
              )}
            </motion.div>
            {files.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </motion.div>
          
          {/* Upload progress bar */}
          {isSubmitting && files.length > 0 && (
            <motion.div 
              className="w-full bg-gray-200 rounded-full h-2.5 my-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-center mt-1">Uploading: {uploadProgress}%</p>
            </motion.div>
          )}

          <motion.div 
            className="flex justify-end space-x-4"
            variants={itemVariants}
          >
            <motion.button
              type="button"
              onClick={() => setActiveView("dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className={`px-4 py-2 bg-indigo-700 rounded-md text-sm font-medium text-white hover:bg-indigo-800 flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              variants={buttonVariants}
              initial="initial"
              whileHover={isSubmitting ? {} : "hover"}
              whileTap={isSubmitting ? {} : "tap"}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Ticket'
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </Card>
    </motion.div>
  );
};