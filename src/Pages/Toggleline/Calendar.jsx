import React, { useState, useMemo } from 'react';

const calendarEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    time: '10:00 AM - 11:00 AM',
    location: 'Conference Room A'
  },
  {
    id: '2',
    title: 'Project Review',
    time: '2:00 PM - 3:30 PM',
    location: 'With Development Team'
  },
  {
    id: '3',
    title: 'Client Call',
    time: '4:00 PM - 4:45 PM',
    location: 'Zoom Meeting'
  },
];

const CalendarSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  // Get today's date for comparison
  const today = new Date();
  
  // Generate calendar data using useMemo for optimization
  const { monthYear, calendarDays, days, currentMonth, currentYear } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Days in month
    const daysInMonth = lastDay.getDate();
    // Starting day of the week (0 = Sunday, 1 = Monday, etc.)
    const startDay = firstDay.getDay();
    
    // Previous month's days to show
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: startDay }, (_, i) => 
      prevMonthLastDay - startDay + i + 1
    );
    
    // Current month's days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Next month's days to show (to fill the grid)
    const totalCells = 42; // 6 weeks * 7 days
    const nextMonthDays = Array.from({ length: totalCells - (prevMonthDays.length + currentMonthDays.length) }, (_, i) => i + 1);
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return {
      monthYear: `${monthNames[month]} ${year}`,
      calendarDays: [
        ...prevMonthDays.map(day => ({ day, type: 'prev', date: new Date(year, month - 1, day) })),
        ...currentMonthDays.map(day => ({ day, type: 'current', date: new Date(year, month, day) })),
        ...nextMonthDays.map(day => ({ day, type: 'next', date: new Date(year, month + 1, day) }))
      ],
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      currentMonth: month,
      currentYear: year
    };
  }, [currentDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setShowMonthPicker(false);
    setShowYearPicker(false);
  };

  // Month and Year selection functions
  const selectMonth = (monthIndex) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), monthIndex, 1));
    setShowMonthPicker(false);
  };

  const selectYear = (year) => {
    setCurrentDate(prev => new Date(year, prev.getMonth(), 1));
    setShowYearPicker(false);
  };

  // Check if a date is today
  const isToday = (date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if a date is selected (current date)
  const isSelected = (date) => {
    return date.getDate() === currentDate.getDate() &&
           date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear();
  };

  // Handle date click
  const handleDateClick = (date) => {
    setCurrentDate(date);
  };

  // Generate years for year picker (current year -10 to +10)
  const generateYears = () => {
    const currentYear = today.getFullYear();
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  };

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-600 mb-6 flex items-center gap-3">
        <span>📅</span> My Calendar
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Main */}
        <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            {/* Month/Year Picker */}
            <div className="flex items-center gap-2 relative">
              <button 
                onClick={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowYearPicker(false);
                }}
                className="px-3 py-1 text-xl font-semibold text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {monthNames[currentMonth]}
              </button>
              <button 
                onClick={() => {
                  setShowYearPicker(!showYearPicker);
                  setShowMonthPicker(false);
                }}
                className="px-3 py-1 text-xl font-semibold text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {currentYear}
              </button>

              {/* Month Picker Dropdown */}
              {showMonthPicker && (
                <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-48 grid grid-cols-3 gap-1 p-2">
                  {monthNames.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => selectMonth(index)}
                      className={`p-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                        index === currentMonth ? 'bg-gray-600 text-white' : ''
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}

              {/* Year Picker Dropdown */}
              {showYearPicker && (
                <div className="absolute top-12 left-20 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-32 max-h-60 overflow-y-auto">
                  <div className="p-2 grid grid-cols-1 gap-1">
                    {generateYears().map(year => (
                      <button
                        key={year}
                        onClick={() => selectYear(year)}
                        className={`p-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                          year === currentYear ? 'bg-gray-600 text-white' : ''
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={goToPreviousMonth}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ‹
              </button>
              <button 
                onClick={goToToday}
                className="px-4 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Today
              </button>
              <button 
                onClick={goToNextMonth}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ›
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
            {calendarDays.map(({ day, type, date }, index) => (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`h-12 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
                  type !== 'current'
                    ? 'text-gray-400 hover:bg-gray-200'
                    : isToday(date)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : isSelected(date)
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        
        {/* Events Sidebar */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {isToday(currentDate) ? "Today's Events" : `Events for ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </h3>
          <div className="space-y-4">
            {calendarEvents.map(event => (
              <div key={event.id} className="bg-white p-4 rounded-lg border-l-4 border-gray-600 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
                <p className="text-gray-600 text-sm mb-1">{event.time}</p>
                <p className="text-gray-500 text-sm">{event.location}</p>
              </div>
            ))}
            {calendarEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No events scheduled for this day
              </div>
            )}
          </div>

          {/* Quick Month Navigation */}
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h4 className="font-semibold text-gray-700 mb-3">Quick Jump</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentYear - 1, currentMonth, 1))}
                className="p-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Previous Year
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentYear + 1, currentMonth, 1))}
                className="p-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Next Year
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarSection);