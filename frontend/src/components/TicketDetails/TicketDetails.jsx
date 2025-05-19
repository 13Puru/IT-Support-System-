import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Card from "../Card/Card";
import ChatMessage from "../ChatMessage/ChatMessage";
import InfoCard from "../InfoCard/InfoCard";
import ActivityLogItem from "../ActivityLogItem/ActivityLogItem";
import actionColors from "../Colors/actionColors";
import {
    ArrowLeft,
    UserPlus,
    MessageCircle,
    CheckCircle,
    XCircle,
    RefreshCw,
    User,
    Lock,
    Calendar
} from "lucide-react";

const TicketDetails = ({ ticket, onAssign, onSelfAssign, onResolve, onClose, isAuthorized, setActiveView }) => {
    // State for modal visibility
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    // Agents state declaration
    const [agents, setAgents] = useState([]);
    // State for loading agents
    const [isLoading, setIsLoading] = useState(false);
    // Search term state
    const [searchTerm, setSearchTerm] = useState("");
    // Local ticket state to enable refreshing UI
    const [currentTicket, setCurrentTicket] = useState(ticket);
    // State for comment text
    const [commentText, setCommentText] = useState("");
    // State to track selected response for replying
    const [selectedResponseId, setSelectedResponseId] = useState(null);
    // Action in progress state (similar to ViewUsers)
    const [actionInProgress, setActionInProgress] = useState(false);
    // Overall loading state
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    const API_GET_ALL_USER = import.meta.env.VITE_GET_ALL;
    const API_GET_TICKET = import.meta.env.VITE_GET_TICKET;
    const API_RESPOND = import.meta.env.VITE_RESPOND;
    const API_REPLY = import.meta.env.VITE_REPLY;
    const API_ASSIGN = import.meta.env.VITE_ASSIGN;
    const API_RESOLVE = import.meta.env.VITE_RESOLVE;
    const API_CLOSE = import.meta.env.VITE_CLOSE;
    const API_SELF_ASSIGN = import.meta.env.VITE_SELF_ASSIGN;

    // Update local ticket state when prop changes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentTicket.responses, currentTicket.replies]);
    useEffect(() => {
        setCurrentTicket(ticket);
    }, [ticket]);

    // Fetch agents data
    useEffect(() => {
        const fetchAgents = async () => {
            const token = localStorage.getItem("userToken");
            setIsLoading(true);

            try {
                const response = await axios.get(API_GET_ALL_USER, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Access the users array from the response object
                const usersArray = response.data.users || [];

                // Filter users with role "agent"
                const filteredAgents = usersArray.filter(user => user.role === "agent");
                setAgents(filteredAgents);
                toast.dismiss();
            } catch (error) {
                console.error("Error fetching agents:", error);
                toast.error("Failed to fetch agents list");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAssignModalOpen) {
            fetchAgents();
        }
    }, [isAssignModalOpen, API_GET_ALL_USER]);

    // Helper function to fetch updated ticket data
    const refreshTicketData = async () => {
        const token = localStorage.getItem("userToken");
        setLoading(true);

        try {
            const response = await axios.get(`${API_GET_TICKET}?ticket_id=${currentTicket.ticket_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && response.data.ticket) {
                // Normalize the status to lowercase for consistent comparison
                const normalizedTicket = {
                    ...response.data.ticket,
                    status: response.data.ticket.status.toLowerCase()
                };

                setCurrentTicket(normalizedTicket);
                toast.dismiss();
                return normalizedTicket;
            }
        } catch (error) {
            console.error("Error refreshing ticket data:", error);
            toast.error("Failed to refresh ticket data. Please try again.");
        } finally {
            setLoading(false);
        }

        return null;
    };

    // Handle undefined or null ticket
    if (!currentTicket) return (
        <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No ticket selected</p>
        </div>
    );

    // Ensure responses and replies exist
    const responses = currentTicket.responses || [];
    const replies = currentTicket.replies || [];

    // Handle agent assignment
    const handleAssign = async (agentId) => {
        if (window.confirm("Are you sure you want to assign this ticket?")) {
            try {
                setActionInProgress(true);
                const token = localStorage.getItem("userToken");

                if (!token) {
                    toast.error("Authentication token is missing. Please log in again.");
                    setActionInProgress(false);
                    return;
                }

                const response = await axios.post(
                    API_ASSIGN,
                    {
                        ticket_id: currentTicket.ticket_id,
                        assigned_to: agentId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    // Find agent name for UI update
                    const assignedAgent = agents.find(agent => agent.user_id === agentId);
                    const agentName = assignedAgent ? assignedAgent.username : "Unknown";

                    // Update local ticket state immediately for better UX
                    setCurrentTicket(prevTicket => ({
                        ...prevTicket,
                        assigned_to: agentName,
                        last_action: "assigned" // Update last action
                    }));

                    // Close modal first for smoother UX
                    setIsAssignModalOpen(false);

                    // Then refresh ticket data from server to get all updated fields
                    const updatedTicket = await refreshTicketData();
                    toast.success("Ticket assigned successfully");

                    // Call the onAssign callback to update parent component
                    if (onAssign) onAssign(currentTicket.ticket_id, agentId, updatedTicket);
                } else {
                    toast.error("Failed to assign ticket: " + (response.data.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Error assigning ticket:", error);

                // Enhanced error handling
                if (error.response) {
                    console.error("Error details:", error.response.data);
                    toast.error(`Failed to assign ticket: ${error.response.data.message || "Unknown error"}`);
                } else {
                    toast.error("Failed to assign ticket. Network error.");
                }
            } finally {
                setActionInProgress(false);
            }
        }
    };

    // Handle self assignment
    const handleSelfAssign = async () => {
        try {
            setActionInProgress(true);
            const token = localStorage.getItem('userToken'); // Get the auth token

            if (!token) {
                toast.error("User not authenticated. Please log in.");
                setActionInProgress(false);
                return;
            }

            // Optimistically update UI
            setCurrentTicket(prevTicket => ({
                ...prevTicket,
                assigned_to: "Self", // Temporary placeholder until we refresh
                last_action: "self-assigned"
            }));

            const response = await axios.post(
                API_SELF_ASSIGN,
                { ticket_id: currentTicket.ticket_id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data.success) {
                const updatedTicket = await refreshTicketData(); // Refresh ticket details after assignment
                toast.success("Ticket self-assigned successfully");
                if (onSelfAssign) onSelfAssign(currentTicket.ticket_id, updatedTicket);
            } else {
                toast.error(response.data.message || "Failed to self-assign ticket.");
                // Revert optimistic update
                await refreshTicketData();
            }
        } catch (error) {
            console.error("Error self-assigning ticket:", error);
            toast.error("Failed to self-assign ticket. Please try again.");
            // Revert optimistic update
            await refreshTicketData();
        } finally {
            setActionInProgress(false);
        }
    };

    const handleResolve = async () => {
        if (window.confirm("Are you sure you want to mark this ticket as resolved?")) {
            try {
                setActionInProgress(true);
                const token = localStorage.getItem("userToken");

                // Optimistically update UI
                setCurrentTicket(prevTicket => ({
                    ...prevTicket,
                    status: "resolved",
                    last_action: "resolved"
                }));

                const response = await axios.post(
                    API_RESOLVE,
                    { ticket_id: currentTicket.ticket_id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    const updatedTicket = await refreshTicketData();
                    toast.success("Ticket marked as resolved");
                    if (onResolve) onResolve(currentTicket.ticket_id, updatedTicket);
                } else {
                    toast.error(response.data.message || "Failed to resolve ticket");
                    // Revert optimistic update
                    await refreshTicketData();
                }
            } catch (error) {
                console.error("Error resolving ticket:", error);
                toast.error("Something went wrong. Please try again.");
                // Revert optimistic update
                await refreshTicketData();
            } finally {
                setActionInProgress(false);
            }
        }
    };

    // Handle close ticket
    const handleClose = async () => {
        if (window.confirm("Are you sure you want to close this ticket?")) {
            try {
                setActionInProgress(true);
                const token = localStorage.getItem("userToken");

                // Optimistically update UI
                setCurrentTicket(prevTicket => ({
                    ...prevTicket,
                    status: "closed",
                    last_action: "closed"
                }));

                const response = await axios.post(
                    API_CLOSE,
                    { ticket_id: currentTicket.ticket_id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    // Get the fully updated ticket from server
                    const updatedTicket = await refreshTicketData();

                    // Explicitly enforce the closed status in the UI
                    if (updatedTicket) {
                        setCurrentTicket(prevTicket => ({
                            ...updatedTicket,
                            status: "closed"  // Force status to be closed
                        }));
                    }

                    toast.success("Ticket closed successfully");
                    if (onClose) onClose(currentTicket.ticket_id, updatedTicket);
                } else {
                    toast.error(response.data.message || "Failed to close ticket");
                    // Revert optimistic update
                    await refreshTicketData();
                }
            } catch (error) {
                console.error("Error closing ticket:", error);
                toast.error("Something went wrong. Please try again.");
                // Revert optimistic update
                await refreshTicketData();
            } finally {
                setActionInProgress(false);
            }
        }
    };

    // Select a response to reply to
    const handleSelectResponse = (responseId) => {
        setSelectedResponseId(responseId);
    };

    // Handle comment submission
    const handleAddComment = async () => {
        if (!commentText.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        try {
            setActionInProgress(true);
            const token = localStorage.getItem("userToken");
            const userRole = localStorage.getItem('userRole');

            if (userRole === "user") {
                // For user role, submit a reply to a response

                // Determine which response_id to use
                let responseIdToUse = selectedResponseId;

                // If no response is selected, use the most recent one
                if (!responseIdToUse && responses.length > 0) {
                    responseIdToUse = responses[0].response_id;
                }

                // Validate that we have a response to reply to
                if (!responseIdToUse) {
                    toast.error("No response available to reply to");
                    setActionInProgress(false);
                    return;
                }

                // Optimistically add the reply to UI
                const tempReplyId = `temp-${Date.now()}`;
                const tempReply = {
                    reply_id: tempReplyId,
                    reply: commentText,
                    replier: "You", // Since this is the current user
                    created_at: new Date().toISOString()
                };

                setCurrentTicket(prevTicket => ({
                    ...prevTicket,
                    replies: [tempReply, ...(prevTicket.replies || [])],
                    last_action: "replied"
                }));

                // Handle reply submission
                await axios.post(
                    API_REPLY,
                    {
                        response_id: responseIdToUse,
                        reply: commentText
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Reset form state
                setSelectedResponseId(null);
                setCommentText("");
                toast.success("Reply added successfully");

            } else {
                // Optimistically add the response to UI for agents/admins
                const tempResponseId = `temp-${Date.now()}`;
                const tempResponse = {
                    response_id: tempResponseId,
                    response: commentText,
                    responder: "You", // Since this is the current user
                    created_at: new Date().toISOString()
                };

                setCurrentTicket(prevTicket => ({
                    ...prevTicket,
                    responses: [tempResponse, ...(prevTicket.responses || [])],
                    last_action: "responded"
                }));

                // Handle response submission for agents/admins
                await axios.post(
                    API_RESPOND,
                    {
                        ticket_id: currentTicket.ticket_id,
                        response: commentText
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Reset form state
                setCommentText("");
                toast.success("Response added successfully");
            }

            // Refresh ticket data to show actual data with proper IDs
            await refreshTicketData();

        } catch (error) {
            console.error("Error adding comment:", error);
            if (error.response) {
                console.error("Error details:", error.response.data);
                toast.error(`Failed to add comment: ${error.response.data.message || "Unknown error"}`);
            } else {
                toast.error("Failed to add comment. Please try again.");
            }
            // Revert optimistic update
            await refreshTicketData();
        } finally {
            setActionInProgress(false);
        }
    };

    // Filter agents based on search term
    const filteredAgents = agents.filter(agent =>
        agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCombinedMessages = () => {
        const currentUser = localStorage.getItem('username') || 'You';
        const userRole = localStorage.getItem('userRole');

        // Map responses to a common format
        const responseMessages = (currentTicket.responses || []).map(response => ({
            id: `response-${response.response_id}`,
            content: response.response,
            sender: response.responder,
            timestamp: response.created_at,
            type: 'response',
            isUser: userRole !== 'user' && response.responder === currentUser
        }));

        // Map replies to a common format
        const replyMessages = (currentTicket.replies || []).map(reply => ({
            id: `reply-${reply.reply_id}`,
            content: reply.reply,
            sender: reply.replier,
            timestamp: reply.created_at,
            type: 'reply',
            isUser: userRole === 'user' && reply.replier === currentUser
        }));

        // Combine both types of messages
        const allMessages = [...responseMessages, ...replyMessages];

        // Sort by timestamp, newest at the bottom
        return allMessages.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            try {
                                setActiveView("dashboard");
                            } catch (error) {
                                console.error("Error setting active view:", error);
                                toast.error("Unable to navigate back to dashboard");
                            }
                        }}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{currentTicket.subject}</h1>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`text-sm px-3 py-1 rounded-full ${currentTicket.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : currentTicket.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : currentTicket.status === "closed"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                    >
                        {currentTicket.status}
                    </span>

                    {/* Display last action */}
                    {currentTicket.last_action && (
                        <span
                            className={`text-sm px-3 py-1 rounded-full ${actionColors[currentTicket.last_action] || 'bg-gray-100 text-gray-800'}`}
                        >
                            {currentTicket.last_action}
                        </span>
                    )}

                    {/* Only show these buttons for authorized users */}
                    {isAuthorized && !loading && !actionInProgress && (
                        <>
                            <button
                                onClick={() => setIsAssignModalOpen(true)}
                                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors flex items-center"
                                disabled={actionInProgress || loading}
                            >
                                <UserPlus size={16} className="mr-1" />
                                Assign Ticket
                            </button>
                            <button
                                onClick={handleSelfAssign}
                                className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded hover:bg-indigo-200 transition-colors flex items-center"
                                disabled={actionInProgress || loading}
                            >
                                <User size={16} className="mr-1" />
                                Self Assign
                            </button>
                        </>
                    )}

                    {(loading || actionInProgress) && (
                        <div className="flex items-center text-indigo-600">
                            <RefreshCw size={16} className="mr-1 animate-spin" />
                            <span className="text-sm">Processing...</span>
                        </div>
                    )}

                    <button
                        onClick={refreshTicketData}
                        className="p-2 text-gray-500 hover:text-indigo-600 rounded-full"
                        disabled={loading || actionInProgress}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <InfoCard label="Ticket ID" value={currentTicket.ticket_id} />
                </div>
                <div>
                    <InfoCard
                        label="Priority"
                        value={currentTicket.priority}
                        className={
                            currentTicket.priority === "high"
                                ? "text-red-600"
                                : currentTicket.priority === "medium"
                                    ? "text-orange-600"
                                    : "text-gray-600"
                        }
                    />
                </div>
                <div>
                    <InfoCard label="Category" value={currentTicket.category || "N/A"} />
                </div>
                <div>
                    <InfoCard
                        label="Created"
                        value={currentTicket.created_at ? new Date(currentTicket.created_at).toLocaleString() : "N/A"}
                    />
                </div>
                <div>
                    <InfoCard label="Created By" value={currentTicket.created_by || "Unknown"} />
                </div>
                <div>
                    <InfoCard label="Assigned To" value={currentTicket.assigned_to || "Unassigned"} />
                </div>
            </div>

            <div>
                <Card title="Description">
                    <p className="text-sm text-gray-700">{currentTicket.issue || "No description available."}</p>
                </Card>
            </div>

            <div className="mt-6">
                <Card title="Conversation">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="rounded-full h-8 w-8 border-b-2 border-indigo-700 animate-spin"></div>
                        </div>
                    ) : getCombinedMessages().length > 0 ? (
                        <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                            {getCombinedMessages().map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message.content}
                                    isUser={message.isUser}
                                    timestamp={message.timestamp}
                                    sender={message.sender}
                                />
                            ))}
                            {/* Auto-scroll to bottom reference */}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 p-4">
                            No messages yet. Start the conversation by adding a response.
                        </p>
                    )}
                </Card>
            </div>

            {currentTicket.last_action !== "closed" && (
                <div className="mt-6">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-4 flex items-end">
                            <textarea
                                rows="2"
                                className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={localStorage.getItem('userRole') === "user" ? "Type your reply..." : "Type your response..."}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            ></textarea>
                            <button
                                type="button"
                                onClick={handleAddComment}
                                className="ml-3 px-4 py-2 bg-indigo-700 rounded-lg text-sm font-medium text-white hover:bg-indigo-800 transition-colors flex items-center"
                                disabled={(localStorage.getItem('userRole') === "user" && responses.length === 0) || actionInProgress || loading}
                            >
                                <MessageCircle size={16} className="mr-2" />
                                Send
                            </button>
                        </div>

                        {/* Ticket action buttons */}
                        <div className="border-t border-gray-200 p-3 bg-gray-50 flex justify-end gap-2">
                            {isAuthorized && (
                                <button
                                    onClick={handleResolve}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors flex items-center"
                                    disabled={currentTicket.status === "resolved" || actionInProgress || loading}
                                >
                                    <CheckCircle size={16} className="mr-2" />
                                    Mark as Resolved
                                </button>
                            )}

                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors flex items-center"
                                disabled={currentTicket.status === "closed" || actionInProgress || loading}
                            >
                                <XCircle size={16} className="mr-2" />
                                Close Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-30"
                            aria-hidden="true"
                            onClick={() => setIsAssignModalOpen(false)}
                        ></div>

                        {/* Modal positioning */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        {/* Actual modal */}
                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-6 py-4 flex justify-between items-center border-b border-indigo-800">
                                <h2 className="text-lg font-semibold text-white">
                                    Assign Ticket #{currentTicket.ticket_id}
                                </h2>
                                <button
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="px-6 pt-5 pb-2">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Search agents..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Agent List */}
                            <div className="px-6 py-3">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="rounded-full h-8 w-8 border-b-2 border-indigo-700 animate-spin"></div>
                                    </div>
                                ) : filteredAgents.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-gray-100">
                                        <ul className="divide-y divide-gray-200">
                                            {filteredAgents.map((agent) => (
                                                <li
                                                    key={agent.user_id}
                                                    className="py-3 hover:bg-indigo-50 transition-colors rounded-md px-2"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center hover:bg-indigo-400 transition-colors">
                                                                <span className="text-white font-medium text-sm">
                                                                    {agent.username ? agent.username.substring(0, 2).toUpperCase() : "??"}
                                                                </span>
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">{agent.username || "Unknown Agent"}</p>
                                                                <p className="text-sm text-gray-500">{agent.email || "No email"}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                handleAssign(agent.user_id);
                                                                toast.success(`Ticket assigned to ${agent.username}`);
                                                            }}
                                                            className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                        >
                                                            Assign
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchTerm ? "No agents match your search" : "No agents available"}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 flex justify-end border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setIsAssignModalOpen(false);
                                        toast.info("Assignment canceled");
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDetails;