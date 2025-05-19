import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  UserPlus,
  Mail,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  UserCog,
  CheckCircle,
  XCircle,
  CheckCheck,
  AlertCircle,
  X
} from "lucide-react";
import Card from "../Card/Card";
import { motion, AnimatePresence } from "framer-motion";

const Toast = ({ message, type, onClose }) => {
  // Define toast colors based on type
  const bgColors = {
    success: "bg-green-100 border-green-500",
    error: "bg-red-100 border-red-500",
    info: "bg-blue-100 border-blue-500",
    warning: "bg-yellow-100 border-yellow-500"
  };
  
  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-blue-800",
    warning: "text-yellow-800"
  };
  
  const icons = {
    success: <CheckCheck size={18} className="text-green-600" />,
    error: <AlertCircle size={18} className="text-red-600" />,
    info: <AlertCircle size={18} className="text-blue-600" />,
    warning: <AlertCircle size={18} className="text-yellow-600" />
  };
  
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <motion.div 
      className={`${bgColors[type]} ${textColors[type]} p-4 rounded-md shadow-md border-l-4 flex items-start`}
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="mr-3">
        {icons[type]}
      </div>
      <div className="flex-1">
        {message}
      </div>
      <button 
        onClick={onClose} 
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

const ViewUsers = ({setActiveView}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [toasts, setToasts] = useState([]);

  //api endpoints
  const API_GET_USER = import.meta.env.VITE_GET_ALL;
  const API_RESTRICT = import.meta.env.VITE_RESTRICT;
  const API_UNRESTRICT = import.meta.env.VITE_UNRESTRICT;

  // Show toast notification
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  };

  // Remove toast notification
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        showToast("Authentication token is missing. Please log in again.", "error");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(API_GET_USER, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Transform each user, ensuring status is properly handled
        const transformedUsers = response.data.users.map(user => {
          // Default to "unknown" if status is missing
          const status = user.status || "unknown";
          
          // Log the raw isverified value from DB to help debug
          console.log(`User ${user.username} isverified value:`, user.isverified);
          
          return {
            id: user.user_id,
            name: user.username || "Unknown",
            email: user.email,
            role: user.role || "user",
            created_at: user.created_at,
            status: status, // Keep the original status value
            // Safely capitalize the first letter
            displayStatus: status.charAt(0).toUpperCase() + status.slice(1),
            // More robust verification check - default to false if undefined
            isVerified: user.isverified === 'true' || user.isverified === true || false
          };
        });
        
        setUsers(transformedUsers);
        setError(null);
        
        // Only show success toast when there was a previous error or during initial load
        if (error || !users.length) {
          showToast("Users loaded successfully", "success");
        }
      } else {
        setError("Failed to fetch users: " + (response.data.message || "Unknown error"));
        showToast("Failed to fetch users: " + (response.data.message || "Unknown error"), "error");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch users";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Role badge colors
  const roleBadgeColors = {
    admin: "bg-purple-100 text-purple-800",
    agent: "bg-blue-100 text-blue-800",
    user: "bg-gray-100 text-gray-800"
  };

  // Status badge colors - using lowercase keys to match database values
  const statusBadgeColors = {
    active: "bg-green-100 text-green-800",
    restricted: "bg-red-100 text-red-800",
    unknown: "bg-gray-100 text-gray-800"
  };

  // Filter users based on search term, role filter and status filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    // Match status filter against lowercase status from database
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "Active" && user.status === "active") || 
                         (filterStatus === "Restricted" && user.status === "restricted");
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "email") {
      comparison = a.email.localeCompare(b.email);
    } else if (sortBy === "department") {
      comparison = (a.department || "").localeCompare(b.department || "");
    } else if (sortBy === "created_at") {
      comparison = new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortBy === "isVerified") {
      // Sort by boolean values directly
      return sortOrder === "asc" 
        ? (a.isVerified === b.isVerified ? 0 : a.isVerified ? -1 : 1)
        : (a.isVerified === b.isVerified ? 0 : a.isVerified ? 1 : -1);
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleRestrictUser = async (userId, userName) => {
    if (window.confirm("Are you sure you want to restrict this user?")) {
      try {
        setActionInProgress(true);
        const token = localStorage.getItem("userToken");
        
        if (!token) {
          showToast("Authentication token is missing. Please log in again.", "error");
          setActionInProgress(false);
          return;
        }

        const response = await axios.post(
          `${API_RESTRICT}/${userId}`, 
          {},  // Empty body
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          // Refresh the user list from the database to ensure we have the latest data
          await fetchUsers();
          // Success notification
          showToast(`User ${userName} has been restricted successfully.`, "success");
        } else {
          showToast("Failed to restrict user: " + (response.data.message || "Unknown error"), "error");
        }
      } catch (err) {
        console.error("Error restricting user:", err);
        showToast(err.response?.data?.message || "Failed to restrict user", "error");
      } finally {
        setActionInProgress(false);
      }
    }
  };

  const handleUnrestrictUser = async (userId, userName) => {
    if (window.confirm("Are you sure you want to unrestrict this user?")) {
      try {
        setActionInProgress(true);
        const token = localStorage.getItem("userToken");
        
        if (!token) {
          showToast("Authentication token is missing. Please log in again.", "error");
          setActionInProgress(false);
          return;
        }

        const response = await axios.post(
          `${API_UNRESTRICT}/${userId}`, 
          {},  // Empty body
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          // Refresh the user list from the database to ensure we have the latest data
          await fetchUsers();
          // Success notification
          showToast(`User ${userName} has been unrestricted successfully.`, "success");
        } else {
          showToast("Failed to unrestrict user: " + (response.data.message || "Unknown error"), "error");
        }
      } catch (err) {
        console.error("Error unrestricting user:", err);
        showToast(err.response?.data?.message || "Failed to unrestrict user", "error");
      } finally {
        setActionInProgress(false);
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15
      }
    },
    exit: { 
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="p-6 relative" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center">
          <motion.button 
            onClick={() => setActiveView("dashboard")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={fetchUsers}
            disabled={loading || actionInProgress}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium flex items-center disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
          <motion.button
            onClick={() => setActiveView("CreateUser")}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-medium flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus size={16} className="mr-2" />
            Add New User
          </motion.button>
        </div>
      </motion.div>

      <Card>
        <AnimatePresence>
          {error && (
            <motion.div 
              className="bg-red-50 text-red-800 p-4 mb-4 rounded-md"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {error}
              <motion.button 
                onClick={fetchUsers} 
                className="ml-3 underline"
                disabled={loading}
                whileHover={{ scale: 1.05 }}
              >
                Try again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="relative w-full md:w-64">
            <motion.input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)" }}
              transition={{ duration: 0.2 }}
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <motion.select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="appearance-none w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)" }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
                <option value="user">User</option>
              </motion.select>
              <Filter size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="relative">
              <motion.select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)" }}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Restricted">Restricted</option>
              </motion.select>
              <Filter size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </motion.div>

        <div className="overflow-x-auto">
          <AnimatePresence>
            {loading ? (
              <motion.div 
                className="flex justify-center items-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="rounded-full h-8 w-8 border-b-2 border-indigo-700"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </motion.div>
            ) : (
              <table className="min-w-full bg-white rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.03 }}
                      >
                        Name
                        {sortBy === "name" && (
                          <motion.span 
                            className="ml-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </motion.span>
                        )}
                      </motion.div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.03 }}
                      >
                        Email
                        {sortBy === "email" && (
                          <motion.span 
                            className="ml-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </motion.span>
                        )}
                      </motion.div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.03 }}
                      >
                        Status
                        {sortBy === "status" && (
                          <motion.span 
                            className="ml-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </motion.span>
                        )}
                      </motion.div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("isVerified")}
                    >
                      <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.03 }}
                      >
                        Verified
                        {sortBy === "isVerified" && (
                          <motion.span 
                            className="ml-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </motion.span>
                        )}
                      </motion.div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("created_at")}
                    >
                      <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.03 }}
                      >
                        Created
                        {sortBy === "created_at" && (
                          <motion.span 
                            className="ml-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </motion.span>
                        )}
                      </motion.div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <motion.tbody 
                  className="divide-y divide-gray-200"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {sortedUsers.map((user) => (
                      <motion.tr 
                        key={user.id} 
                        className="hover:bg-gray-50"
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <motion.div 
                              className="w-8 h-8 flex-shrink-0 mr-3 bg-indigo-100 rounded-full flex items-center justify-center"
                              whileHover={{ scale: 1.1, backgroundColor: "#c7d2fe" }}
                            >
                              <span className="text-indigo-800 font-medium text-sm">
                                {user.name.split(" ").map(n => n[0]).join("")}
                              </span>
                            </motion.div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span 
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeColors[user.role] || "bg-gray-100 text-gray-800"}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {user.role === "admin" && <Shield size={12} className="mr-1" />}
                            {user.role === "agent" && <UserCog size={12} className="mr-1" />}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span 
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColors[user.status] || "bg-gray-100 text-gray-800"}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {user.status === "active" ? (
                              <Unlock size={12} className="mr-1" />
                            ) : (
                              <Lock size={12} className="mr-1" />
                            )}
                            {user.displayStatus}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span 
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isVerified ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-gray-800"}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {user.isVerified ? (
                              <CheckCircle size={12} className="mr-1" />
                            ) : (
                              <XCircle size={12} className="mr-1" />
                            )}
                            {user.isVerified ? "Verified" : "Unverified"}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <div className="flex justify-center space-x-2">
                            {user.status === "active" && (
                              <motion.button
                                onClick={() => handleRestrictUser(user.id, user.name)}
                                className="text-red-600 hover:text-red-900 focus:outline-none disabled:opacity-50 flex items-center"
                                title="Restrict User"
                                disabled={actionInProgress}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Lock size={16} className="mr-1" />
                                <span>Restrict</span>
                              </motion.button>
                            )}
                            
                            {user.status === "restricted" && (
                              <motion.button
                                onClick={() => handleUnrestrictUser(user.id, user.name)}
                                className="text-green-600 hover:text-green-900 focus:outline-none disabled:opacity-50 flex items-center"
                                title="Unrestrict User"
                                disabled={actionInProgress}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Unlock size={16} className="mr-1" />
                                <span>Unrestrict</span>
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  
                  {sortedUsers.length === 0 && !loading && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found matching the current filters.
                      </td>
                    </motion.tr>
                  )}
                </motion.tbody>
              </table>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

export default ViewUsers;