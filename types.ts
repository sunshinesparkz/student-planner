export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'link';
  path: string; // URL string or Base64 data string
  size?: number; // Only for files
}

export interface CourseEvent {
  id: string;
  title: string;
  location?: string;
  date: string; // ISO string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string; // Tailwind class mostly or hex
  attachments?: Attachment[];
}

export interface ColorOption {
  id: string;
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  dotClass: string;
}

export interface User {
  username: string;
  lastLogin?: string;
}