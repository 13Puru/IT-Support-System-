import React from 'react'

const ActivityLogItem = ({ user, action, time }) => (
    <div className="border-l-2 border-indigo-100 pl-4 py-2 mb-2">
      <p className="text-sm text-gray-800"><span className="font-medium">{user}</span></p>
      <p className="text-sm text-gray-700">{action}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  );

export default ActivityLogItem