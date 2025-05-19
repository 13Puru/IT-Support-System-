import React from 'react'

const StatsCard = ({ icon, title, value, trend, trendUp }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-full">
          {icon}
        </div>
      </div>
      <div className={`mt-4 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
        {trend}
      </div>
    </div>
  );

export default StatsCard