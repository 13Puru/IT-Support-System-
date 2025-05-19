import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


function Otp() {
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState(""); // State for email
    const navigate = useNavigate();
    const API_VERIFY_EMAIL = import.meta.env.VITE_EMAIL_VERIFY

    // Retrieve email on component mount
    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        if (!storedEmail) {
            alert("No email found. Redirecting...");
            navigate("/register"); // Redirect to signup/login if missing
        }
        setEmail(storedEmail);
    }, [navigate]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!email || !otp.trim()) {
            alert("Email or OTP missing");
            return;
        }

        try {
            const response = await axios.post(API_VERIFY_EMAIL, {
                email,
                otp: otp.trim(), // Trim whitespace
            });

            console.log("Response:", response.data);
            alert("OTP Verified Successfully!");
            navigate("/login");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Verification failed");
        }
    };

    return (
        <section className="bg-gradient-to-br from-purple-500 to-blue-600 min-h-screen flex justify-center items-center">
            <div className="bg-white rounded-lg flex max-w-lg p-8 items-center shadow-2xl">
                <div className="w-full px-10">
                    <h2 className="font-extrabold text-4xl text-gray-800">OTP Verification</h2>
                    <p className="text-md mt-4 text-gray-600">Enter the OTP sent to {email}</p>
                    <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6 mt-6">
                        <input
                            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            className="bg-blue-600 text-white py-3 rounded-lg hover:scale-105 transition-transform duration-300 hover:bg-blue-800 font-semibold"
                            type="submit"
                        >
                            Verify OTP
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default Otp;