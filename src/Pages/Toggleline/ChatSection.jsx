import React, { useState, useRef, useEffect, useCallback } from 'react';

const chatContacts = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Senior Developer',
    email: 'alex.johnson@example.com',
    avatar: 'AJ',
    isOnline: true,
    lastSeen: 'Active now',
    status: 'Available',
    unread: 2
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Product Manager',
    email: 'maria.garcia@example.com',
    avatar: 'MG',
    isOnline: false,
    lastSeen: '2 hours ago',
    status: 'In a meeting',
    unread: 0
  },
  {
    id: '3',
    name: 'Robert Williams',
    role: 'UX Designer',
    email: 'robert.williams@example.com',
    avatar: 'RW',
    isOnline: true,
    lastSeen: 'Active now',
    status: 'Available',
    unread: 1
  },
  {
    id: '4',
    name: 'Sarah Chen',
    role: 'Marketing Director',
    email: 'sarah.chen@example.com',
    avatar: 'SC',
    isOnline: true,
    lastSeen: '30 minutes ago',
    status: 'Do not disturb',
    unread: 0
  },
];

// Professional Color Palette
const colors = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

const emojiCategories = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
  },
  {
    name: 'People',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏']
  },
  {
    name: 'Objects',
    emojis: ['💼', '📁', '📎', '📌', '📝', '📄', '📑', '📊', '📈', '📉', '🗂️', '📂', '📅', '📆', '🗒️', '🗓️', '📋', '📍', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️']
  }
];

const ChatSection = () => {
  const [messages, setMessages] = useState({});
  const [activeContact, setActiveContact] = useState('1');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize conversations with more realistic data
  useEffect(() => {
    const initialMessages = {
      '1': [
        { 
          id: '1_1', 
          text: 'Hey there! 👋 Welcome to our professional chat interface.', 
          sender: 'contact', 
          timestamp: new Date(Date.now() - 3600000),
          type: 'text',
          status: 'read'
        },
        { 
          id: '1_2', 
          text: 'Hi Alex! I wanted to discuss the new project timeline and requirements.', 
          sender: 'user', 
          timestamp: new Date(Date.now() - 3500000),
          type: 'text',
          status: 'read'
        },
        { 
          id: '1_3', 
          text: 'Sure! I just reviewed the timeline. Everything looks good so far. Let me share the document with you.', 
          sender: 'contact', 
          timestamp: new Date(Date.now() - 3400000),
          type: 'text',
          status: 'read'
        },
        { 
          id: '1_4', 
          text: 'project_requirements.pdf', 
          sender: 'contact', 
          timestamp: new Date(Date.now() - 3300000),
          type: 'file',
          fileType: 'pdf',
          size: 2457600,
          status: 'read'
        }
      ],
      '2': [
        { 
          id: '2_1', 
          text: 'Hello! Looking forward to our meeting tomorrow. Please bring the quarterly reports.', 
          sender: 'contact', 
          timestamp: new Date(Date.now() - 86400000),
          type: 'text',
          status: 'read'
        },
      ],
      '3': [
        { 
          id: '3_1', 
          text: 'Hey! I sent you the latest design mockups for review. Let me know your thoughts! 🎨', 
          sender: 'contact', 
          timestamp: new Date(Date.now() - 7200000),
          type: 'text',
          status: 'read'
        },
        { 
          id: '3_2', 
          text: 'Got them! The new designs look amazing. The color scheme is perfect!', 
          sender: 'user', 
          timestamp: new Date(Date.now() - 7100000),
          type: 'text',
          status: 'read'
        },
      ],
      '4': [
        { 
          id: '4_1', 
          text: 'Hi! The marketing campaign is ready for your final review. All assets are prepared. 📊', 
          sender: 'contact', 
          timestamp: new Date(Date.now() - 1800000),
          type: 'text',
          status: 'read'
        },
      ]
    };
    setMessages(initialMessages);
  }, []);

  // Filter contacts based on search term
  const filteredContacts = chatContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Smooth scroll to bottom with animation
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const height = container.clientHeight;
      const maxScrollTop = scrollHeight - height;
      
      container.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth'
      });
    }
  }, []);

  // Auto-scroll when new messages arrive or contact changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeContact, isTyping, scrollToBottom]);

  // Simulate typing delay
  const simulateTyping = useCallback(() => {
    setIsTyping(true);
    return new Promise(resolve => {
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, 1500 + Math.random() * 1000);
    });
  }, []);

  const sendMessage = useCallback(async (text, files = []) => {
    if (!text.trim() && files.length === 0) return;

    // Send text message if any
    if (text.trim()) {
      const newMessage = {
        id: Date.now().toString() + '_text',
        text: text.trim(),
        sender: 'user',
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      };

      setMessages(prev => ({
        ...prev,
        [activeContact]: [...(prev[activeContact] || []), newMessage]
      }));
    }

    // Send file messages if any
    if (files.length > 0) {
      files.forEach(file => {
        const fileMessage = {
          id: Date.now().toString() + '_file_' + file.name,
          text: file.name,
          sender: 'user',
          timestamp: new Date(),
          type: 'file',
          file: file,
          size: file.size,
          fileType: file.type,
          status: 'sent'
        };

        setMessages(prev => ({
          ...prev,
          [activeContact]: [...(prev[activeContact] || []), fileMessage]
        }));
      });
    }

    setInputText('');
    setSelectedFiles([]);
    setShowDocumentMenu(false);

    // Simulate typing and intelligent response
    if (text.trim() || files.length > 0) {
      await simulateTyping();

      const responses = {
        '1': [
          "That's a great point! Let me check the documentation and get back to you.",
          "I've updated the project timeline accordingly. Check the shared document.",
          "Perfect! I'll coordinate with the team and update you by EOD."
        ],
        '2': [
          "Noted. I'll prepare the reports and bring them to the meeting.",
          "Looking forward to discussing the quarterly performance!",
          "I've scheduled the conference room and sent out calendar invites."
        ],
        '3': [
          "The designs are coming along nicely! Any specific feedback?",
          "I'll make those adjustments and share the updated versions.",
          "Great eye for detail! The team will implement these changes."
        ],
        '4': [
          "The campaign metrics are looking promising so far!",
          "I'll share the performance dashboard with you shortly.",
          "The target audience engagement is exceeding expectations."
        ]
      };

      const contactResponses = responses[activeContact] || ["Thanks for your message! I'll get back to you soon."];
      const randomResponse = contactResponses[Math.floor(Math.random() * contactResponses.length)];

      const reply = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'contact',
        timestamp: new Date(),
        type: 'text',
        status: 'delivered'
      };

      setMessages(prev => ({
        ...prev,
        [activeContact]: [...(prev[activeContact] || []), reply]
      }));
    }
  }, [activeContact, simulateTyping]);

  const handleSendMessage = () => {
    sendMessage(inputText, selectedFiles);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setShowDocumentMenu(false);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('word') || fileType.includes('document')) return '📄';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    return '📎';
  };

  const handleEmojiSelect = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleContactClick = (contactId) => {
    setActiveContact(contactId);
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getLastMessage = (contactId) => {
    const contactMessages = messages[contactId];
    if (!contactMessages || contactMessages.length === 0) return 'Start a conversation';
    const lastMessage = contactMessages[contactMessages.length - 1];
    return lastMessage.type === 'file' ? `📎 ${lastMessage.text}` : lastMessage.text;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentMessages = messages[activeContact] || [];
  const activeContactData = chatContacts.find(contact => contact.id === activeContact);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-gray-600 to-gray-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Professional Chat</h1>
              <p className="text-blue-100 text-sm">Real-time communication platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-blue-100 text-sm">Live</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p>No contacts found</p>
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center space-x-3 mb-1 ${
                      activeContact === contact.id
                        ? 'bg-white shadow-md border border-blue-100 transform scale-[1.02]'
                        : 'hover:bg-white hover:shadow-sm border border-transparent'
                    }`}
                    onClick={() => handleContactClick(contact.id)}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-white text-sm shadow-lg ${
                        activeContact === contact.id 
                          ? 'bg-linear-to-br from-gray-500 to-gray-600' 
                          : 'bg-linear-to-br from-gray-500 to-gray-600 group-hover:from-gray-500 group-hover:to-gray-600'
                      } transition-all duration-200`}>
                        {contact.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold truncate ${
                          activeContact === contact.id ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {contact.name}
                        </h3>
                        {contact.unread > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            activeContact === contact.id 
                              ? 'bg-blue-100 text-gray-600' 
                              : 'bg-blgrayue-500 text-white'
                          }`}>
                            {contact.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {getLastMessage(contact.id)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {contact.role} • {contact.isOnline ? contact.status : `Last seen ${contact.lastSeen}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          {activeContactData && (
            <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gray-500 to-gray-600 flex items-center justify-center font-semibold text-white text-sm shadow-lg">
                    {activeContactData.avatar}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{activeContactData.name}</h2>
                    <p className="text-sm text-gray-600 flex items-center space-x-1">
                      <span className={`w-2 h-2 rounded-full ${activeContactData.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      <span>{activeContactData.isOnline ? activeContactData.status : `Last seen ${activeContactData.lastSeen}`}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto bg-linear-to-b from-gray-50 to-white p-6 space-y-4 scroll-smooth"
          >
            {currentMessages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {message.type === 'file' ? (
                  <div className={`max-w-md rounded-2xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
                    message.sender === 'user'
                      ? 'bg-blue-50 border-blue-100 rounded-br-none'
                      : 'bg-white border-gray-200 rounded-bl-none'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getFileIcon(message.fileType)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{message.text}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(message.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors font-medium">
                        Download
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Preview
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`max-w-md rounded-2xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
                    message.sender === 'user'
                      ? 'bg-gray-200 text-black border-gray-100 rounded-br-none'
                      : 'bg-white border-gray-200 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className={`flex items-center justify-end space-x-2 mt-2 ${
                      message.sender === 'user' ? 'text-gray-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {message.sender === 'user' && (
                        <span className="text-xs">
                          {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="flex justify-end animate-fade-in">
                <div className="max-w-md rounded-2xl p-4 shadow-sm border border-blue-100 bg-blue-50">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Files to send:</p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between space-x-3 p-2 rounded-lg bg-white border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getFileIcon(file.type)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white p-6">
            {/* Document Upload Menu */}
            {showDocumentMenu && (
              <div className="mb-4 p-4 rounded-xl border border-gray-200 bg-white shadow-lg animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Upload Documents</h4>
                  <button 
                    onClick={() => setShowDocumentMenu(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-lg border-2 border-dashed border-gray-300 text-center hover:border-gray-500 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="text-2xl mb-2 text-gray-400 group-hover:text-gray-500">📄</div>
                    <div className="text-sm font-medium text-gray-600 group-hover:text-gray-600">Upload File</div>
                  </button>
                  <div className="p-4 rounded-lg border border-gray-200 text-center bg-gray-50">
                    <div className="text-2xl mb-2 text-gray-400">🖼️</div>
                    <div className="text-sm font-medium text-gray-600">From Gallery</div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="*/*"
                />
              </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="mb-4 rounded-xl border border-gray-200 bg-white shadow-lg animate-fade-in">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex space-x-1">
                    {emojiCategories.map((category, index) => (
                      <button
                        key={category.name}
                        onClick={() => setActiveEmojiCategory(index)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeEmojiCategory === index 
                            ? 'bg-gray-500 text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-1">
                    {emojiCategories[activeEmojiCategory].emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 items-end">
              <div className="flex space-x-1">
                <button 
                  onClick={() => setShowDocumentMenu(!showDocumentMenu)}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none transition-all duration-200"
                  rows="1"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() && selectedFiles.length === 0}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  (inputText.trim() || selectedFiles.length > 0)
                    ? 'bg-gray-500 text-white shadow-lg hover:bg-gray-600 hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatSection);