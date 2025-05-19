import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Plus,
    Ticket,
    CheckCircle,
    Clock,
    Search,
    ChevronLeft,
    ChevronRight,
    Users,
    UserPlus,
    UserCog,
    ChevronDown,
    ChevronUp,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Added Framer Motion

// Import necessary components
import Card from "../Card/Card";
import { CreateTicketForm } from "../Create-Ticket/CreateTicketForm";
import StatsCard from "../StatsCard/StatsCard";
import ActivityItem from "../ActivityItem/ActivityItem";
import PriorityItem from "../PriorityItem/PriorityItem";
import PerformanceBar from "../PerformanceBar/PerformanceBar";
import ViewUsers from "../ViewUsers/ViewUsers";
import CreateUser from "../CreateUser/CreateUser";
import UserProfile from "../Profile/UserProfile";
import TicketDetails from "../TicketDetails/TicketDetails";

// Import utility components and helpers
import withRoleAccess from "../../hoc/withRoleAccess";
import statusColors from "../Colors/StatusColors";
import priorityColors from "../Colors/priorityColors";
import actionColors from "../Colors/actionColors";
import CategoryUpdateForm from "../UpdateCategory/UpdateCategory";

// Wrap TicketDetails with role-based access control
const TicketDetailsWithRole = withRoleAccess(TicketDetails);

// Animation variants
const pageTransition = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: i => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.2
        }
    })
};

const Dashboard = ({ userRole }) => {
    // Navigation and routing
    const navigate = useNavigate();

    // State management
    const [activeView, setActiveView] = useState("dashboard");
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [role, setUserRole] = useState(localStorage.getItem("userRole"));

    // Ticket-related states
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ticket filtering states
    const [ticketFilter, setTicketFilter] = useState({
        status: '',
        priority: '',
        searchQuery: ''
    });

    // Dashboard stats states
    const [ticketStats, setTicketStats] = useState({
        open: { value: "0", trend: "0 from yesterday", trendUp: false },
        closed: { value: "0", trend: "0 from last week", trendUp: false },
        resolved: { value: "0", trend: "0 from last week", trendUp: false }
    });
    const [priorityIssues, setPriorityIssues] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    // API endpoint from environment variables
    const API_GET_TICKET = import.meta.env.VITE_GET_TICKET;

    // Fetch tickets from API
    const fetchTickets = async () => {
        try {
            const authToken = localStorage.getItem('userToken');
            const response = await axios.get(API_GET_TICKET, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.tickets || [];
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw new Error(
                error.response?.status === 401
                    ? 'Authentication failed. Please log in again.'
                    : 'Failed to load tickets. Please try again later.'
            );
        }
    };

    // Fetch tickets on component mount and set up polling
    useEffect(() => {
        const getTickets = async () => {
            try {
                setIsLoading(true);
                const ticketData = await fetchTickets();

                // Update tickets
                setTickets(ticketData);

                // Optional: Update dashboard stats
                const openTickets = ticketData.filter(ticket => ticket.status === 'in_progress');
                const closedTickets = ticketData.filter(ticket => ticket.last_action === 'closed');
                const resolvedTickets = ticketData.filter(ticket => ticket.status === 'resolved');

                setTicketStats({
                    open: {
                        value: openTickets.length.toString(),
                        trend: `${openTickets.length} from yesterday`,
                        trendUp: true
                    },
                    closed: {
                        value: closedTickets.length.toString(),
                        trend: `${closedTickets.length} from last week`,
                        trendUp: false
                    },
                    resolved: {
                        value: resolvedTickets.length.toString(),
                        trend: `${resolvedTickets.length} from last week`,
                        trendUp: true
                    }
                });

                // Example of setting priority issues and recent activity
                setPriorityIssues(
                    ticketData
                        .filter(ticket => ticket.priority === 'high')
                        .map(ticket => ({
                            id: ticket.ticket_id,
                            title: ticket.subject,
                            priority: ticket.priority
                        }))
                );

                setRecentActivity(
                    ticketData
                        .slice(0, 5)
                        .map(ticket => ({
                            title: `Ticket ${ticket.ticket_id}`,
                            description: ticket.subject,
                            time: new Date(ticket.created_at).toLocaleString()
                        }))
                );

                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        getTickets();
        // Uncomment for polling
        // const pollingInterval = setInterval(getTickets, 20000);
        // return () => clearInterval(pollingInterval);
    }, []);

    // Toggle sidebar collapse
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Toggle user menu
    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    // Handle ticket selection
    const handleTicketSelect = (ticketId) => {
        setActiveView(ticketId);
    };

    // Filter function for tickets
    const filterTickets = () => {
        return tickets.filter(ticket => {
            const matchesStatus = !ticketFilter.status || ticket.status === ticketFilter.status;
            const matchesPriority = !ticketFilter.priority || ticket.priority === ticketFilter.priority;
            const matchesSearch = !ticketFilter.searchQuery ||
                ticket.subject.toLowerCase().includes(ticketFilter.searchQuery.toLowerCase()) ||
                ticket.ticket_id.toLowerCase().includes(ticketFilter.searchQuery.toLowerCase());

            return matchesStatus && matchesPriority && matchesSearch;
        });
    };

    // Render loading state
    if (isLoading) {
        return (
            <motion.div
                className="flex-grow flex items-center justify-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col items-center gap-2">
                    <motion.div
                        className="rounded-full h-8 w-8 border-b-2 border-indigo-700"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    ></motion.div>
                    <p className="text-indigo-600 font-medium">Loading tickets...</p>
                </div>
            </motion.div>
        );
    }

    // Render error state
    if (error) {
        return (
            <motion.div
                className="flex-grow flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <p className="text-red-500">{error}</p>
            </motion.div>
        );
    }

    // Filter dropdown component
    const FilterDropdown = () => {
        const [isFilterOpen, setIsFilterOpen] = useState(false);

        const handleFilterChange = (filterType, value) => {
            setTicketFilter(prev => ({
                ...prev,
                [filterType]: value
            }));
        };

        const resetFilters = () => {
            setTicketFilter({
                status: '',
                priority: '',
                searchQuery: ''
            });
        };

        return (
            <div className="relative">
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 ${isFilterOpen ? 'bg-gray-100' : ''}`}
                >
                    <div className="flex items-center">
                        <Filter size={16} className="mr-2 text-gray-600" />
                        <span>Ticket Filters</span>
                    </div>
                    <motion.div
                        animate={{ rotate: isFilterOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isFilterOpen ? (
                            <ChevronUp size={16} className="text-gray-600" />
                        ) : (
                            <ChevronDown size={16} className="text-gray-600" />
                        )}
                    </motion.div>
                </button>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            className="absolute z-10 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-4 mt-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={ticketFilter.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="yet_to_open">Yet-to-Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={ticketFilter.priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="flex justify-between">
                                <motion.button
                                    onClick={resetFilters}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Reset Filters
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Render ticket list with filtering
    const renderTicketList = () => {
        const filteredTickets = filterTickets();

        return filteredTickets.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No tickets found</p>
        ) : (
            <ul className="divide-y divide-gray-200">
                {filteredTickets.map((ticket, index) => (
                    <motion.li
                        key={ticket.ticket_id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={listItemVariants}
                    >
                        <motion.button
                            onClick={() => handleTicketSelect(ticket.ticket_id)}
                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${activeView === ticket.ticket_id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                            whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isCollapsed ? (
                                <div className="flex flex-col items-center">
                                    <motion.span
                                        className={`h-2 w-2 rounded-full ${statusColors[ticket.status].replace('text-', 'bg-')}`}
                                        whileHover={{ scale: 1.5 }}
                                    ></motion.span>
                                    <span className="text-xs font-semibold text-gray-500 mt-1">
                                        {ticket.ticket_id.substring(0, 3)}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-gray-500">{ticket.ticket_id}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[ticket.status]}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800 truncate">{ticket.subject}</p>
                                    <div className="mt-1 flex justify-between items-center">
                                        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[ticket.priority]}`}>
                                            {ticket.priority}
                                        </span>
                                        {ticket.last_action && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${actionColors[ticket.last_action] || 'text-gray-600 bg-gray-100'}`}>
                                                {ticket.last_action}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.button>
                    </motion.li>
                ))}
            </ul>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <motion.div
                className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col relative`}
                initial={false}
                animate={{ width: isCollapsed ? 64 : 256 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {/* Sidebar toggle button */}
                <motion.button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-16 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 z-10"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {isCollapsed ?
                        <ChevronRight size={16} className="text-gray-600" /> :
                        <ChevronLeft size={16} className="text-gray-600" />
                    }
                </motion.button>

                {/* App logo */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                    <AnimatePresence mode="wait">
                        {!isCollapsed ? (
                            <motion.h1
                                key="full-logo"
                                className="text-xl font-bold text-indigo-700"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                StackIT
                            </motion.h1>
                        ) : (
                            <motion.h1
                                key="short-logo"
                                className="text-xl font-bold text-indigo-700"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                S
                            </motion.h1>
                        )}
                    </AnimatePresence>
                </div>

                {/* Create Ticket Button */}
                <div className="p-4">
                    <motion.button
                        onClick={() => setActiveView("createTicket")}
                        className={`w-full bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center`}
                        whileHover={{ backgroundColor: "rgba(67, 56, 202, 1)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus size={16} className={isCollapsed ? '' : 'mr-2'} />
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Create Ticket
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                {/* User Management Menu */}
                <div className="px-4 mb-2">
                    <motion.button
                        onClick={toggleUserMenu}
                        className={`w-full text-left ${isCollapsed ? 'justify-center' : 'justify-between'} flex items-center px-2 py-2 rounded-md hover:bg-gray-100 text-gray-700`}
                        whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                    >
                        {isCollapsed ? (
                            <Users size={16} className="text-gray-600" />
                        ) : (
                            <>
                                <div className="flex items-center">
                                    <Users size={16} className="text-gray-600 mr-2" />
                                    <span className="font-medium">User Management</span>
                                </div>
                                <motion.div
                                    animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isUserMenuOpen ?
                                        <ChevronUp size={16} className="text-gray-600" /> :
                                        <ChevronDown size={16} className="text-gray-600" />
                                    }
                                </motion.div>
                            </>
                        )}
                    </motion.button>

                    {/* User Management Dropdown */}
                    <AnimatePresence>
                        {(isUserMenuOpen || isCollapsed) && (
                            <motion.div
                                className={`${isCollapsed ? 'px-1 pt-1' : 'pl-6 pb-2'} space-y-2`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {(role === "admin" || role === "agent") && (
                                    <>
                                        <motion.button
                                            onClick={() => setActiveView("ViewUsers")}
                                            className={`w-full text-left ${isCollapsed ? 'justify-center' : ''} flex items-center px-2 py-2 rounded-md hover:bg-gray-100 text-gray-700`}
                                            whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Users size={16} className={`text-gray-600 ${isCollapsed ? '' : 'mr-2'}`} />
                                            {!isCollapsed && <span className="text-sm">View Users</span>}
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setActiveView("CreateUser")}
                                            className={`w-full text-left ${isCollapsed ? 'justify-center' : ''} flex items-center px-2 py-2 rounded-md hover:bg-gray-100 text-gray-700`}
                                            whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <UserPlus size={16} className={`text-gray-600 ${isCollapsed ? '' : 'mr-2'}`} />
                                            {!isCollapsed && <span className="text-sm">Create User</span>}
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setActiveView("CategoryUpdate")}
                                            className={`w-full text-left ${isCollapsed ? 'justify-center' : ''} flex items-center px-2 py-2 rounded-md hover:bg-gray-100 text-gray-700`}
                                            whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <UserPlus size={16} className={`text-gray-600 ${isCollapsed ? '' : 'mr-2'}`} />
                                            {!isCollapsed && <span className="text-sm">Update Category</span>}
                                        </motion.button>
                                    </>
                                )}

                                <motion.button
                                    onClick={() => setActiveView("UserProfile")}
                                    className={`w-full text-left ${isCollapsed ? 'justify-center' : ''} flex items-center px-2 py-2 rounded-md hover:bg-gray-100 text-gray-700`}
                                    whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <UserCog size={16} className={`text-gray-600 ${isCollapsed ? '' : 'mr-2'}`} />
                                    {!isCollapsed && <span className="text-sm">See Your Profile</span>}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Bar with Filters */}
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            className="px-4 mb-4 space-y-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="relative">
                                <motion.input
                                    type="text"
                                    placeholder="Search tickets..."
                                    value={ticketFilter.searchQuery}
                                    onChange={(e) => setTicketFilter(prev => ({
                                        ...prev,
                                        searchQuery: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                />
                                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            </div>
                            <FilterDropdown />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ticket List */}
                <div className="flex-grow overflow-y-auto">
                    {renderTicketList()}
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    {activeView === "dashboard" && (
                        <motion.div
                            key="dashboard"
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Dashboard Header */}
                            <div className="w-full flex items-center justify-between mb-6">
                                <motion.h1
                                    className="text-2xl font-bold text-gray-800"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Dashboard
                                </motion.h1>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <StatsCard
                                        icon={<Ticket className="text-indigo-600" />}
                                        title="Open Tickets"
                                        value={ticketStats?.open?.value || "0"}
                                        trend={ticketStats?.open?.trend || "N/A"}
                                        trendUp={ticketStats?.open?.trendUp || false}
                                        isLoading={isLoading}
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <StatsCard
                                        icon={<Clock className="text-blue-600" />}
                                        title="Closed Tickets"
                                        value={ticketStats?.closed?.value || "0"}
                                        trend={ticketStats?.closed?.trend || "N/A"}
                                        trendUp={ticketStats?.closed?.trendUp || false}
                                        isLoading={isLoading}
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <StatsCard
                                        icon={<CheckCircle className="text-green-600" />}
                                        title="Resolved This Week"
                                        value={ticketStats?.resolved?.value || "0"}
                                        trend={ticketStats?.resolved?.trend || "N/A"}
                                        trendUp={ticketStats?.resolved?.trendUp || false}
                                        isLoading={isLoading}
                                    />
                                </motion.div>
                            </div>

                            {/* Recent Activity & Priority Issues */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Card title="Recent Activity" isLoading={isLoading}>
                                        {recentActivity.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                {recentActivity.map((activity, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.1 * index }}
                                                    >
                                                        <ActivityItem
                                                            title={activity.title}
                                                            description={activity.description}
                                                            time={activity.time}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 p-4">No recent activity found.</p>
                                        )}
                                    </Card>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Card title="Priority Issues" isLoading={isLoading}>
                                        {priorityIssues.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                {priorityIssues.map((issue, index) => (
                                                    <motion.div
                                                        key={issue.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.1 * index }}
                                                    >
                                                        <PriorityItem
                                                            id={issue.id}
                                                            title={issue.title}
                                                            department={issue.department}
                                                            priority={issue.priority}
                                                            onClick={() => setActiveView(String(issue.id))}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 p-4">No priority issues found.</p>
                                        )}
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Support Team Performance */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Card title="Support Team Performance">
                                    <div className="space-y-4">
                                        <PerformanceBar team="Network Team" value={85} color="bg-indigo-500" />
                                        <PerformanceBar team="Software Support" value={92} color="bg-green-500" />
                                        <PerformanceBar team="Hardware Support" value={78} color="bg-blue-500" />
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Conditional Views */}
                    {activeView === "createTicket" && (
                        <motion.div
                            key="createTicket"
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <CreateTicketForm setActiveView={setActiveView} />
                        </motion.div>
                    )}

                    {activeView === "ViewUsers" && (
                        <motion.div
                            key="viewUsers"
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <ViewUsers setActiveView={setActiveView} />
                        </motion.div>
                    )}

                    {activeView === "CreateUser" && (
                        <motion.div
                            key="createUser"
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <CreateUser setActiveView={setActiveView} />
                        </motion.div>
                    )}

                    {activeView === "UserProfile" && (
                        <motion.div
                            key="userProfile"
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <UserProfile setActiveView={setActiveView} />
                        </motion.div>
                    )}

                    {activeView === "CategoryUpdate" && (
                        <motion.div
                            key="updateCategory"
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <CategoryUpdateForm setActiveView={setActiveView} />
                        </motion.div>
                    )}

                    {tickets?.some(t => t.ticket_id === activeView) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TicketDetailsWithRole
                                ticket={tickets.find(t => t.ticket_id === activeView)}
                                userRole={userRole || localStorage.getItem('userRole')}
                                setActiveView={setActiveView}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;