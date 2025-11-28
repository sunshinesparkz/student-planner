import React, { useState } from 'react';
import { LogIn, User, Lock, Loader2, Cloud, CloudOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LoginFormProps {
  onLogin: (username: string, pin: string) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isCloudEnabled = !!supabase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !pin) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await onLogin(username, pin);
    } catch (err: any) {
      setError(err.message || 'รหัสผ่านไม่ถูกต้อง หรือเกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full -ml-12 -mb-12 blur-xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="bg-white p-3 rounded-full shadow-lg w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-slate-100 relative">
            <div className={`bg-gradient-to-tr ${isCloudEnabled ? 'from-primary to-purple-600' : 'from-slate-400 to-slate-600'} w-full h-full rounded-full flex items-center justify-center`}>
                <Cloud className="w-10 h-10 text-white" />
            </div>
            {!isCloudEnabled && (
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-1">
                    <CloudOff className="w-3 h-3" /> Local
                </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Student Planner</h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isCloudEnabled ? 'ระบบจัดการการเรียนออนไลน์' : 'โหมดใช้งานแบบออฟไลน์ (Local)'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">บัญชีผู้ใช้ (Username)</label>
            <div className="relative group">
              <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="ระบุชื่อบัญชีของคุณ"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">รหัสผ่าน (Password)</label>
            <div className="relative group">
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="กรอกรหัสผ่านเพื่อเข้าถึงข้อมูล"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center border border-red-100 flex items-center justify-center gap-2 animate-pulse">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] ${
                isCloudEnabled 
                ? 'bg-gradient-to-r from-primary to-purple-600 shadow-primary/30' 
                : 'bg-slate-700 shadow-slate-700/30'
            }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {isCloudEnabled ? 'เข้าสู่ระบบ Cloud' : 'เข้าสู่ระบบ (Offline)'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          {!isCloudEnabled && (
             <p className="text-xs text-orange-500 mb-2 font-medium">
               ⚠️ ยังไม่ได้เชื่อมต่อ Database ข้อมูลจะถูกเก็บแค่ในเครื่องนี้
             </p>
          )}
          <p className="text-xs text-slate-400">
            * ระบบจะสร้างบัญชีใหม่อัตโนมัติหากไม่พบผู้ใช้นี้
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;