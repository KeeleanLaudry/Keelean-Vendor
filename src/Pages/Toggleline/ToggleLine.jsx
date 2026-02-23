import React, { useState, useCallback } from 'react';
import Header from './Header';
import ToggleNav from './ToggleNav';
import ContactsSection from './ContactsSection';
import CalendarSection from './Calendar';
import ChatSection from './ChatSection';
import Sidebar from '../../Sidebar/Sidebar'; // path adjust karo apne folder structure ke hisab se
import "../../index.css";




export default function Toggleline() {
  const [activeSection, setActiveSection] = useState("contacts");
  const handleSectionChange = useCallback((section) => setActiveSection(section), []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "contacts":
        return <ContactsSection />;
      case "calendar":
        return <CalendarSection />;
      case "chat":
        return <ChatSection />;
      default:
        return <ContactsSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* LEFT - Sidebar full height and starts from top */}
      <Sidebar />

      {/* RIGHT - Main Content */}
      <div className="flex-1 px-6 py-6">
        {/* Page Header */}
        <header className="mb-6 border-b border-gray-200 pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold">Contact Manager</h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-medium">
                JS
              </div>
              <span className="text-sm text-gray-700 font-medium">John Smith</span>
            </div>
          </div>
        </header>

        {/* Toggle Tabs */}
        <div className="mb-6">
          <ToggleNav activeSection={activeSection} onSectionChange={handleSectionChange} />
        </div>

        {/* Card Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2">My Contacts</h2>
          <p className="text-sm font-medium text-gray-500 mb-4">
            Manage your contacts and conversation channels.
          </p>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}
