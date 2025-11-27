import React, { useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday,
  parseISO
} from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { CourseEvent } from '../types';
import { COURSE_COLORS } from '../constants';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  events: CourseEvent[];
  onDateClick: (date: Date) => void;
  onChangeMonth: (amount: number) => void;
  onSetToday: () => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  selectedDate, 
  events, 
  onDateClick, 
  onChangeMonth,
  onSetToday
}) => {
  
  // Generate days for the grid
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Days of week header (Thai)
  const weekDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(parseISO(event.date), day));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            {format(currentDate, 'MMMM yyyy', { locale: th })}
          </h2>
          <p className="text-slate-400 text-sm mt-1">เลือกวันที่เพื่อดูตารางเรียน</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onSetToday}
            className="text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors mr-2"
          >
            วันนี้
          </button>
          <button 
            onClick={() => onChangeMonth(-1)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onChangeMonth(1)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 mb-4">
        {weekDays.map((day, index) => (
          <div key={day} className={`text-center text-sm font-semibold py-2 ${index === 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const dayEvents = getEventsForDay(day);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDateClick(day)}
              className={`
                relative h-24 sm:h-28 rounded-xl flex flex-col items-start justify-start p-2 transition-all border
                ${!isCurrentMonth ? 'opacity-30 bg-slate-50 border-transparent' : 'bg-white'}
                ${isSelected 
                  ? 'ring-2 ring-primary border-transparent shadow-lg z-10 scale-[1.02]' 
                  : 'border-slate-100 hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <div className="flex justify-between w-full mb-1">
                <span className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${isCurrentDay 
                    ? 'bg-primary text-white shadow-md shadow-primary/30' 
                    : isSelected ? 'text-primary' : 'text-slate-700'
                  }
                `}>
                  {format(day, 'd')}
                </span>
              </div>
              
              {/* Event Dots/Bars */}
              <div className="w-full flex flex-col gap-1 overflow-hidden mt-1">
                {dayEvents.slice(0, 3).map((event) => {
                   const color = COURSE_COLORS.find(c => c.id === event.color);
                   return (
                     <div 
                      key={event.id} 
                      className={`text-[10px] truncate w-full px-1.5 py-0.5 rounded-sm ${color?.bgClass || 'bg-slate-100'} ${color?.textClass || 'text-slate-600'}`}
                     >
                       {event.startTime} {event.title}
                     </div>
                   )
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-slate-400 px-1">
                    +{dayEvents.length - 3} มากกว่า
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
