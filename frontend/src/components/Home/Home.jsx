import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Clock, BarChart } from "lucide-react";
import {Link} from 'react-router-dom'

// Assumed path to your assets - update as needed
import ITSupportImage from "/src/assets/it-support.png";
import TicketTrackingImage from "/src/assets/ticket-tracking.png";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
    <div className="bg-indigo-100 p-3 rounded-full mb-4">
      <Icon size={24} className="text-indigo-700" />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </div>
);

export default function Home() {
  const features = [
    {
      icon: CheckCircle,
      title: "Easy Ticket Creation",
      description: "Submit and categorize IT issues in seconds with our intuitive interface."
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Receive instant notifications as your support tickets progress through resolution."
    },
    {
      icon: BarChart,
      title: "Performance Insights",
      description: "Track resolution times and team performance with detailed analytics."
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Hero Section */}
      <header className="max-w-6xl mx-auto pt-16 pb-24 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl mx-auto"
        >
          <h1 className="text-5xl font-bold text-indigo-700 mb-6">
            Efficient IT Support, <span className="text-gray-800">Simplified.</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            StackIt ensures seamless IT issue management.
            Whether you're reporting a technical problem or tracking progress,
            our platform provides <span className="font-semibold text-indigo-600">fast and effective solutions</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link to='/register' className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center">
              Get Started <ArrowRight size={16} className="ml-2" />
            </Link>
            <button className="bg-white hover:bg-gray-100 text-indigo-700 border border-indigo-200 px-6 py-3 rounded-md font-medium">
              Watch Demo
            </button>
          </div>
        </motion.div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        {/* Image Section */}
        <div className="relative mb-24">
          <div className="absolute inset-0 bg-indigo-700 opacity-5 rounded-xl"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 p-8">
            <div className="md:w-1/2">
              <motion.img 
                src={ITSupportImage} 
                alt="IT Support Dashboard" 
                className="rounded-lg shadow-xl max-w-full h-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="md:w-1/2 text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">No more long wait times.</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Our intelligent ticketing system automatically routes issues to the right specialist,
                cutting response times by up to <span className="font-semibold text-indigo-600">73%</span>.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Just <span className="font-semibold text-indigo-600">quick, reliable support</span> when you need it most.
              </p>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose StackIt</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Second Image Section */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-indigo-700 opacity-5 rounded-xl"></div>
          <div className="relative flex flex-col-reverse md:flex-row items-center justify-between gap-12 p-8">
            <div className="md:w-1/2 text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Complete Visibility</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Track the status of your tickets in real-time with our intuitive dashboard.
                Never wonder about the progress of your IT issues again.
              </p>
              <div className="flex items-center text-indigo-700 font-semibold">
                <span>Because your time matters.</span>
              </div>
            </div>
            <div className="md:w-1/2">
              <motion.img 
                src={TicketTrackingImage} 
                alt="Ticket Tracking Interface" 
                className="rounded-lg shadow-xl max-w-full h-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}