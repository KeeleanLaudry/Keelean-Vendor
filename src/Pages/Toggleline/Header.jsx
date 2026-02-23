import React from 'react';

const Header = () => {
  return (
    <header className="flex justify-between items-center py-6 border-b border-gray-300 mb-8">
      <div className="text-2xl font-bold text-gray-800">Contact Manager</div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
          JS
        </div>
        <span className="text-gray-700">John Smith</span>
      </div>
    </header>
  );
};

export default React.memo(Header);