import React from 'react';

const contactsData = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Senior Developer',
    email: 'alex.johnson@example.com',
    avatar: 'AS'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Product Manager',
    email: 'maria.garcia@example.com',
    avatar: 'MS'
  },
  {
    id: '3',
    name: 'Robert Williams',
    role: 'UX Designer',
    email: 'robert.williams@example.com',
    avatar: 'RW'
  },
  {
    id: '4',
    name: 'Sarah Chen',
    role: 'Marketing Director',
    email: 'sarah.chen@example.com',
    avatar: 'SC'
  },
  {
    id: '5',
    name: 'David Park',
    role: 'Data Analyst',
    email: 'david.park@example.com',
    avatar: 'DP'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    role: 'HR Specialist',
    email: 'lisa.thompson@example.com',
    avatar: 'LT'
  },
];

const ContactCard = React.memo(({ contact }) => (
  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
    <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-lg">
      {contact.avatar}
    </div>
    <div>
      <h3 className="font-semibold text-gray-800 text-lg mb-1">{contact.name}</h3>
      <p className="text-gray-600 font-medium text-sm mb-1">{contact.role}</p>
      <p className="text-gray-500 font-medium text-sm">{contact.email}</p>
    </div>
  </div>
));

const ContactsSection = () => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <span>👥</span> My Contacts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contactsData.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(ContactsSection);