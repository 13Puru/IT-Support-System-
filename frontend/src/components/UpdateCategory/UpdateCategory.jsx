import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Save, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

const CategoryUpdateForm = () => {
  const [categories, setCategories] = useState({
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
    category6: "",
    category7: ""
  });
  
  const [originalCategories, setOriginalCategories] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [status, setStatus] = useState(null); // "success", "error", null
  const [message, setMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  //API endpoints
  const API_GET_CATEGORIES = import.meta.env.VITE_GET_CATEGORY;
  const API_UPDATE_CATEGORIES = import.meta.env.VITE_UPDATE_CATEGORY;
  
  // Fetch existing categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Check if user has made changes
  useEffect(() => {
    if (Object.keys(originalCategories).length > 0) {
      const changed = Object.keys(categories).some(
        key => categories[key] !== originalCategories[key]
      );
      setHasChanges(changed);
    }
  }, [categories, originalCategories]);
  
  const fetchCategories = async () => {
    setIsFetching(true);
    try {
      // Get the authentication token from localStorage (or wherever you store it)
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      
      // Include the token in the Authorization header
      const response = await axios.get(API_GET_CATEGORIES, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        const categoryData = response.data.data;
        const formattedCategories = {};
        
        // Map DB categories to form fields
        categoryData.forEach((item, index) => {
          formattedCategories[`category${index + 1}`] = item.category;
        });
        
        setCategories(formattedCategories);
        setOriginalCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      
      // Check if it's specifically an authentication error
      if (error.response && error.response.status === 401) {
        setStatus("error");
        setMessage("Session expired. Please log in again to continue.");
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        setStatus("error");
        setMessage(error.message || "Failed to load existing categories. Please try again.");
      }
    } finally {
      setIsFetching(false);
    }
  };
  
  const handleInputChange = (key, value) => {
    setCategories(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    
    try {
      // Validate form data
      const hasEmptyField = Object.values(categories).some(val => val.trim() === "");
      if (hasEmptyField) {
        throw new Error("All category fields are required");
      }
      
      // Get the authentication token
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      
      // Send API request with axios, including the auth token
      const response = await axios.put(API_UPDATE_CATEGORIES, categories, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update original categories to reflect new values
      setOriginalCategories({...categories});
      setStatus("success");
      setMessage(response.data.message || "Categories updated successfully!");
      setHasChanges(false);
    } catch (error) {
      // Handle specific auth errors
      if (error.response && error.response.status === 401) {
        setStatus("error");
        setMessage("Session expired. Please log in again to continue.");
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        setStatus("error");
        setMessage(
          error.response?.data?.message || 
          error.message || 
          "An unexpected error occurred"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setCategories({...originalCategories});
    setStatus(null);
    setHasChanges(false);
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
    visible: { y: 0, opacity: 1 }
  };
  
  const buttonVariants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.97 },
    disabled: { opacity: 0.6 }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-8"
        >
          <Loader2 className="h-10 w-10 mx-auto text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600 font-medium">Loading categories...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Category Management
          </h2>
          <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
            Update your application's main categories. Changes will be reflected across the entire platform.
          </p>
        </div>
        
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 rounded-md p-4 ${
                status === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {status === "success" ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${status === "success" ? "text-green-800" : "text-red-800"}`}>
                    {message}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setStatus(null)}
                      className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        status === "success"
                          ? "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600"
                          : "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600"
                      }`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white shadow-xl rounded-xl px-8 pt-6 pb-8 mb-4 border border-gray-200"
        >
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900">Edit Categories</h3>
            <p className="mt-1 text-sm text-gray-500">
              All categories are required. Changes will only be saved when you click the Save button.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              {Object.keys(categories).map((key, index) => (
                <motion.div key={key} variants={itemVariants} className="relative">
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category {index + 1}
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      id={key}
                      type="text"
                      value={categories[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder={`Category ${index + 1}`}
                      disabled={isLoading}
                      className={`block w-full pr-10 focus:outline-none sm:text-sm rounded-md py-3 px-4 ${
                        categories[key].trim() === ""
                          ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                      aria-invalid={categories[key].trim() === ""}
                      aria-describedby={categories[key].trim() === "" ? `${key}-error` : undefined}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {categories[key].trim() === "" && (
                        <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                  {categories[key].trim() === "" && (
                    <p className="mt-2 text-sm text-red-600" id={`${key}-error`}>
                      This field is required
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                onClick={resetForm}
                disabled={isLoading || !hasChanges}
                variants={buttonVariants}
                whileHover={!isLoading && hasChanges ? "hover" : "disabled"}
                whileTap={!isLoading && hasChanges ? "tap" : "disabled"}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !hasChanges
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Changes
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={isLoading || !hasChanges}
                variants={buttonVariants}
                whileHover={!isLoading && hasChanges ? "hover" : "disabled"}
                whileTap={!isLoading && hasChanges ? "tap" : "disabled"}
                className={`inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !hasChanges
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
        
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryUpdateForm;