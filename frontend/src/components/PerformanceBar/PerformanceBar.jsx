import React from 'react'

const PerformanceBar = ({ team, value, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-600">{team}</span>
      <span className="text-sm font-medium text-gray-800">{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${color} rounded-full h-2`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default PerformanceBar