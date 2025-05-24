import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import './index.css';

// Import ToastContainer and CSS
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import ChatBotProvider
import { ChatBotProvider } from './components/Chatbot/ChatBotContext';
import EnhancedChatBot from './components/Chatbot/EnhancedChatbot';

import Layout from './Layout';
import Home from './components/Home/Home';
import Contact from './components/Contact/Contact';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Otp from './components/Otp/Otp';
import Dashboard from './components/Dashboard/Dashboard';
import About from './components/About/About';
import DiscussionForum from './components/DiscussionForum/DiscussionForum';

// Function to check if the user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("userToken") !== null;
};

// Protected Route Component
const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <Home /> },
      { path: 'forum', element: <DiscussionForum /> },
      { path: 'contact-us', element: <Contact /> },
      { path: 'about', element: <About /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'otp', element: <Otp /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute />,  // Wrap Dashboard in Protected Route
        children: [{ path: '', element: <Dashboard /> }]
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatBotProvider>
      <RouterProvider router={router} />
      {/* Add EnhancedChatBot here, available on all pages */}
      <EnhancedChatBot />
      {/* Add ToastContainer here, outside of RouterProvider */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ChatBotProvider>
  </StrictMode>
);