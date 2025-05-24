import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import transporter from "../api/config/nodemailer.js";

//controller function for registartion
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input fields
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  // Validate email domain to ensure it ends with @teamkarimganj.com
  if (!email.endsWith('@teamkarimganj.com')) {
    return res
      .status(400)
      .json({ 
        success: false, 
        message: "Email must end with @teamkarimganj.com domain." 
      });
  }

  try {
    let userExists;

    // Check if the user already exists
    try {
      const existingUser = await pool.query(
        "SELECT user_id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User already exists. Please login instead.",
        });
      }
    } catch (dbError) {
      console.error("Database Error: Unable to check existing user", dbError);
      return res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later.",
      });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a 6-digit OTP for email verification
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    let newUser;
    // Insert the new user into the database inside try-catch
    try {
      newUser = await pool.query(
        `INSERT INTO users (username, email, password, otp, otp_expiry, isVerified)
         VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING user_id, role`,
        [username, email, hashedPassword, otp, otpExpiry]
      );
    } catch (dbError) {
      console.error("Database Error: Unable to insert new user", dbError);
      return res.status(500).json({
        success: false,
        message: "User registration failed. Please try again later.",
      });
    }

    const user = newUser.rows[0];

    // Generate a JWT token for authentication
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // Set JWT as a secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure flag for production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
    });

    // Send OTP to user's email for verification
    try {
      await transporter.sendMail({
        from: process.env.SENDER_MAIL,
        to: email,
        subject: "Verify Your Email",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
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
                <h2 style="margin: 0 0 20px; color: #333333; font-weight: 600; font-size: 24px; text-align: center;">Verify Your Email Address</h2>
                <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">Hello <strong>${username}</strong>,</p>
                <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">Thanks for signing up! To complete your registration, please enter the verification code below:</p>
                <div style="margin: 30px 0; padding: 20px; background-color: #f5f8ff; border-radius: 6px; text-align: center;">
                  <p style="margin: 0; letter-spacing: 6px; font-size: 32px; font-weight: 700; color: #1a73e8; font-family: monospace;">${otp}</p>
                </div>
                <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">This verification code will expire in <strong>10 minutes</strong>.</p>
                <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">If you didn't request this verification, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 30px; background-color: #f5f5f5; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; color: #777777; font-size: 14px;">© ${new Date().getFullYear()} StackIT Name. All rights reserved.</p>
                <p style="margin: 10px 0 0; color: #777777; font-size: 14px;">
                  <a href="#" style="color: #1a73e8; text-decoration: none;">Privacy Policy</a> | 
                  <a href="#" style="color: #1a73e8; text-decoration: none;">Terms of Service</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      });
    } catch (mailError) {
      console.error("Email Error: Unable to send OTP", mailError);
      return res.status(500).json({
        success: false,
        message: "Registration successful, but failed to send OTP.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent for verification.",
      token, // Returning token for frontend use
    });
  } catch (error) {
    console.error("Unexpected Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

//Email verification
export const verifyEmail = async (req, res) => {
  console.log("Received OTP verification request:", req.body);

  const { email, otp } = req.body;

  if (!email || !otp) {
    console.log("Missing fields - Email:", email, "OTP:", otp);
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required." });
  }

  try {
    const userQuery = await pool.query(
      "SELECT otp, otp_expiry, isVerified FROM users WHERE email = $1",
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email." });
    }

    const user = userQuery.rows[0];

    if (user.isverified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified. You can log in now.",
      });
    }

    if (new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. Please enter the correct code.",
      });
    }

    await pool.query(
      "UPDATE users SET isVerified = TRUE, otp = NULL, otp_expiry = NULL WHERE email = $1",
      [email]
    );

    console.log(`✅ Email verified successfully for: ${email}`);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

//contoller function for login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  // Validate email domain to ensure it ends with @teamkarimganj.com
  if (!email.endsWith('@teamkarimganj.com')) {
    return res
      .status(400)
      .json({ 
        success: false, 
        message: "Email must end with @teamkarimganj.com domain." 
      });
  }

  try {
    let user;

    try {
      const userQuery = await pool.query(
        "SELECT user_id, username, email, password, isverified, role, status FROM users WHERE email = $1",
        [email]
      );

      if (userQuery.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      user = userQuery.rows[0];
    } catch (dbError) {
      console.error("Database Error: Unable to fetch user", dbError);
      return res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later.",
      });
    }

    if (user.status === "restricted") {
      return res.status(403).json({
        success: false,
        message: "Your account has been restricted. Contact support for help.",
      });
    }

    // if (!user.isverified) {
    //   return res.status(403).json({
    //     success: false,
    //     message:
    //       "Email not verified. Please verify your email before logging in.",
    //   });
    // }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role, isverified: user.isverified, },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      isverified: user.isverified, // ✅ Correct
      role: user.role
    });    
  } catch (error) {
    console.error("Unexpected Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

//controller function to send verification email after login
export const sendVerificationEmail = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    let email;

    // Fetch user email from database
    try {
      const userQuery = `SELECT email FROM users WHERE user_id = $1;`;
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rowCount === 0) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      email = userResult.rows[0].email;
    } catch (dbError) {
      console.error("Database error fetching user email:", dbError);
      return res.status(500).json({ success: false, message: "Error retrieving user email." });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Update the OTP in the database
    try {
      const updateOtpQuery = `
        UPDATE users 
        SET otp = $1, otp_expiry = $2 
        WHERE user_id = $3;
      `;
      await pool.query(updateOtpQuery, [otp, otpExpires, userId]);
    } catch (dbError) {
      console.error("Database error updating OTP:", dbError);
      return res.status(500).json({ success: false, message: "Error updating OTP in database." });
    }
    // Email options
    const mailOptions = {
      from: process.env.SENDER_MAIL, // Update with actual email
      to: email,
      subject: "Your Email Verification Code",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
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
                <h2 style="margin: 0 0 20px; color: #333333; font-weight: 600; font-size: 24px; text-align: center;">Verify Your Email Address</h2>
                <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">Hello,</p>
                <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">Thanks for signing up! To complete your registration, please enter the verification code below:</p>
                <div style="margin: 30px 0; padding: 20px; background-color: #f5f8ff; border-radius: 6px; text-align: center;">
                  <p style="margin: 0; letter-spacing: 6px; font-size: 32px; font-weight: 700; color: #1a73e8; font-family: monospace;">${otp}</p>
                </div>
                <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">This verification code will expire in <strong>10 minutes</strong>.</p>
                <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.5;">If you didn't request this verification, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 30px; background-color: #f5f5f5; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; color: #777777; font-size: 14px;">© ${new Date().getFullYear()} StackIT Name. All rights reserved.</p>
                <p style="margin: 10px 0 0; color: #777777; font-size: 14px;">
                  <a href="#" style="color: #1a73e8; text-decoration: none;">Privacy Policy</a> | 
                  <a href="#" style="color: #1a73e8; text-decoration: none;">Terms of Service</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Send email using the imported transporter
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return res.status(500).json({ success: false, message: "Error sending verification email." });
    }

    return res.status(200).json({ success: true, message: "Verification email sent successfully." });

  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};
