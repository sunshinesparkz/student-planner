import React, { useState, useRef, useEffect } from 'react';
import { CourseEvent, Attachment } from '../types';
import { COURSE_COLORS } from '../constants';
import { Plus, X, Clock, MapPin, BookOpen, Paperclip, Link as LinkIcon, FileText, Trash2, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface EventFormProps {
  selectedDateStr: string;
  initialData?: CourseEvent | null;
  onSave: (event: CourseEvent) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ selectedDateStr, initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialData?.endTime || '11:00');
  const [selectedColorId, setSelectedColorId] = useState(initialData?.color || COURSE_COLORS[0].id);
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments || []);
  
  // Attachment Inputs State
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const eventData: CourseEvent = {
      id: initialData?.id || uuidv4(), // Use existing ID if editing, else new UUID
      title,
      location,
      date: initialData?.date || selectedDateStr, // Keep original date if editing
      startTime,
      endTime,
      color: selectedColorId,
      attachments,
    };

    onSave(eventData);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 1.5MB to prevent LocalStorage quota issues
    if (file.size > 1.5 * 1024 * 1024) {
      alert('ไฟล์มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 1.5MB) แนะนำให้ฝากไฟล์ไว้ที่ Google Drive แล้วแนบเป็นลิงก์แทนครับ');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAttachment: Attachment = {
          id: uuidv4(),
          name: file.name,
          type: 'file',
          path: event.target.result as string,
          size: file.size
        };
        setAttachments(prev => [...prev, newAttachment]);
      }
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddLink = () => {
    if (!linkUrl) return;
    
    // Auto-add https:// if missing
    let finalUrl = linkUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
    }

    const newAttachment: Attachment = {
      id: uuidv4(),
      name: linkName || finalUrl,
      type: 'link',
      path: finalUrl
    };
    
    setAttachments(prev => [...prev, newAttachment]);
    setLinkUrl('');
    setLinkName('');
    setShowLinkInput(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 animate-fade-in flex flex-col h-full max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          {isEditing ? <Edit2 className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
          {isEditing ? 'แก้ไขข้อมูลวิชา' : 'เพิ่มวิชาเรียน'}
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Course Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อวิชา / กิจกรรม</label>
          <div className="relative">
            <BookOpen className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="เช่น Calculus I, ภาษาอังกฤษ..."
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่ / ห้องเรียน</label>
          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="เช่น ตึก 3 ห้อง 301"
            />
          </div>
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">เวลาเริ่ม</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-9 pr-2 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">เวลาเลิก</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full pl-9 pr-2 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">เลือกสีประจำวิชา</label>
          <div className="flex flex-wrap gap-3">
            {COURSE_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColorId(color.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${color.dotClass} ${
                  selectedColorId === color.id 
                    ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-md' 
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                title={color.name}
              >
                {selectedColorId === color.id && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="pt-2 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3">สื่อการสอน / เอกสารแนบ</label>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Paperclip className="w-4 h-4" />
                    แนบไฟล์
                </button>
                <button
                    type="button"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        showLinkInput ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <LinkIcon className="w-4 h-4" />
                    เพิ่มลิงก์
                </button>
            </div>

            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
            />

            {/* Link Input Form */}
            {showLinkInput && (
                <div className="bg-slate-50 p-3 rounded-lg mb-4 border border-slate-200 animate-fade-in">
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="วางลิงก์ที่นี่ (https://...)"
                        className="w-full text-sm p-2 rounded border border-slate-300 mb-2 focus:border-primary outline-none"
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={linkName}
                            onChange={(e) => setLinkName(e.target.value)}
                            placeholder="ชื่อลิงก์ (ไม่ใส่ก็ได้)"
                            className="flex-1 text-sm p-2 rounded border border-slate-300 focus:border-primary outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleAddLink}
                            className="bg-primary text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary/90"
                        >
                            เพิ่ม
                        </button>
                    </div>
                </div>
            )}

            {/* Attachments List */}
            {attachments.length > 0 && (
                <div className="space-y-2">
                    {attachments.map((att) => (
                        <div key={att.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-sm group">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {att.type === 'file' ? (
                                    <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                                ) : (
                                    <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
                                )}
                                <span className="truncate text-slate-700">{att.name}</span>
                                {att.size && (
                                    <span className="text-xs text-slate-400 shrink-0">
                                        ({(att.size / 1024).toFixed(0)} KB)
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeAttachment(att.id)}
                                className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
             
             {attachments.length === 0 && !showLinkInput && (
                 <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                     ยังไม่มีไฟล์แนบ
                 </div>
             )}
        </div>

        <div className="pt-4 flex gap-3 sticky bottom-0 bg-white border-t border-slate-100 pb-2">
           <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all active:scale-95"
          >
            {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มวิชาใหม่'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;