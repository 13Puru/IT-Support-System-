import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Calendar, LogOut, CheckCircle, Ticket, CheckSquare } from "lucide-react";
import Card from "../Card/Card";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast

const UserProfile = ({ setActiveView }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [ticketStats, setTicketStats] = useState({
    created: 0,
    resolved: 0,
    pending: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_GET_PROFILE = import.meta.env.VITE_GET_PROFILE;
  const API_GET_TICKET_STAT = import.meta.env.VITE_GET_TICKET_STAT;
  const API_SEND_OTP = import.meta.env.VITE_SENT_OTP;

  useEffect(() => {
    // Fetch profile data from API
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('userToken');

        if (!token) {
            console.error("Token not found. Redirecting to login.");
            setError("Unauthorized. Please log in again.");
            toast.error("Session expired. Please login again."); // Add toast for unauthorized
            return;
        }

        const response = await axios.get(`${API_GET_PROFILE}/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        });

        if (response.data.success) {
            const userData = response.data.user;
            setProfileData({
                id: userData.user_id,
                name: userData.username,
                email: userData.email,
                role: userData.role || "agent",
                joinDate: userData.created_at,
                isVerified: userData.isverified || false,
            });
            
            // Fetch ticket statistics
            await fetchTicketStats(userId, token);
            toast.success("Profile loaded successfully"); // Add toast for successful profile load
        } else {
            setError("Failed to load profile. Please try again.");
            toast.error("Failed to load profile data"); // Add toast for profile load failure
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.response && err.response.status === 401) {
          setError("Unauthorized. Please login again.");
          toast.error("Session expired. Please login again."); // Add toast for unauthorized
        } else {
          setError("Failed to load profile. Please try again.");
          toast.error("Failed to load profile. Please try again."); // Add toast for general error
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch ticket statistics
    const fetchTicketStats = async (userId, token) => {
      try {
        const response = await axios.get(`${API_GET_TICKET_STAT}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
    
        if (response.data.success) {
          setTicketStats({
            created: response.data.ticket_status.created_tickets || 0,
            resolved: response.data.ticket_status.resolved_tickets || 0,
            pending: response.data.ticket_status.pending_tickets || 0
          });
        } else {
          toast.warning("Could not load ticket statistics"); // Add toast for ticket stats failure
        }
      } catch (err) {
        console.error("Error fetching ticket stats:", err);
        toast.warning("Failed to load ticket statistics"); // Add toast for ticket stats error
      }
    };
    
    fetchProfile();
  }, []);

  // Framer Motion animation variants
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
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Function to render the appropriate role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <div className="flex items-center text-purple-700 bg-purple-50 px-3 py-1 rounded-full text-sm">
            Administrator
          </div>
        );
      case "agent":
        return (
          <div className="flex items-center text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-sm">
            Support Agent
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm">
            Standard User
          </div>
        );
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    toast.info("You have been logged out successfully"); // Add toast for logout
    navigate('/login');
  };

  const handleVerifyEmail = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("userToken");
  
      toast.info("Sending verification email..."); // Add loading toast
      
      await axios.post(
        API_SEND_OTP,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
  
      toast.success("Verification email sent. Please check your inbox."); // Add success toast
      navigate("/otp"); // Navigate to OTP page after success
    } catch (err) {
      console.error("Error sending verification email:", err);
      toast.error("Failed to send verification email. Please try again."); // Add error toast
    }
  };

  const handleReload = () => {
    toast.info("Reloading profile data..."); // Add toast for reload
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
        </div>
        <Card>
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={handleReload} 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => {
            setActiveView("dashboard");
            toast.info("Returning to dashboard"); // Add toast for navigation
          }} 
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-4">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User size={40} className="text-indigo-400" />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mt-2">{profileData.name}</h2>
              <div className="mt-2">{getRoleBadge(profileData.role)}</div>
              
              <div className="mt-4 w-full">
                <div className="flex items-center py-2 border-b border-gray-100">
                  <Mail size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{profileData.email}</span>
                  {profileData.isVerified ? (
                    <span className="ml-2 text-xs text-green-600 flex items-center">
                      <CheckCircle size={12} className="mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="ml-2 text-xs text-amber-600">Not Verified</span>
                  )}
                </div>
                <div className="flex items-center py-2">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Joined {formatDate(profileData.joinDate)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 w-full space-y-3">
                {!profileData.isVerified && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full px-4 py-2 bg-purple-700 rounded-md text-sm font-medium text-white hover:bg-purple-600 flex items-center justify-center"
                    onClick={handleVerifyEmail}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Verify Email
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-600 flex items-center justify-center"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Ticket Statistics Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Ticket Statistics</h2>
              
              <div className="space-y-6">
                {/* Created Tickets */}
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <div className="p-3 rounded-full bg-blue-100 mr-4">
                    <Ticket size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created Tickets</p>
                    <p className="text-2xl font-bold text-gray-800">{ticketStats.created}</p>
                  </div>
                </div>
                
                {/* Resolved Tickets */}
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <div className="p-3 rounded-full bg-green-100 mr-4">
                    <CheckSquare size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Resolved Tickets</p>
                    <p className="text-2xl font-bold text-gray-800">{ticketStats.resolved}</p>
                  </div>
                </div>
                
                {/* Pending Tickets */}
                <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                  <div className="p-3 rounded-full bg-amber-100 mr-4">
                    <Ticket size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Tickets</p>
                    <p className="text-2xl font-bold text-gray-800">{ticketStats.pending}</p>
                  </div>
                </div>
                
                {/* Resolution Rate */}
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">Resolution Rate</p>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ 
                        width: `${ticketStats.created > 0 
                          ? Math.round((ticketStats.resolved / ticketStats.created) * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-600">
                    {ticketStats.created > 0 
                      ? Math.round((ticketStats.resolved / ticketStats.created) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserProfile;