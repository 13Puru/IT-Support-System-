import React from "react";
import { motion } from "framer-motion";
import { Users, Shield, Award, Globe, ChevronRight } from "lucide-react";
import { Link } from 'react-router-dom';

// Assumed path to your assets - update as needed
import TeamImage from "/src/assets/it-support.png";
import OfficeImage from "/src/assets/ticket-tracking.png";

const ValueCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
    <div className="flex items-start gap-4">
      <div className="bg-indigo-100 p-3 rounded-full">
        <Icon size={24} className="text-indigo-700" />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const TeamMember = ({ name, role, image }) => (
  <div className="text-center">
    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-200">
      <img 
        src={image || `/api/placeholder/128/128`} 
        alt={name} 
        className="w-full h-full object-cover"
      />
    </div>
    <h3 className="font-semibold text-gray-800">{name}</h3>
    <p className="text-sm text-gray-600">{role}</p>
  </div>
);

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Reliability",
      description: "We build trust through consistent performance and unwavering dedication to resolving IT challenges."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Our commitment to quality drives us to continuously improve our platform and customer experience."
    },
    {
      icon: Users,
      title: "Customer-First",
      description: "Every feature we develop and decision we make centers around our users' needs and feedback."
    },
    {
      icon: Globe,
      title: "Innovation",
      description: "We're constantly pushing boundaries to bring you the most advanced IT support solutions."
    }
  ];
  
  const team = [
    { name: "Sarah Johnson", role: "CEO & Founder" },
    { name: "Michael Chen", role: "CTO" },
    { name: "Aisha Patel", role: "Head of Product" },
    { name: "David Rodriguez", role: "Lead Developer" }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Hero Section */}
      <header className="max-w-6xl mx-auto pt-16 pb-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            About <span className="text-indigo-700">StackIt</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            We're on a mission to transform IT support from a frustrating experience into a 
            <span className="font-semibold text-indigo-600"> seamless, efficient process</span> for teams of all sizes.
          </p>
        </motion.div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        {/* Our Story Section */}
        <section className="mb-24">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-700 opacity-5 rounded-xl"></div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 p-8">
              <div className="md:w-1/2">
                <motion.img 
                  src={TeamImage || `/api/placeholder/600/400`} 
                  alt="StackIt Team" 
                  className="rounded-lg shadow-xl max-w-full h-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="md:w-1/2 text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  StackIt was born from a simple frustration: why is IT support still so complicated? 
                  Founded in 2021, we set out to build a platform that eliminates the confusion and delays
                  of traditional ticketing systems.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Today, we're proud to help over <span className="font-semibold text-indigo-600">500 organizations</span> streamline
                  their IT operations and deliver better support experiences.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values Section */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ValueCard {...value} />
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Our Team Section */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Meet Our Team</h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Our talented team brings together expertise in development, design, and customer support
            to deliver an exceptional IT support platform.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <TeamMember {...member} />
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/careers" className="inline-flex items-center text-indigo-700 font-medium hover:text-indigo-800">
              Join our growing team <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </section>
        
        {/* Office Section */}
        <section>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-700 opacity-5 rounded-xl"></div>
            <div className="relative flex flex-col-reverse md:flex-row items-center justify-between gap-12 p-8">
              <div className="md:w-1/2 text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Headquarters</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Located in the heart of San Francisco, our office is a hub of innovation and collaboration.
                  We've created a space that inspires creativity and fosters the development of cutting-edge
                  IT support solutions.
                </p>
                <address className="not-italic text-gray-600">
                  <p>123 Tech Boulevard</p>
                  <p>San Francisco, CA 94103</p>
                  <p className="mt-2">
                    <a href="mailto:contact@stackit.com" className="text-indigo-700 hover:text-indigo-800">
                      contact@stackit.com
                    </a>
                  </p>
                </address>
              </div>
              <div className="md:w-1/2">
                <motion.img 
                  src={OfficeImage || `/api/placeholder/600/400`} 
                  alt="StackIt Office" 
                  className="rounded-lg shadow-xl max-w-full h-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}