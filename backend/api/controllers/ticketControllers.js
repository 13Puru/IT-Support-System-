import pool from "../api/config/database.js";//database connection
import fs from 'fs';
import path from 'path';

//Controller Function to create ticket
export const createTicket = async (req, res) => {
  const { subject, issue, category, priority } = req.body;
  const userId = req.user?.user_id;
  const isVerified = req.user?.isverified;
  
  // Extract file information if a file was uploaded
  const attachment = req.file ? {
    path: req.file.path,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : null;

  // 1️⃣ **Validate Required Fields**
  if (!subject || !issue) {
    // If file was uploaded but validation failed, remove the file
    if (attachment) {
      try {
        fs.unlinkSync(attachment.path);
        console.log('❌ File removed due to validation failure');
      } catch (err) {
        console.error('Error removing file:', err);
      }
    }
    return res.status(422).json({ success: false, message: "Subject and issue are required." });
  }
  
  if (!userId) {
    if (attachment) {
      try {
        fs.unlinkSync(attachment.path);
      } catch (err) {
        console.error('Error removing file:', err);
      }
    }
    return res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
  }
  
  if (!isVerified) {
    if (attachment) {
      try {
        fs.unlinkSync(attachment.path);
      } catch (err) {
        console.error('Error removing file:', err);
      }
    }
    return res.status(403).json({ success: false, message: "Email not verified. Please verify before creating a ticket." });
  }

  try {
    // 2️⃣ **Generate Ticket ID in Format: TK-2025-XX-001**
    const year = new Date().getFullYear();
    // Use first two characters of category (uppercase) for the ID
    const categoryInitials = category ? category.substring(0, 2).toUpperCase() : "OT"; // Default to "OT" if no category
    
    // 🔹 **Fetch Last Ticket for Serial Numbering**
    const latestTicketQuery = `
      SELECT ticket_id FROM tickets 
      WHERE ticket_id LIKE 'TK-${year}-${categoryInitials}-%' 
      ORDER BY ticket_id DESC 
      LIMIT 1;
    `;
    const latestTicket = await pool.query(latestTicketQuery);

    let serialNumber = "001";
    if (latestTicket.rows.length > 0) {
      const lastSerial = parseInt(latestTicket.rows[0].ticket_id.split("-")[3]) + 1;
      serialNumber = String(lastSerial).padStart(3, "0");
    }

    const ticketId = `TK-${year}-${categoryInitials}-${serialNumber}`;

    // Store file path in database or just the filename - adjust based on your DB schema
    const attachmentData = attachment ? JSON.stringify(attachment) : null;

    // 3️⃣ **Insert Ticket into Database**
    const insertTicketQuery = `
      INSERT INTO tickets (ticket_id, subject, issue, created_by, status, category, priority, attachments) 
      VALUES ($1, $2, $3, $4, 'yet_to_open', $5, $6, $7) 
      RETURNING *;
    `;
    const newTicket = await pool.query(insertTicketQuery, [
      ticketId, subject, issue, userId, category, priority, attachmentData,
    ]);

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      ticket: newTicket.rows[0],
    });

  } catch (error) {
    // If any error occurs, remove the uploaded file to free up disk space
    if (attachment) {
      try {
        fs.unlinkSync(attachment.path);
        console.log('❌ File removed due to error');
      } catch (err) {
        console.error('Error removing file:', err);
      }
    }
    
    console.error("❌ Database Error: Unable to create ticket", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create ticket. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

//Controller function to get-tickets
export const getTickets = async (req, res) => {
  try {
    const { role, user_id } = req.user;
    let query = "";
    let values = [];

    if (!role || !user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User details missing",
      });
    }

    if (role === "admin") {
      query = `
        SELECT 
          t.ticket_id, t.subject, t.issue, t.status, t.priority, t.last_action, t.category, t.created_at, t.updated_at,
          u.username AS created_by, a.username AS assigned_to,
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'response_id', r.response_id,
              'responder', ru.username,
              'response', r.response,
              'response_type', r.response_type,
              'created_at', r.created_at
            )
          ) FILTER (WHERE r.response_id IS NOT NULL), '[]') AS responses,
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'reply_id', rp.reply_id,
              'replier', ru2.username,
              'reply', rp.reply,
              'created_at', rp.created_at
            )
          ) FILTER (WHERE rp.reply_id IS NOT NULL), '[]') AS replies
        FROM tickets t
        JOIN users u ON t.created_by = u.user_id
        LEFT JOIN users a ON t.assigned_to = a.user_id
        LEFT JOIN responses r ON t.ticket_id = r.ticket_id
        LEFT JOIN users ru ON r.responder = ru.user_id
        LEFT JOIN replies rp ON r.response_id = rp.response_id
        LEFT JOIN users ru2 ON rp.user_id = ru2.user_id
        GROUP BY t.ticket_id, u.username, a.username
        ORDER BY t.created_at DESC;
      `;
    } else if (role === "agent") {
      query = `
        SELECT 
          t.ticket_id, t.subject, t.issue, t.status, t.priority, t.last_action, t.category, t.created_at, t.updated_at,
          u.username AS created_by, a.username AS assigned_to,
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'response_id', r.response_id,
              'responder', ru.username,
              'response', r.response,
              'response_type', r.response_type,
              'created_at', r.created_at
            )
          ) FILTER (WHERE r.response_id IS NOT NULL), '[]') AS responses,
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'reply_id', rp.reply_id,
              'replier', ru2.username,
              'reply', rp.reply,
              'created_at', rp.created_at
            )
          ) FILTER (WHERE rp.reply_id IS NOT NULL), '[]') AS replies
        FROM tickets t
        JOIN users u ON t.created_by = u.user_id
        LEFT JOIN users a ON t.assigned_to = a.user_id
        LEFT JOIN responses r ON t.ticket_id = r.ticket_id
        LEFT JOIN users ru ON r.responder = ru.user_id
        LEFT JOIN replies rp ON r.response_id = rp.response_id
        LEFT JOIN users ru2 ON rp.user_id = ru2.user_id
        WHERE t.assigned_to IS NULL OR t.assigned_to = $1
        GROUP BY t.ticket_id, u.username, a.username
        ORDER BY t.created_at DESC;
      `;
      values = [user_id];
    } else {
      query = `
        SELECT 
          t.ticket_id, t.subject, t.issue, t.status, t.priority,t.last_action, t.category, t.created_at, t.updated_at,
          u.username AS created_by, a.username AS assigned_to,
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'response_id', r.response_id,
              'responder', ru.username,
              'response', r.response,
              'response_type', r.response_type,
              'created_at', r.created_at
            )
          ) FILTER (WHERE r.response_id IS NOT NULL), '[]') AS responses,
          COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'reply_id', rp.reply_id,
              'replier', ru2.username,
              'reply', rp.reply,
              'created_at', rp.created_at
            )
          ) FILTER (WHERE rp.reply_id IS NOT NULL), '[]') AS replies
        FROM tickets t
        JOIN users u ON t.created_by = u.user_id
        LEFT JOIN users a ON t.assigned_to = a.user_id
        LEFT JOIN responses r ON t.ticket_id = r.ticket_id
        LEFT JOIN users ru ON r.responder = ru.user_id
        LEFT JOIN replies rp ON r.response_id = rp.response_id
        LEFT JOIN users ru2 ON rp.user_id = ru2.user_id
        WHERE t.created_by = $1
        GROUP BY t.ticket_id, u.username, a.username
        ORDER BY t.created_at DESC;
      `;
      values = [user_id];
    }

    try {
      const tickets = await pool.query(query, values);
      return res.status(200).json({
        success: true,
        message: "Tickets fetched successfully",
        tickets: tickets.rows,
      });
    } catch (dbError) {
      console.error("Database Query Error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database error: Unable to fetch tickets",
      });
    }
  } catch (error) {
    console.error("Get Tickets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Controller function to assign-tickets
export const assignTickets = async (req, res) => {
  try {
    const { ticket_id, assigned_to } = req.body;
    const { role, user_id } = req.user;

    if (!ticket_id) {
      return res.status(400).json({ success: false, message: "Ticket ID is required" });
    }

    let assignTo = user_id; // Default: Agents self-assign

    if (role === "admin") {
      if (!assigned_to) {
        return res.status(400).json({ success: false, message: "Agent ID is required for assignment" });
      }
      assignTo = assigned_to;
    } else if (role !== "agent") {
      return res.status(403).json({ success: false, message: "Access Denied: Only Admins & Agents can assign tickets" });
    }

    try {
      const { rows } = await pool.query(
        `SELECT assigned_to, LOWER(status) AS status, LOWER(last_action) AS last_action FROM tickets WHERE ticket_id = $1`, 
        [ticket_id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
      }

      const { assigned_to: existingAssigned, status, last_action } = rows[0];

      // Prevent reassignment if already assigned/self-assigned
      if (existingAssigned && (last_action === "assigned" || last_action === "self-assigned")) {
        return res.status(400).json({ success: false, message: "Ticket is already assigned and cannot be reassigned" });
      }

      // Always set status to "in_progress" when assigning a ticket
      const newStatus = "in_progress";

      const updateQuery = `
        UPDATE tickets 
        SET assigned_to = $1, status = $2, last_action = 'assigned', updated_at = CURRENT_TIMESTAMP
        WHERE ticket_id = $3 
        RETURNING *`;

      const { rows: updatedRows } = await pool.query(updateQuery, [assignTo, newStatus, ticket_id]);

      return res.status(200).json({
        success: true,
        message: "Ticket assigned successfully",
        ticket: updatedRows[0],
      });

    } catch (dbError) {
      console.error("Database Error:", dbError);
      return res.status(500).json({ success: false, message: "Database error: Unable to process request" });
    }

  } catch (error) {
    console.error("Assign Ticket Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//Controller function to update tickets / respond to tickets
export const updateTicket = async (req, res) => {
  try {
    const { ticket_id, response, status } = req.body; // Get ticket_id, response text, and optional status
    const { user_id, role } = req.user; // Extract user info from middleware

    // Ensure only admins and agents can respond
    if (!["admin", "agent"].includes(role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Only admin or agent can respond" });
    }

    // Validate required fields
    if (!ticket_id || !response) {
      return res.status(400).json({ success: false, message: "ticket_id and response are required" });
    }

    // Start a database transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert response into `responses` table
      const insertResponseQuery = `
        INSERT INTO responses (ticket_id, responder, response, response_type) 
        VALUES ($1, $2, $3, $4) RETURNING response_id, ticket_id, responder, response, response_type, created_at, updated_at;
      `;
      const responseValues = [ticket_id, user_id, response, role];
      const responseResult = await client.query(insertResponseQuery, responseValues);

      // Fetch responder's username
      const fetchResponderQuery = `SELECT username FROM users WHERE user_id = $1`;
      const responderResult = await client.query(fetchResponderQuery, [user_id]);
      const responderUsername = responderResult.rows[0]?.username || "Unknown";

      // Update ticket status if provided
      if (status) {
        const updateTicketQuery = `UPDATE tickets SET status = $1, updated_at = NOW() WHERE ticket_id = $2`;
        await client.query(updateTicketQuery, [status, ticket_id]);
      }

      await client.query("COMMIT"); // Commit transaction

      return res.status(200).json({
        success: true,
        message: "Response added successfully",
        response: {
          ...responseResult.rows[0],
          responder_username: responderUsername, // Include responder's username
        },
      });
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction in case of an error
      console.error("Database Transaction Error:", error);
      return res.status(500).json({ success: false, message: "Database error: Unable to update ticket" });
    } finally {
      client.release(); // Release database connection
    }
  } catch (error) {
    console.error("Update Ticket Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//Controller function to reply to responses
export const replyToResponse = async (req, res) => {
  try {
    const { response_id, reply } = req.body;
    const { user_id } = req.user; // Extract authenticated user info

    // Validate input
    if (!response_id || !reply) {
      return res.status(400).json({ success: false, message: "response_id and reply are required" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN"); // Start transaction

      // Insert reply into replies table
      const insertReplyQuery = `
        INSERT INTO replies (response_id, user_id, reply) 
        VALUES ($1, $2, $3) 
        RETURNING reply_id, response_id, user_id, reply, created_at;
      `;
      const replyValues = [response_id, user_id, reply];
      const replyResult = await client.query(insertReplyQuery, replyValues);

      // Fetch username of the user who replied
      const getUsernameQuery = `
        SELECT username FROM users WHERE user_id = $1;
      `;
      const usernameResult = await client.query(getUsernameQuery, [user_id]);

      await client.query("COMMIT"); // Commit transaction

      return res.status(201).json({
        success: true,
        message: "Reply added successfully",
        reply: {
          ...replyResult.rows[0],
          username: usernameResult.rows[0]?.username || "Unknown",
        },
      });
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction if an error occurs
      console.error("Database Transaction Error:", error);
      return res.status(500).json({ success: false, message: "Database error: Unable to add reply" });
    } finally {
      client.release(); // Release database connection
    }
  } catch (error) {
    console.error("Reply to Response Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getTicketStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const userId = req.user.user_id;

    const ticketStatsQuery = `
      SELECT 
        COUNT(*) AS created_tickets, -- All tickets created by the user
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) AS resolved_tickets,
        COUNT(CASE WHEN status = 'yet_to_open' THEN 1 END) AS pending_tickets
      FROM tickets
      WHERE created_by = $1;
    `;

    const ticketStatsResult = await pool.query(ticketStatsQuery, [userId]);

    return res.status(200).json({
      success: true,
      ticket_status: {
        created_tickets: ticketStatsResult.rows[0]?.created_tickets || 0,
        resolved_tickets: ticketStatsResult.rows[0]?.resolved_tickets || 0,
        pending_tickets: ticketStatsResult.rows[0]?.pending_tickets || 0,
      }
    });

  } catch (error) {
    console.error("❌ Error fetching ticket stats:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const fetchTicketDetails = async (req, res) => {
  try {
    // SQL query to fetch all tickets with details needed for statistics
    const ticketsQuery = `
      SELECT 
        t.id,
        t.title,
        t.status,
        t.priority,
        t.department,
        t.created_at,
        t.updated_at,
        t.resolved_at,
        t.closed_at,
        t.last_action,
        u.name AS assigned_to_name,
        u.department AS assigned_to_department,
        (SELECT COUNT(*) > 0 FROM ticket_comments tc WHERE tc.ticket_id = t.id) AS has_comments
      FROM 
        tickets t
      LEFT JOIN 
        users u ON t.assigned_to = u.id
      ORDER BY 
        t.updated_at DESC
    `;
    
    // Execute the query
    const { rows } = await pool.query(ticketsQuery);
    
    // Format the data for frontend consumption
    const formattedTickets = rows.map(ticket => {
      return {
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        department: ticket.department,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        resolvedAt: ticket.resolved_at,
        closedAt: ticket.closed_at,
        assignedTo: ticket.assigned_to_name,
        assignedToDepartment: ticket.assigned_to_department,
        lastAction: ticket.last_action,
        hasComments: ticket.has_comments
      };
    });
    
    // Return the formatted data with status code 200 OK
    return res.status(200).json(formattedTickets);
  } catch (error) {
    console.error('Error in fetchTicketDetails:', error);
    
    // Return error with status code 500 Internal Server Error
    return res.status(500).json({
      error: 'Failed to fetch ticket details',
      message: error.message
    });
  }
};

//resolve ticket controller function
export const resolveTicket = async (req, res) => {
  try {
    const { ticket_id } = req.body;
    const { user_id } = req.user; // Authenticated user

    if (!ticket_id) {
      return res.status(400).json({ success: false, message: "Ticket ID is required" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updateQuery = `
        UPDATE tickets 
        SET status = 'resolved', last_action = 'resolved', updated_by = $1, updated_at = NOW()
        WHERE ticket_id = $2
        RETURNING ticket_id, status, last_action, updated_by, updated_at;
      `;

      const result = await client.query(updateQuery, [user_id, ticket_id]);

      await client.query("COMMIT");

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Ticket resolved successfully",
        ticket: result.rows[0],
      });

    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error resolving ticket:", error);
      return res.status(500).json({ success: false, message: "Database error: Unable to resolve ticket" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Resolve Ticket Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//close ticket controller function
export const closeTicket = async (req, res) => {
  try {
    const { ticket_id } = req.body;

    if (!ticket_id) {
      return res.status(400).json({ success: false, message: "Ticket ID is required" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updateQuery = `
        UPDATE tickets 
        SET status = 'closed', last_action = 'closed', closed_at = NOW(), updated_at = NOW()
        WHERE ticket_id = $1
        RETURNING ticket_id, last_action, closed_at, updated_at;
      `;

      const result = await client.query(updateQuery, [ticket_id]);

      await client.query("COMMIT");

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Ticket closed successfully",
        ticket: result.rows[0],
      });

    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error closing ticket:", error);
      return res.status(500).json({ success: false, message: "Database error: Unable to close ticket" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Close Ticket Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//controller function to self assign a ticket
export const selfAssignTicket = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { ticket_id } = req.body;

    if (!ticket_id) {
      return res.status(400).json({ success: false, message: "Ticket ID is required" });
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    console.log("User ID:", userId);
    console.log("Received Ticket ID:", ticket_id);

    try {
      // Fetch ticket details
      const ticketCheckQuery = `SELECT assigned_to, status, LOWER(last_action) AS last_action FROM tickets WHERE ticket_id = $1`;
      const { rows } = await pool.query(ticketCheckQuery, [ticket_id]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
      }

      const { assigned_to, last_action, status } = rows[0];

      // Prevent reassignment if already assigned/self-assigned (case-insensitive check)
      if (assigned_to && (last_action === "assigned" || last_action === "self-assigned")) {
        return res.status(400).json({ success: false, message: "Ticket is already assigned" });
      }

      // Set status to 'in_progress' only if it's 'new'
      const newStatus = status.toLowerCase() === "yet_to_open" ? "in_progress" : status;

      // Assign ticket to the user
      const assignQuery = `
        UPDATE tickets 
        SET assigned_to = $1, status = $2, last_action = 'Self-assigned', updated_at = NOW() 
        WHERE ticket_id = $3 
        RETURNING *;
      `;

      const { rows: updatedRows } = await pool.query(assignQuery, [userId, newStatus, ticket_id]);

      return res.status(200).json({
        success: true,
        message: "Ticket self-assigned successfully",
        ticket: updatedRows[0],
      });

    } catch (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ success: false, message: "Database error: Unable to process request" });
    }

  } catch (error) {
    console.error("Self-Assign Ticket Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};




