import React from "react";

const ChatMessage = ({ message, isUser, timestamp, sender }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2">
          <span className="text-white text-xs font-bold">
            {sender.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      <div className={`max-w-[70%]`}>
        {!isUser && (
          <div className="text-xs text-gray-500 ml-2 mb-1">{sender}</div>
        )}
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? "bg-indigo-600 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          <p className="text-sm">{message}</p>
        </div>
        <div
          className={`text-xs text-gray-500 mt-1 ${
            isUser ? "text-right mr-2" : "ml-2"
          }`}
        >
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center ml-2">
          <span className="text-white text-xs font-bold">YOU</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;