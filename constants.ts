import { ColorOption } from './types';

export const COURSE_COLORS: ColorOption[] = [
  { 
    id: 'red', 
    name: 'แดง (วิชาหลัก)', 
    bgClass: 'bg-red-100 hover:bg-red-200', 
    borderClass: 'border-red-500', 
    textClass: 'text-red-800',
    dotClass: 'bg-red-500'
  },
  { 
    id: 'blue', 
    name: 'ฟ้า (แลป/ปฏิบัติ)', 
    bgClass: 'bg-blue-100 hover:bg-blue-200', 
    borderClass: 'border-blue-500', 
    textClass: 'text-blue-800',
    dotClass: 'bg-blue-500'
  },
  { 
    id: 'green', 
    name: 'เขียว (วิชาเลือก)', 
    bgClass: 'bg-emerald-100 hover:bg-emerald-200', 
    borderClass: 'border-emerald-500', 
    textClass: 'text-emerald-800',
    dotClass: 'bg-emerald-500'
  },
  { 
    id: 'orange', 
    name: 'ส้ม (กิจกรรม)', 
    bgClass: 'bg-orange-100 hover:bg-orange-200', 
    borderClass: 'border-orange-500', 
    textClass: 'text-orange-800',
    dotClass: 'bg-orange-500'
  },
  { 
    id: 'purple', 
    name: 'ม่วง (ภาษา)', 
    bgClass: 'bg-purple-100 hover:bg-purple-200', 
    borderClass: 'border-purple-500', 
    textClass: 'text-purple-800',
    dotClass: 'bg-purple-500'
  },
  { 
    id: 'gray', 
    name: 'เทา (สอบ/อื่นๆ)', 
    bgClass: 'bg-slate-100 hover:bg-slate-200', 
    borderClass: 'border-slate-500', 
    textClass: 'text-slate-800',
    dotClass: 'bg-slate-500'
  },
];
