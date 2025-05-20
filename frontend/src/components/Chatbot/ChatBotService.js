/**
 * Service for communicating with the AI chatbot backend
 */

// Base API URL - replace with your actual API endpoint
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Send a message to the AI chatbot and get a response
 * 
 * @param {string} message - The user's message
 * @param {Array} history - Previous chat history for context
 * @param {string} token - User authentication token
 * @returns {Promise} - Promise resolving to the AI response
 */
export const sendMessageToAI = async (message, history = [], token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/chatbot`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        history: history.slice(-10), // Send only last 10 messages for context
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error communicating with chatbot service');
    }
    
    return await response.json();
  } catch (error) {
    console.error('ChatBot API Error:', error);
    throw error;
  }
};

/**
 * Analyze user's IT issue and suggest solutions
 * 
 * @param {string} issueDescription - Detailed description of IT issue
 * @param {string} token - User authentication token
 * @returns {Promise} - Promise resolving to suggested solutions
 */
export const analyzeITIssue = async (issueDescription, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/chatbot/analyze-issue`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        issueDescription,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error analyzing IT issue');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Issue Analysis Error:', error);
    throw error;
  }
};

/**
 * Create a support ticket through the chatbot
 * 
 * @param {Object} ticketData - Ticket information
 * @param {string} token - User authentication token
 * @returns {Promise} - Promise resolving to ticket creation result
 */
export const createSupportTicket = async (ticketData, token) => {
  if (!token) {
    throw new Error('Authentication required to create a support ticket');
  }
  
  try {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(ticketData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating support ticket');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ticket Creation Error:', error);
    throw error;
  }
};

/**
 * Get ticket status through the chatbot
 * 
 * @param {string} ticketId - ID of the ticket to check
 * @param {string} token - User authentication token
 * @returns {Promise} - Promise resolving to ticket status
 */
export const getTicketStatus = async (ticketId, token) => {
  if (!token) {
    throw new Error('Authentication required to check ticket status');
  }
  
  try {
    const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching ticket status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ticket Status Error:', error);
    throw error;
  }
};

export default {
  sendMessageToAI,
  analyzeITIssue,
  createSupportTicket,
  getTicketStatus,
};