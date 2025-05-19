import React from 'react'

const InfoCard = ({ label, value, className = "text-gray-800" }) => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${className}`}>{value}</p>
    </div>
  );

export default InfoCard