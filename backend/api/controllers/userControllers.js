import pool from "../config/database.js";
import transporter from "../config/nodemailer.js";
import bcrypt from "bcryptjs";

//Controller function to get user details
export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const userId = req.user.user_id;
    let userResult;

    // ✅ Fetch user details from `users` table
    try {
      const userQuery = `
        SELECT 
          user_id, username, status, isverified, role, created_at, email
        FROM users
        WHERE user_id = $1;
      `;
      userResult = await pool.query(userQuery, [userId]);
    } catch (err) {
      console.error("❌ Database Error (User Query):", err);
      return res.status(500).json({ success: false, message: "Failed to fetch user details" });
    }

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: userResult.rows[0],
    });

  } catch (error) {
    console.error("❌ Unexpected Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// create user controller function
export const createUser = async (req, res) => {
  const { username, email, password, department, role } = req.body;

  // Ensure only admin or agent can create a user
  if (req.user.role !== "admin" && req.user.role !== "agent") {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Only Admins & Agents can create users",
    });
  }

  // Prevent agents from creating admin or agent roles
  if (req.user.role === "agent" && (role === "admin" || role === "agent")) {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Agents cannot create Admin or Agent roles",
    });
  }

  // Check for missing fields
  if (!username || !email || !password || !role) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const client = await pool.connect();
    await client.query("BEGIN"); // Start transaction

    // Check if the user already exists
    const existingUser = await client.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rowCount > 0) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set isverified based on role
    const isVerified = role === "admin" || role === "agent";

    // Insert new user into database
    const userQuery = `
      INSERT INTO users (username, email, password, role, isverified) 
      VALUES ($1, $2, $3, $4, $5) RETURNING user_id, role;
    `;
    const userResult = await client.query(userQuery, [
      username,
      email,
      hashedPassword,
      role,
      isVerified,
    ]);
    const userId = userResult.rows[0].user_id;

    // Insert into department table ONLY if department is NOT NULL
    if (department) {
      const deptQuery = `
        INSERT INTO department (user_id, department) 
        VALUES ($1, $2);
      `;
      await client.query(deptQuery, [userId, department]);
    }

    await client.query("COMMIT"); // Commit transaction

    // Send email notification to user with login credentials
    await transporter.sendMail({
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "Your Account Has Been Created",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Creation Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #1a73e8; border-radius: 8px 8px 0 0;">
              <span style="font-size: 1.875rem; font-weight: bold;">
                <span style="color: #4f46e5;">Stack</span>
                <span style="color: #1f2937;">IT</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-weight: 600; font-size: 24px; text-align: center;">Account Created Successfully</h2>
              <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">Dear ${username},</p>
              <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">Your account has been successfully created with the following credentials:</p>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #f5f8ff; border-radius: 6px;">
                <table width="100%" style="color: #555555; font-size: 16px;">
                  <tr>
                    <td style="padding: 10px 0;"><strong>Username:</strong> ${username}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Email:</strong> ${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Password:</strong> ${password}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Role:</strong> ${role}</td>
                  </tr>
                </table>
              </div>
      
              <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">
                ${role.toLowerCase() === 'user' 
                  ? 'Please verify your email to continue using your account.' 
                  : 'Note: Verification is not required for agent/admin roles.'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f5f5f5; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #777777; font-size: 14px;">© ${new Date().getFullYear()} StackIT. All rights reserved.</p>
              <p style="margin: 10px 0 0; color: #777777; font-size: 14px;">
                <a href="#" style="color: #1a73e8; text-decoration: none;">Privacy Policy</a> | 
                <a href="#" style="color: #1a73e8; text-decoration: none;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>`,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully. Login credentials sent via email.",
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error("Create User Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Restrict users login
export const restrictUser = async (req, res) => {
  try {
    const { user_id } = req.params; 

    // Ensure the admin is authorized
    if (req.user.role !== "admin" && req.user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can restrict users",
      });
    }

    // Update the user's status to 'restricted'
    const query = `UPDATE users SET status = 'restricted' WHERE user_id = $1 RETURNING *`;
    const result = await pool.query(query, [user_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User has been restricted successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Restrict User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Un-restrict user login
export const unrestrictUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (req.user.role !== "admin" && req.user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can unrestrict users",
      });
    }

    const query = `UPDATE users SET status = 'active' WHERE user_id = $1 RETURNING *`;
    const result = await pool.query(query, [user_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User has been unrestricted successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Unrestrict User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Controller function to get all users (admin/agent access only)
export const getAllUsers = async (req, res) => {
  try {
    // Ensure the user is authenticated and has the right privileges
    if (req.user.role !== "admin" && req.user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin or agent access required",
      });
    }

    let usersQuery;
    
    try {
      // For admin users, show all users except other admins
      // For agents, only show regular users
      const excludeRoles = req.user.role === "admin" ? ["admin"] : ["admin", "agent"];
      
      // Fetch users with required fields
      usersQuery = await pool.query(
        `SELECT 
          user_id, 
          username, 
          email, 
          role, 
          status,
          isverified, 
          created_at 
        FROM users 
        WHERE role != ALL($1)
        ORDER BY created_at DESC`,
        [excludeRoles]
      );
    } catch (dbError) {
      console.error("❌ Database Query Error:", dbError);
      return res
        .status(500)
        .json({ success: false, message: "Database query failed" });
    }

    // Return the list of users (even if empty)
    return res.status(200).json({
      success: true,
      users: usersQuery.rows,
    });
  } catch (error) {
    console.error("❌ Unexpected Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
