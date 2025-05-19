import React, { useState, useEffect } from "react";
import { Search, Filter, MessageCircle, Eye, ThumbsUp, Users, Clock, ChevronRight, Tag, PlusCircle } from "lucide-react";

// Mock data for categories
const categories = [
  { id: 1, name: "JavaScript", count: 152, color: "bg-yellow-100 text-yellow-800" },
  { id: 2, name: "React", count: 89, color: "bg-blue-100 text-blue-800" },
  { id: 3, name: "Node.js", count: 74, color: "bg-green-100 text-green-800" },
  { id: 4, name: "Python", count: 63, color: "bg-purple-100 text-purple-800" },
  { id: 5, name: "DevOps", count: 47, color: "bg-red-100 text-red-800" },
  { id: 6, name: "Databases", count: 42, color: "bg-orange-100 text-orange-800" }
];

// Mock data for discussion topics
const initialTopics = [
  {
    id: 1,
    title: "Best practices for React hooks in production applications",
    author: "Alexandra Chen",
    avatar: "/api/placeholder/32/32",
    category: "React",
    tags: ["hooks", "performance", "best-practices"],
    replies: 24,
    views: 342,
    likes: 57,
    lastActive: "2 hours ago",
    isHot: true,
    isPinned: true
  },
  {
    id: 2,
    title: "Setting up CI/CD pipeline with GitHub Actions and AWS",
    author: "Marcus Johnson",
    avatar: "/api/placeholder/32/32",
    category: "DevOps",
    tags: ["aws", "github-actions", "ci-cd"],
    replies: 18,
    views: 215,
    likes: 42,
    lastActive: "5 hours ago",
    isHot: true,
    isPinned: false
  },
  {
    id: 3,
    title: "Optimizing MongoDB queries for large datasets",
    author: "Sarah Williams",
    avatar: "/api/placeholder/32/32",
    category: "Databases",
    tags: ["mongodb", "performance", "queries"],
    replies: 31,
    views: 278,
    likes: 39,
    lastActive: "1 day ago",
    isHot: false,
    isPinned: false
  },
  {
    id: 4,
    title: "Understanding async/await patterns in JavaScript",
    author: "David Lee",
    avatar: "/api/placeholder/32/32",
    category: "JavaScript",
    tags: ["async", "promises", "es6"],
    replies: 42,
    views: 456,
    likes: 83,
    lastActive: "3 days ago",
    isHot: true,
    isPinned: false
  },
  {
    id: 5,
    title: "Python data processing with Pandas: Tips and Tricks",
    author: "Emma Rodriguez",
    avatar: "/api/placeholder/32/32",
    category: "Python",
    tags: ["pandas", "data-science", "performance"],
    replies: 29,
    views: 312,
    likes: 64,
    lastActive: "4 days ago",
    isHot: false,
    isPinned: false
  },
  {
    id: 6,
    title: "Building real-time applications with Socket.io and Node.js",
    author: "James Taylor",
    avatar: "/api/placeholder/32/32",
    category: "Node.js",
    tags: ["socket.io", "real-time", "websockets"],
    replies: 36,
    views: 289,
    likes: 51,
    lastActive: "1 week ago",
    isHot: false,
    isPinned: false
  }
];

// Category Badge Component
const CategoryBadge = ({ name, color }) => (
  <span className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}>
    {name}
  </span>
);

// Topic Tag Component
const TopicTag = ({ name }) => (
  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
    {name}
  </span>
);

// Discussion Topic Card Component
const TopicCard = ({ topic }) => (
  <div className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${topic.isPinned ? 'bg-indigo-50' : ''}`}>
    <div className="p-4">
      <div className="flex items-start">
        <div className="hidden sm:block mr-4">
          <img src={topic.avatar} alt={topic.author} className="w-10 h-10 rounded-full" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {topic.isPinned && (
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-md font-medium">
                Pinned
              </span>
            )}
            {topic.isHot && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md font-medium">
                Hot
              </span>
            )}
            <CategoryBadge 
              name={topic.category} 
              color={categories.find(c => c.name === topic.category)?.color || "bg-gray-100 text-gray-800"} 
            />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-indigo-700 transition-colors">
            {topic.title}
          </h3>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {topic.tags.map((tag, idx) => (
              <TopicTag key={idx} name={tag} />
            ))}
          </div>
          
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
            <span className="flex items-center">
              <Users size={16} className="mr-1" />
              <span>By {topic.author}</span>
            </span>
            <span className="flex items-center">
              <MessageCircle size={16} className="mr-1" />
              <span>{topic.replies} replies</span>
            </span>
            <span className="flex items-center">
              <Eye size={16} className="mr-1" />
              <span>{topic.views} views</span>
            </span>
            <span className="flex items-center">
              <ThumbsUp size={16} className="mr-1" />
              <span>{topic.likes} likes</span>
            </span>
            <span className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>{topic.lastActive}</span>
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center ml-2">
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>
    </div>
  </div>
);

// Main Discussion Forum Component
export default function DiscussionForum() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [topics, setTopics] = useState(initialTopics);
  
  // Filter topics based on search, category, and activity filter
  useEffect(() => {
    let filteredTopics = [...initialTopics];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTopics = filteredTopics.filter(topic => 
        topic.title.toLowerCase().includes(query) || 
        topic.tags.some(tag => tag.toLowerCase().includes(query)) ||
        topic.category.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filteredTopics = filteredTopics.filter(topic => 
        topic.category === selectedCategory
      );
    }
    
    // Apply activity filter
    switch (activeFilter) {
      case "hot":
        filteredTopics = filteredTopics.filter(topic => topic.isHot);
        break;
      case "pinned":
        filteredTopics = filteredTopics.filter(topic => topic.isPinned);
        break;
      case "popular":
        filteredTopics.sort((a, b) => b.likes - a.likes);
        break;
      case "newest":
        // In a real app, you'd sort by date
        filteredTopics.sort((a, b) => {
          if (a.lastActive.includes("hour") && b.lastActive.includes("day")) return -1;
          if (a.lastActive.includes("day") && b.lastActive.includes("hour")) return 1;
          if (a.lastActive.includes("hour") && b.lastActive.includes("hour")) {
            return parseInt(a.lastActive) - parseInt(b.lastActive);
          }
          return 0;
        });
        break;
      default:
        // Sort pinned topics first by default
        filteredTopics.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    }
    
    setTopics(filteredTopics);
  }, [searchQuery, selectedCategory, activeFilter]);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discussion Forum</h1>
        <p className="text-gray-600">
          Join conversations with the developer community. Ask questions, share knowledge, and connect with peers.
        </p>
      </div>
      
      {/* Search and filter section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative inline-block">
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm px-3 py-2">
              <Filter size={18} className="text-gray-500 mr-2" />
              <select
                className="block appearance-none bg-transparent pr-8 focus:outline-none"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Topics</option>
                <option value="hot">Hot Topics</option>
                <option value="pinned">Pinned</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Most Recent</option>
              </select>
            </div>
          </div>
          
          <button className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center px-4 py-2 rounded-md font-medium transition-colors duration-200">
            <PlusCircle size={18} className="mr-2" />
            <span>New Discussion</span>
          </button>
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Tag size={18} className="mr-2" />
                Categories
              </h3>
            </div>
            <div className="p-2">
              <button 
                className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-150 ${selectedCategory === null ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-150 ${selectedCategory === category.name ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="bg-gray-100 text-gray-700 rounded-full text-xs px-2 py-0.5">
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main discussions list */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {topics.length > 0 ? (
              topics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))
            ) : (
              <div className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No discussions found</h3>
                <p className="text-gray-500">Try adjusting your search or filters, or start a new discussion.</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-1">
              <button className="px-3 py-2 rounded-md text-gray-500 hover:bg-gray-100">Previous</button>
              <button className="px-3 py-2 rounded-md bg-indigo-50 text-indigo-700 font-medium">1</button>
              <button className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">2</button>
              <button className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">3</button>
              <span className="px-2">...</span>
              <button className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">10</button>
              <button className="px-3 py-2 rounded-md text-gray-500 hover:bg-gray-100">Next</button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}