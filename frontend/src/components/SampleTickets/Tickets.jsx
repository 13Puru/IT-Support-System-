

const tickets = [
    {
      id: "TK-1001",
      ticket_id: "TK-1001",
      subject: "Network connectivity issue",
      issue: "Users in the marketing department cannot connect to the internal network.",
      status: "yet_to_open",
      priority: "high",
      category: "Network",
      created_at: new Date().toISOString(),
      created_by: "John Doe",
      assigned_to: "Network Team",
      responses: [],
      replies: []
    },
    {
      id: "TK-1002",
      ticket_id: "TK-1002",
      subject: "Email not syncing on mobile",
      issue: "Email app on mobile devices is not syncing with the server.",
      status: "in_progress",
      priority: "medium",
      category: "Software",
      created_at: new Date().toISOString(),
      created_by: "Jane Smith",
      assigned_to: "IT Support",
      responses: [
        {
          response_id: "RS-001",
          responder: "IT Support",
          response: "We are investigating the issue. Please provide your device model.",
          created_at: new Date().toISOString()
        }
      ],
      replies: []
    },
    {
      id: "TK-1003",
      ticket_id: "TK-1003",
      subject: "Printer configuration needed",
      issue: "New printer needs to be configured for the finance department.",
      status: "yet_to_open",
      priority: "low",
      category: "Hardware",
      created_at: new Date().toISOString(),
      created_by: "Robert Johnson",
      assigned_to: null,
      responses: [],
      replies: []
    },
    {
      id: "TK-1004",
      ticket_id: "TK-1004",
      subject: "Software license expired",
      issue: "Adobe Creative Suite license has expired for the design team.",
      status: "resolved",
      priority: "medium",
      category: "Software",
      created_at: new Date().toISOString(),
      created_by: "Emily Chen",
      assigned_to: "License Management",
      responses: [
        {
          response_id: "RS-002",
          responder: "License Management",
          response: "New licenses have been purchased and will be deployed within 24 hours.",
          created_at: new Date().toISOString()
        }
      ],
      replies: [
        {
          reply_id: "RP-001",
          replier: "Emily Chen",
          reply: "Thank you for the quick response.",
          created_at: new Date().toISOString()
        }
      ]
    },
    {
      id: "TK-1005",
      ticket_id: "TK-1005",
      subject: "New laptop setup required",
      issue: "New hire needs laptop setup with standard software package.",
      status: "yet_to_open",
      priority: "high",
      category: "Hardware",
      created_at: new Date().toISOString(),
      created_by: "Michael Wilson",
      assigned_to: null,
      responses: [],
      replies: []
    },
  ];

export default tickets