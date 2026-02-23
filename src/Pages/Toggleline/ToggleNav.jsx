import React from 'react';

const ToggleNav = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'contacts', label: 'Contacts', icon: '👥' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'chat', label: 'Google Chat', icon: '💬' },
  ];

  return (
    <div className="flex bg-white rounded-xl p-2 shadow-sm border border-gray-200 mb-8">
      {sections.map((section) => (
        <button
          key={section.id}
          className={`flex-1 text-center py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
            activeSection === section.id
              ? 'bg-gray-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => onSectionChange(section.id)}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
};

export default React.memo(ToggleNav);