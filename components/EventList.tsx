import React from 'react';
import { CourseEvent } from '../types';
import { COURSE_COLORS } from '../constants';
import { Clock, MapPin, Trash2, CalendarX, Paperclip, ExternalLink, FileText, Edit2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

interface EventListProps {
  events: CourseEvent[];
  selectedDateStr: string;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: CourseEvent) => void;
  onOpenAddForm: () => void;
}

const EventList: React.FC<EventListProps> = ({ events, selectedDateStr, onDeleteEvent, onEditEvent, onOpenAddForm }) => {
  const sortedEvents = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  const formattedDate = format(parseISO(selectedDateStr), 'd MMMM yyyy', { locale: th });

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">ตารางเรียน</h2>
        <p className="text-slate-500 font-medium">{formattedDate}</p>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <CalendarX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">ไม่มีเรียนในวันนี้</h3>
          <p className="text-slate-400 text-sm mb-6">กดปุ่มด้านล่างเพื่อเพิ่มวิชาเรียนหรือกิจกรรม</p>
          <button
            onClick={onOpenAddForm}
            className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
          >
            เพิ่มวิชาเรียน
          </button>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
          {sortedEvents.map((event) => {
            const colorTheme = COURSE_COLORS.find(c => c.id === event.color) || COURSE_COLORS[0];
            const hasAttachments = event.attachments && event.attachments.length > 0;
            
            return (
              <div
                key={event.id}
                className={`group relative p-4 rounded-xl border-l-4 ${colorTheme.borderClass} ${colorTheme.bgClass} transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-2">
                    <h4 className={`text-lg font-bold ${colorTheme.textClass} mb-1 truncate`}>{event.title}</h4>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-2 flex-wrap">
                      <div className="flex items-center gap-1.5 font-medium bg-white/60 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {event.startTime} - {event.endTime}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 opacity-80">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEditEvent(event)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-white/50 rounded-full flex-shrink-0"
                        title="แก้ไข"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-white/50 rounded-full flex-shrink-0"
                        title="ลบรายการ"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Attachments Section in Card */}
                {hasAttachments && (
                  <div className="mt-4 pt-3 border-t border-black/5">
                    <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      เอกสารแนบ
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {event.attachments!.map((att) => (
                        <a
                          key={att.id}
                          href={att.path}
                          download={att.type === 'file' ? att.name : undefined}
                          target={att.type === 'link' ? '_blank' : undefined}
                          rel={att.type === 'link' ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-2 p-2 bg-white/60 hover:bg-white rounded-lg text-sm text-slate-700 transition-colors border border-transparent hover:border-slate-200 group/att"
                        >
                           {att.type === 'file' ? (
                             <FileText className="w-4 h-4 text-orange-500" />
                           ) : (
                             <ExternalLink className="w-4 h-4 text-blue-500" />
                           )}
                           <span className="truncate flex-1 font-medium">{att.name}</span>
                           {att.type === 'file' && (
                             <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                               ดาวน์โหลด
                             </span>
                           )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <button
            onClick={onOpenAddForm}
            className="w-full py-3 mt-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
             + เพิ่มวิชาอื่น
          </button>
        </div>
      )}
    </div>
  );
};

export default EventList;