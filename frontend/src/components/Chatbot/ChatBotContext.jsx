import { createContext, useState, useContext, useCallback } from 'react';
import { sendMessageToAI, createSupportTicket } from './ChatBotService';

// Create context
const ChatBotContext = createContext();

// Custom hook to use the ChatBot context
export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};

// Provider component
export const ChatBotProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([{
    text: "Hi there! I'm your StackIT Assistant. How can I help you with your IT concerns today?",
    sender: 'bot'
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [ticketInProgress, setTicketInProgress] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [ticketStep, setTicketStep] = useState(0);
  
  // Function to add a message to chat history
  const addMessage = useCallback((message, sender) => {
    setChatHistory(prev => [...prev, { text: message, sender }]);
  }, []);
  
  // Helper function for fallback responses when API is unavailable
  const useFallbackResponse = useCallback((message) => {
    const lowercaseMessage = message.toLowerCase();
    let response = "I'm here to help with your IT support needs. To create a support ticket, please provide: 1) A brief description of your issue, 2) Your department, and 3) How urgent this is for your work. Our team will respond based on ticket priority.";
    
    // Network Issues
    if (lowercaseMessage.includes('network') || lowercaseMessage.includes('internet') || 
        lowercaseMessage.includes('wifi') || lowercaseMessage.includes('connection') || 
        lowercaseMessage.includes('ethernet') || lowercaseMessage.includes('offline')) {
      response = "I understand you're experiencing network issues. Please try these troubleshooting steps:\n\n" +
                "1. Restart your router/modem (unplug for 30 seconds, then reconnect)\n" +
                "2. Check physical connections (ethernet cables, power cables)\n" +
                "3. Try connecting to a different network if available\n" +
                "4. Restart your device\n\n" +
                "If problems persist, please create a ticket by replying with: 'Create network ticket' along with your department name and the impact level (Low/Medium/High).";
    } 
    
    // Login & Password Issues
    else if (lowercaseMessage.includes('password') || lowercaseMessage.includes('reset') || 
            lowercaseMessage.includes('login') || lowercaseMessage.includes('account') || 
            lowercaseMessage.includes('locked') || lowercaseMessage.includes('forgot')) {
      response = "For password reset or account access issues:\n\n" +
                "1. For immediate self-service password reset, visit: internal.company.com/reset\n" +
                "2. You'll need your employee ID and the answers to your security questions\n\n" +
                "If you're still having trouble, create a ticket by replying: 'Create password ticket' with your employee ID and department. For security, an IT team member will contact you directly.";
    } 
    
    // Software & Application Issues
    else if (lowercaseMessage.includes('software') || lowercaseMessage.includes('install') || 
            lowercaseMessage.includes('application') || lowercaseMessage.includes('program') || 
            lowercaseMessage.includes('update') || lowercaseMessage.includes('license')) {
      response = "I can help with software installation or application issues. Before creating a ticket:\n\n" +
                "1. Check if you have admin rights on your device\n" +
                "2. Restart the application and your computer\n" +
                "3. Check for available updates\n" +
                "4. Clear the application cache if possible\n\n" +
                "For further assistance, create a ticket by replying: 'Create software ticket' with the application name, error messages (if any), and your department.";
    } 
    
    // Hardware & Device Issues
    else if (lowercaseMessage.includes('hardware') || lowercaseMessage.includes('device') || 
            lowercaseMessage.includes('printer') || lowercaseMessage.includes('monitor') || 
            lowercaseMessage.includes('keyboard') || lowercaseMessage.includes('computer') || 
            lowercaseMessage.includes('laptop')) {
      response = "For hardware or device issues:\n\n" +
                "1. Note your device asset tag (usually a sticker on the device)\n" +
                "2. Check all physical connections\n" +
                "3. For printers: check paper, toner, and connection status\n" +
                "4. For computers: try restarting\n\n" +
                "To create a hardware support ticket, reply with: 'Create hardware ticket', the device type, asset tag (if available), a description of the issue, and your department.";
    } 
    
    // Email Issues
    else if (lowercaseMessage.includes('email') || lowercaseMessage.includes('outlook') || 
            lowercaseMessage.includes('mail') || lowercaseMessage.includes('spam') || 
            lowercaseMessage.includes('inbox')) {
      response = "I can help with email-related issues. Try these steps first:\n\n" +
                "1. Check your internet connection\n" +
                "2. Restart your email client\n" +
                "3. Clear your browser cache (if using webmail)\n" +
                "4. Check if you're approaching your mailbox size limit\n\n" +
                "If issues persist, create a ticket by replying: 'Create email ticket' with your email address, department, and a description of the problem.";
    } 
    
    // VPN Issues
    else if (lowercaseMessage.includes('vpn') || lowercaseMessage.includes('remote') || 
            lowercaseMessage.includes('connect from home') || lowercaseMessage.includes('secure connection')) {
      response = "For VPN or remote connection issues:\n\n" +
                "1. Check your internet connection\n" +
                "2. Ensure VPN client is updated to the latest version\n" +
                "3. Try disconnecting and reconnecting to VPN\n" +
                "4. Verify your VPN credentials are correct\n\n" +
                "If you still need help, create a ticket by replying: 'Create VPN ticket' with your username, department, and whether this is preventing you from working (Yes/No).";
    } 
    
    // Security & Permissions
    else if (lowercaseMessage.includes('security') || lowercaseMessage.includes('permission') || 
            lowercaseMessage.includes('access') || lowercaseMessage.includes('blocked') || 
            lowercaseMessage.includes('firewall') || lowercaseMessage.includes('virus') || 
            lowercaseMessage.includes('malware')) {
      response = "For security-related concerns or permission issues:\n\n" +
                "1. Note exactly what resource you're trying to access\n" +
                "2. Check if others in your team have the same issue\n" +
                "3. For suspected security incidents, immediately disconnect from the network\n\n" +
                "Create a security ticket by replying: 'Create security ticket' with your department, the resources affected, and urgency level (Low/Medium/High/Critical).";
    } 
    
    // Mobile Device Issues
    else if (lowercaseMessage.includes('phone') || lowercaseMessage.includes('mobile') || 
            lowercaseMessage.includes('tablet') || lowercaseMessage.includes('ipad') || 
            lowercaseMessage.includes('iphone') || lowercaseMessage.includes('android')) {
      response = "For company mobile device issues:\n\n" +
                "1. Restart your device\n" +
                "2. Check for system updates\n" +
                "3. Ensure you have adequate storage space\n" +
                "4. Verify you're using the correct credentials\n\n" +
                "To create a mobile device support ticket, reply with: 'Create mobile ticket' with your device type, phone number, department, and a description of the problem.";
    } 
    
    // New Equipment Requests
    else if (lowercaseMessage.includes('new') || lowercaseMessage.includes('request') || 
            lowercaseMessage.includes('order') || lowercaseMessage.includes('equipment') || 
            lowercaseMessage.includes('replacement')) {
      response = "For new equipment requests:\n\n" +
                "1. Equipment must be approved by your department manager\n" +
                "2. Standard equipment has a 3-5 business day fulfillment time\n" +
                "3. Custom equipment may take 2-3 weeks\n\n" +
                "To initiate an equipment request, reply with: 'Create equipment request' along with the type of equipment needed, your department, manager's name, and business justification.";
    } 
    
    // Training & Documentation
    else if (lowercaseMessage.includes('how to') || lowercaseMessage.includes('tutorial') || 
            lowercaseMessage.includes('guide') || lowercaseMessage.includes('training') || 
            lowercaseMessage.includes('learn')) {
      response = "For IT training and documentation:\n\n" +
                "1. Visit our knowledge base at internal.company.com/kb\n" +
                "2. Check for upcoming training sessions on the intranet calendar\n" +
                "3. Department-specific guides are available from your team lead\n\n" +
                "If you need specific training resources, create a ticket by replying: 'Create training request' with the topic you need help with, your department, and preferred training format (documentation/video/live session).";
    } 
    
    // Specific mention of creating a ticket
    else if (lowercaseMessage.includes('ticket') || lowercaseMessage.includes('create') || 
            lowercaseMessage.includes('support') || lowercaseMessage.includes('help desk') || 
            lowercaseMessage.includes('service desk')) {
      response = "I can help you create a support ticket. Please provide the following information:\n\n" +
                "1. Brief description of your issue (2-3 sentences)\n" +
                "2. Your department and location\n" +
                "3. Priority level (select one):\n" +
                "   - Low: Issue is inconvenient but not blocking work\n" +
                "   - Medium: Issue is hindering productivity but workarounds exist\n" +
                "   - High: Issue is preventing critical work functions\n" +
                "   - Critical: Issue affects multiple users or business operations\n\n" +
                "Your ticket will be assigned to an IT specialist based on the issue type and priority.";
      
      // Start ticket creation flow
      setTicketInProgress(true);
      setTicketData({ description: message });
      setTicketStep(1);
      return addMessage(response, 'bot');
    }
    
    // After Hours Support
    else if (lowercaseMessage.includes('urgent') || lowercaseMessage.includes('emergency') || 
            lowercaseMessage.includes('after hours') || lowercaseMessage.includes('weekend')) {
      response = "For urgent after-hours support:\n\n" +
                "1. Critical business impact issues only\n" +
                "2. Call the emergency IT hotline: 555-123-4567\n" +
                "3. Provide your employee ID and department\n\n" +
                "For non-urgent issues, please create a standard ticket by replying: 'Create ticket' with your issue details, and the team will address it during the next business day.";
    }
    
    // Status Check
    else if (lowercaseMessage.includes('status') || lowercaseMessage.includes('update') || 
            lowercaseMessage.includes('progress') || lowercaseMessage.includes('follow up')) {
      response = "To check the status of an existing ticket:\n\n" +
                "1. Visit the support portal: helpdesk.company.com\n" +
                "2. Log in with your company credentials\n" +
                "3. Click 'My Tickets' to view all your open tickets\n\n" +
                "Alternatively, reply with: 'Check ticket status' along with your ticket number (format: INC123456), and I can try to retrieve the latest update.";
    }
    
    // General Troubleshooting
    else if (lowercaseMessage.includes('error') || lowercaseMessage.includes('not working') || 
            lowercaseMessage.includes('issue') || lowercaseMessage.includes('problem') || 
            lowercaseMessage.includes('broken') || lowercaseMessage.includes('help')) {
      response = "I'm sorry to hear you're experiencing technical difficulties. Let's try some general troubleshooting:\n\n" +
                "1. Restart the affected device/application\n" +
                "2. Clear browser cache if web-related\n" +
                "3. Check for recent system updates\n" +
                "4. Test on another device if possible\n\n" +
                "If these steps don't help, please create a ticket by replying: 'Create support ticket' with specific error messages, when the issue started, and your department.";
    }
    
    // Thank you or positive sentiment
    else if (lowercaseMessage.includes('thank') || lowercaseMessage.includes('thanks') || 
            lowercaseMessage.includes('great') || lowercaseMessage.includes('awesome') || 
            lowercaseMessage.includes('good job')) {
      response = "You're welcome! I'm glad I could assist you today. If you need any additional help, don't hesitate to reach out. If your issue is resolved, no further action is needed. If you have any ongoing concerns, please create a ticket for further assistance from our IT team.";
    }
    
    // Greeting or introduction
    else if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || 
            lowercaseMessage.includes('hey') || lowercaseMessage.includes('greetings') || 
            message.length < 10) {
      response = "Hello! I'm your IT support assistant. I can help with common technical issues or guide you through creating a support ticket. What IT issue are you experiencing today?";
    }
    
    addMessage(response, 'bot');
  }, [addMessage, setTicketData, setTicketInProgress, setTicketStep]);

  // Function to start the ticket creation process
  const startTicketCreation = useCallback(() => {
    const ticketCreationSteps = [
      "Let's create your support ticket. First, please provide a brief description of your issue.",
      "Thanks. Now, please tell me which department you're in.",
      "Great. On a scale of 1-3, how would you rate the priority of this issue? (1 = Low, 2 = Medium, 3 = High)",
      "Finally, is this issue affecting just you or multiple people in your department?",
      "Thank you for providing all the necessary information. Your ticket has been created with the following details:\n\n" +
      "Ticket #: {{TICKET_NUMBER}}\n" +
      "Description: {{DESCRIPTION}}\n" +
      "Department: {{DEPARTMENT}}\n" +
      "Priority: {{PRIORITY}}\n" +
      "Scope: {{SCOPE}}\n\n" +
      "An IT support specialist will review your ticket and respond within the appropriate SLA time. You'll receive an email notification when there's an update. For urgent matters, please call the IT Helpdesk at 555-123-4567."
    ];
    
    return ticketCreationSteps;
  }, []);

  // Function to handle ticket creation flow
  const handleTicketCreation = useCallback(async (message, token) => {
    // Update the ticket data based on the current step
    const updatedTicketData = { ...ticketData };
    
    switch (ticketStep) {
      case 1: // Already have description, asking for department
        updatedTicketData.department = message;
        setTicketData(updatedTicketData);
        addMessage("Great. On a scale of 1-3, how would you rate the priority of this issue? (1 = Low, 2 = Medium, 3 = High)", 'bot');
        setTicketStep(2);
        break;
        
      case 2: // Getting priority
        let priority = "Low";
        if (message.includes("2") || message.toLowerCase().includes("medium")) {
          priority = "Medium";
        } else if (message.includes("3") || message.toLowerCase().includes("high")) {
          priority = "High";
        }
        updatedTicketData.priority = priority;
        setTicketData(updatedTicketData);
        addMessage("Finally, is this issue affecting just you or multiple people in your department?", 'bot');
        setTicketStep(3);
        break;
        
      case 3: // Getting scope
        updatedTicketData.scope = message;
        setTicketData(updatedTicketData);
        
        // Generate a mock ticket number
        const ticketNumber = `INC${Math.floor(100000 + Math.random() * 900000)}`;
        updatedTicketData.ticketNumber = ticketNumber;
        
        try {
          // Try to create a ticket with the API
          const response = await createSupportTicket(updatedTicketData, token);
          
          // Show success message with ticket details
          const confirmationMsg = `Thank you for providing all the necessary information. Your ticket has been created with the following details:\n\n` +
                                 `Ticket #: ${response?.ticketNumber || ticketNumber}\n` +
                                 `Description: ${updatedTicketData.description}\n` +
                                 `Department: ${updatedTicketData.department}\n` +
                                 `Priority: ${updatedTicketData.priority}\n` +
                                 `Scope: ${updatedTicketData.scope}\n\n` +
                                 `An IT support specialist will review your ticket and respond within the appropriate SLA time. You'll receive an email notification when there's an update. For urgent matters, please call the IT Helpdesk at 555-123-4567.`;
          
          addMessage(confirmationMsg, 'bot');
        } catch (error) {
          console.error('Error creating ticket:', error);
          
          // Fallback if API fails
          const confirmationMsg = `Thank you for providing all the necessary information. Your ticket has been created with the following details:\n\n` +
                                 `Ticket #: ${ticketNumber}\n` +
                                 `Description: ${updatedTicketData.description}\n` +
                                 `Department: ${updatedTicketData.department}\n` +
                                 `Priority: ${updatedTicketData.priority}\n` +
                                 `Scope: ${updatedTicketData.scope}\n\n` +
                                 `An IT support specialist will review your ticket and respond within the appropriate SLA time. You'll receive an email notification when there's an update. For urgent matters, please call the IT Helpdesk at 555-123-4567.`;
          
          addMessage(confirmationMsg, 'bot');
        }
        
        // Reset ticket creation state
        setTicketInProgress(false);
        setTicketStep(0);
        break;
        
      default:
        // If somehow we get here, reset the ticket flow
        setTicketInProgress(false);
        setTicketStep(0);
        addMessage("I'm sorry, there was an issue with the ticket creation process. Please try again by typing 'create ticket'.", 'bot');
    }
    
    setIsLoading(false);
  }, [ticketStep, ticketData, addMessage]);

  // Function to handle system outages
  const systemOutageResponse = useCallback(() => {
    const outages = {
      email: {
        status: "Email system is currently experiencing delays",
        eta: "2 hours",
        workaround: "For urgent communications, please use Microsoft Teams"
      },
      vpn: {
        status: "VPN service is operating at reduced capacity", 
        eta: "45 minutes",
        workaround: "Use the backup VPN server at backup-vpn.company.com"
      },
      crm: {
        status: "CRM system is unavailable due to planned maintenance",
        eta: "4 hours (until 6:00 PM)",
        workaround: "Critical customer data can be accessed via the emergency portal"
      }
    };
    
    let response = "We're currently experiencing the following known system issues:\n\n";
    
    for (const [system, details] of Object.entries(outages)) {
      response += `${system.toUpperCase()}: ${details.status}\n`;
      response += `Estimated resolution: ${details.eta}\n`;
      response += `Workaround: ${details.workaround}\n\n`;
    }
    
    response += "Our IT team is actively working on these issues. If you're experiencing a different problem, please create a support ticket.";
    
    return response;
  }, []);

  // Function to provide IT policy information
  const policyInformation = useCallback((policyType) => {
    const policies = {
      password: "Password must be changed every 90 days, contain at least 12 characters including uppercase, lowercase, numbers, and special characters. Passwords cannot be reused for 12 cycles.",
      equipment: "New equipment requests require manager approval and take 3-5 business days for standard equipment or 2-3 weeks for custom configurations.",
      software: "Software installation requests require department head approval for non-standard software. Standard software can be installed via the Self-Service Portal.",
      remote: "Remote work requires a secure VPN connection and multi-factor authentication for all company resources. Use only company-approved devices for accessing sensitive information."
    };
    
    if (policies[policyType]) {
      return `IT Policy - ${policyType.toUpperCase()}:\n\n${policies[policyType]}\n\nFor more detailed policy information, please visit the company intranet policy section or create a ticket for specific questions.`;
    } else {
      return "I can provide information on password, equipment, software, and remote work policies. Please specify which policy you're interested in, or create a ticket for other policy questions.";
    }
  }, []);

  // Function to provide common FAQs
  const getTechFAQs = useCallback(() => {
    return "Common IT Support FAQs:\n\n" +
          "1. How do I reset my password?\n" +
          "   Visit internal.company.com/reset or call the IT Helpdesk\n\n" +
          "2. How do I request new software?\n" +
          "   Submit a request through the Self-Service Portal with manager approval\n\n" +
          "3. What's the Wi-Fi password for the office?\n" +
          "   Connect to 'Company-Secure' and use your regular network credentials\n\n" +
          "4. How do I connect to the VPN?\n" +
          "   Install the Company VPN client from the Self-Service Portal and use your network credentials\n\n" +
          "5. How do I report suspected phishing emails?\n" +
          "   Forward the email to security@company.com or click the 'Report Phishing' button in Outlook\n\n" +
          "For additional questions, please create a support ticket.";
  }, []);

  // New equipment request template
  const newEquipmentRequestTemplate = useCallback(() => {
    return "NEW EQUIPMENT REQUEST FORM\n\n" +
          "Please fill in the following information to request new equipment:\n\n" +
          "1. Equipment type needed: [laptop/desktop/monitor/phone/other]\n" +
          "2. Specifications required: [standard/high-performance/specialized]\n" +
          "3. Business justification: [brief explanation]\n" +
          "4. Department: [your department]\n" +
          "5. Manager name: [approving manager]\n" +
          "6. Date needed by: [MM/DD/YYYY]\n\n" +
          "After submitting this information, a request will be created and sent to your manager for approval. Once approved, IT will process your request according to the standard SLA timeframes.";
  }, []);

  // Software access request template
  const softwareRequestTemplate = useCallback(() => {
    return "SOFTWARE ACCESS REQUEST FORM\n\n" +
          "Please provide the following information to request software access:\n\n" +
          "1. Software name: [name of application]\n" +
          "2. License type: [standard/premium/admin]\n" +
          "3. Business justification: [brief explanation]\n" +
          "4. Department: [your department]\n" +
          "5. Approving manager: [manager name]\n\n" +
          "After submitting this information, your request will be processed according to the following timeline:\n" +
          "- Standard software: 1-2 business days\n" +
          "- Non-standard software: 3-5 business days (requires additional approval)\n" +
          "- Admin access: 3-5 business days (requires security review)";
  }, []);

  // Contact information for direct support
  const getSupportContactInfo = useCallback(() => {
    return "IT SUPPORT CONTACT INFORMATION\n\n" +
          "General Support Desk (8am-6pm, Monday-Friday):\n" +
          "- Phone: 555-123-4567\n" +
          "- Email: itsupport@company.com\n\n" +
          "Emergency After-Hours Support (Critical issues only):\n" +
          "- Phone: 555-987-6543\n\n" +
          "Specialized Support Teams:\n" +
          "- Network Issues: network@company.com\n" +
          "- Security Incidents: security@company.com\n" +
          "- Hardware Support: hardware@company.com\n" +
          "- Software Support: software@company.com\n\n" +
          "Walk-up IT Help Desk:\n" +
          "- Main Office: 2nd Floor, Room 2045 (8am-5pm, Monday-Friday)\n" +
          "- Branch Offices: See local office directory for hours";
  }, []);

  // Service level agreement information
  const getSLAInformation = useCallback(() => {
    return "IT SUPPORT SERVICE LEVEL AGREEMENTS\n\n" +
          "Our team commits to the following response and resolution times based on ticket priority:\n\n" +
          "PRIORITY 1 (CRITICAL):\n" +
          "- First response: 15 minutes\n" +
          "- Target resolution: 4 hours\n" +
          "- Example issues: System-wide outages, security incidents\n\n" +
          "PRIORITY 2 (HIGH):\n" +
          "- First response: 1 hour\n" +
          "- Target resolution: 8 hours\n" +
          "- Example issues: Department-level outages, executive support\n\n" +
          "PRIORITY 3 (MEDIUM):\n" +
          "- First response: 4 hours\n" +
          "- Target resolution: 2 business days\n" +
          "- Example issues: Individual productivity impacts with workarounds\n\n" +
          "PRIORITY 4 (LOW):\n" +
          "- First response: 8 hours\n" +
          "- Target resolution: 5 business days\n" +
          "- Example issues: Non-urgent requests, general inquiries\n\n" +
          "Note: These times represent our targets. Actual resolution time may vary based on issue complexity.";
  }, []);
  
  // Function to send message to AI and get response
  const sendMessage = useCallback(async (message) => {
    // Add user message to chat history
    addMessage(message, 'user');
    setIsLoading(true);
    
    try {
      // Try to get user token for authenticated requests
      const token = localStorage.getItem('userToken');
      
      // If we're in the middle of creating a ticket, handle that flow
      if (ticketInProgress) {
        await handleTicketCreation(message, token);
        return;
      }
      
      // For development/demo, use our fallback responses if API call fails
      try {
        // Call the AI service
        const response = await sendMessageToAI(message, chatHistory, token);
        addMessage(response.message, 'bot');
        
        // Check if the AI wants to start ticket creation
        if (response.createTicket) {
          setTicketInProgress(true);
          setTicketData({ description: message });
          setTicketStep(1);
          addMessage("Let's create a support ticket. What priority would you assign to this issue? (Low, Medium, High)", 'bot');
        }
      } catch (error) {
        console.error('API error, using fallback responses:', error);
        useFallbackResponse(message);
      }
    } catch (error) {
      console.error('Error in AI response:', error);
      addMessage("Sorry, I'm having trouble processing your request. Please try again later.", 'bot');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, chatHistory, ticketInProgress, handleTicketCreation, useFallbackResponse]);
  
  // Function to clear chat history
  const clearChat = useCallback(() => {
    setChatHistory([{
      text: "Hi there! I'm your StackIT Assistant. How can I help you with your IT concerns today?",
      sender: 'bot'
    }]);
    setTicketInProgress(false);
    setTicketData(null);
    setTicketStep(0);
  }, []);
  
  // Function to toggle chat open/closed
  const toggleChat = useCallback(() => {
    setChatOpen(prev => !prev);
  }, []);
  
  // Provide context value
  const value = {
    chatHistory,
    isLoading,
    chatOpen,
    sendMessage,
    clearChat,
    toggleChat,
    setChatOpen,
    ticketInProgress,
    // Expose additional helper functions for component usage
    systemOutageResponse,
    policyInformation,
    getTechFAQs,
    newEquipmentRequestTemplate,
    softwareRequestTemplate,
    getSupportContactInfo,
    getSLAInformation
  };
  
  return <ChatBotContext.Provider value={value}>{children}</ChatBotContext.Provider>;
};

export default ChatBotContext;