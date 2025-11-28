import { createClient } from '@supabase/supabase-js';

// ตรวจสอบว่ามีค่า ENV หรือไม่
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ถ้าไม่มี Key จะ return null เพื่อให้ระบบ fallback ไปใช้ LocalStorage
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;