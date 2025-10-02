import React, { useState, useMemo } from 'react';
import { useProfileContext } from '@/hooks/useProfileContext';

interface TimelineItem {
  id: string;
  title: string;
  dateRange: string;
  placeholderCount: number;
}

const Timeline: React.FC = () => {
  const { profileData } = useProfileContext();
  
  // State for navigation
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  
  // Generate years array from current year to graduation year
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-based (September = 8)
    const graduationYear = profileData?.gradeLevel ? parseInt(profileData.gradeLevel) : currentYear + 4; // Default to 4 years if no graduation year set
    
    const yearsArray = [];
    
    // If archive is not shown, start from current year (September 2025)
    // If archive is shown, start from current year - 1 to show previous year
    const startYear = showArchive ? currentYear - 1 : currentYear;
    
    for (let year = startYear; year <= graduationYear; year++) {
      yearsArray.push(year);
    }
    
    // Set default selected year to current year
    if (selectedYear === null && yearsArray.length > 0) {
      setSelectedYear(currentYear);
    }
    
    return yearsArray;
  }, [profileData?.gradeLevel, selectedYear, showArchive]);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Set default selected month when year changes
  React.useEffect(() => {
    if (selectedYear && selectedMonth === null) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // 0-based (September = 8)
      
      // If showing current year and archive is not checked, default to current month
      // Otherwise, default to January
      if (selectedYear === currentYear && !showArchive) {
        setSelectedMonth(months[currentMonth]); // September
      } else {
        setSelectedMonth('January');
      }
    }
  }, [selectedYear, selectedMonth, showArchive]);

  // Sample timeline items for January 2025
  const januaryItems: TimelineItem[] = [
    { id: '1', title: 'January 1-14', dateRange: 'January 1-14', placeholderCount: 2 },
    { id: '2', title: 'January 14-21', dateRange: 'January 14-21', placeholderCount: 3 },
    { id: '3', title: 'January 21-28', dateRange: 'January 21-28', placeholderCount: 2 },
  ];

  const PlaceholderBlock = () => (
    <div className="w-full h-8 bg-gray-200 rounded-sm border border-gray-300"></div>
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">Academic Timeline</h2>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchive}
            onChange={(e) => setShowArchive(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          Archive
        </label>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Years Column */}
        <div className="w-24 flex-shrink-0">
          <div className="space-y-4 pr-3 text-left">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`h-6 flex items-center text-sm font-medium transition-colors hover:bg-gray-100 rounded px-1 ${
                  selectedYear === year ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Divider Line (centered between years and months) */}
        <div className="w-px bg-gray-300/70 flex-shrink-0"></div>

        {/* Months Column */}
        <div className="w-32 flex-shrink-0">
          <div className="space-y-4 pl-3 pr-3">
            {selectedYear && (() => {
              const currentYear = new Date().getFullYear();
              const currentMonth = new Date().getMonth(); // 0-based (September = 8)
              
              // If showing current year and archive is not checked, only show months from September onwards
              // Otherwise, show all months
              const monthsToShow = selectedYear === currentYear && !showArchive 
                ? months.slice(currentMonth) // September onwards
                : months;
              
              return monthsToShow.map((month, index) => (
                <button
                  key={`${selectedYear}-${month}`}
                  onClick={() => setSelectedMonth(month)}
                  className={`h-6 flex items-center w-full text-left text-sm font-medium transition-colors hover:bg-gray-100 rounded px-1 ${
                    selectedMonth === month ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {month}
                </button>
              ));
            })()}
          </div>
        </div>

        {/* Divider Line (centered between months and items) */}
        <div className="w-px bg-gray-300/70 flex-shrink-0"></div>

        {/* Timeline Items Column - Scrollable */}
        <div className="flex-1 pl-3 overflow-y-auto">
          <div className="space-y-8 pr-2">
            {selectedYear && selectedMonth ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {/* Generate dynamic timeline items based on selected month and year */}
                  {(() => {
                    // For January, show the existing sample items
                    if (selectedMonth === 'January') {
                      return januaryItems.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">{item.dateRange}</h4>
                          <div className="space-y-2">
                            {Array.from({ length: item.placeholderCount }).map((_, index) => (
                              <PlaceholderBlock key={index} />
                            ))}
                          </div>
                        </div>
                      ));
                    }
                    
                    // For other months, show placeholder content
                    return (
                      <>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">
                            {selectedMonth} 1-7
                          </h4>
                          <div className="space-y-2">
                            <PlaceholderBlock />
                            <PlaceholderBlock />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">
                            {selectedMonth} 8-14
                          </h4>
                          <div className="space-y-2">
                            <PlaceholderBlock />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">
                            {selectedMonth} 15-21
                          </h4>
                          <div className="space-y-2">
                            <PlaceholderBlock />
                            <PlaceholderBlock />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">
                            {selectedMonth} 22-28
                          </h4>
                          <div className="space-y-2">
                            <PlaceholderBlock />
                          </div>
                        </div>
                        {['January', 'March', 'May', 'July', 'August', 'October', 'December'].includes(selectedMonth) && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">
                              {selectedMonth} 29-31
                            </h4>
                            <div className="space-y-2">
                              <PlaceholderBlock />
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                Select a year and month to view timeline items
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
