import React from 'react'

const ActivityItem = ({ title, description, time }) => (
    <div className="py-3">
      <div className="flex justify-between">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );

export default ActivityItem