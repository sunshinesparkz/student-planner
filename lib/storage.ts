import { supabase } from './supabaseClient';
import { CourseEvent, User } from '../types';

// Helper เพื่อจำลองความล่าช้า (ให้เห็น Loading State สวยๆ)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  // --- Authentication ---
  async login(username: string, pin: string): Promise<User> {
    await delay(500);

    // 1. ลองใช้ Supabase (Cloud)
    if (supabase) {
      try {
        // ค้นหา User จากตาราง users
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 คือไม่เจอข้อมูล (ซึ่งเราจะถือว่าเป็นการสมัครใหม่)
             console.error('Supabase Login Error:', error);
             throw new Error('Database Connection Error');
        }

        if (data) {
          // มี User อยู่แล้ว -> เช็ค PIN
          if (data.pin !== pin) {
            throw new Error('รหัสผ่าน (PIN) ไม่ถูกต้อง');
          }
          return { username, lastLogin: new Date().toISOString() };
        } else {
          // ไม่เคยมี User นี้ -> สมัครใหม่
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ username, pin, events: [] }]);
          
          if (insertError) throw insertError;
          return { username, lastLogin: new Date().toISOString() };
        }
      } catch (err: any) {
        // ถ้าเชื่อมต่อ Supabase ไม่ได้ หรือมีปัญหาอื่นๆ
        console.warn('Falling back to local storage due to error:', err);
        if (err.message.includes('PIN')) throw err; // ถ้าผิดที่ PIN ให้โยน Error ออกไป
      }
    }

    // 2. Fallback: LocalStorage
    console.log('Using LocalStorage for Auth');
    const authKey = `planner_auth_${username}`;
    const storedPin = localStorage.getItem(authKey);

    if (storedPin) {
      if (storedPin !== pin) throw new Error('รหัสผ่าน (PIN) ไม่ถูกต้อง (Local)');
    } else {
      localStorage.setItem(authKey, pin);
    }

    return { username, lastLogin: new Date().toISOString() };
  },

  // --- Load Data ---
  async loadEvents(username: string): Promise<CourseEvent[]> {
    await delay(300);

    // 1. ลองดึงจาก Supabase
    if (supabase) {
      const { data } = await supabase
        .from('users')
        .select('events')
        .eq('username', username)
        .single();
      
      if (data?.events) {
        return data.events as CourseEvent[];
      }
    }

    // 2. Fallback: LocalStorage
    const storageKey = `planner_data_${username}`;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  },

  // --- Save Data ---
  async saveEvents(username: string, events: CourseEvent[]): Promise<void> {
    // 1. บันทึก LocalStorage เสมอ (เพื่อความเร็วและกันเน็ตหลุด)
    const storageKey = `planner_data_${username}`;
    localStorage.setItem(storageKey, JSON.stringify(events));

    // 2. ถ้ามี Supabase ให้บันทึกขึ้น Cloud ด้วย
    if (supabase) {
      // ไม่ต้องรอ (Fire and forget) หรือจะรอเพื่อเช็ค Error ก็ได้
      supabase
        .from('users')
        .update({ events: events })
        .eq('username', username)
        .then(({ error }) => {
          if (error) console.error('Failed to sync to Cloud:', error);
          else console.log('Synced to Cloud successfully');
        });
    }
  }
};