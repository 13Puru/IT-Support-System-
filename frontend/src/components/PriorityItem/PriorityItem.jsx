import React from 'react'

const PriorityItem = ({ id, title, department, priority }) => (
  <div className="py-3">
    <div className="flex justify-between mb-1">
      <span className="text-xs font-medium text-gray-500">{id}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${priority === 'high' ? 'bg-red-100 text-red-800' :
        priority === 'medium' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
        {priority}
      </span>
    </div>
    <p className="text-sm font-medium text-gray-800">{title}</p>
    <p className="text-xs text-gray-600 mt-1">Department: {department}</p>
  </div>
);

export default PriorityItem