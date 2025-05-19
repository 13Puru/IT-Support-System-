// src/utils/auth.js
export const isAuthenticated = () => {
    return localStorage.getItem("userToken") !== null;  // Check if token exists
};
