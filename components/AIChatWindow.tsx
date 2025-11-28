import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User as UserIcon, Loader2, Minimize2 } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CourseEvent } from '../types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface AIChatWindowProps {
  username: string;
  events: CourseEvent[];
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

const AIChatWindow: React.FC<AIChatWindowProps> = ({ username, events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: `สวัสดีครับคุณ ${username}! ผมคือผู้ช่วย AI ส่วนตัวของคุณ \nมีอะไรให้ผมช่วยเกี่ยวกับตารางเรียนหรือการเรียนวันนี้ไหมครับ?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize Gemini Client
  // Note: API Key is assumed to be in process.env.API_KEY as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const generateSystemInstruction = () => {
    const today = format(new Date(), 'eeee d MMMM yyyy', { locale: th });
    const eventsJson = JSON.stringify(events.map(e => ({
      title: e.title,
      day: e.date,
      time: `${e.startTime}-${e.endTime}`,
      location: e.location || 'ไม่ระบุ'
    })));

    return `
      You are a helpful and cheerful student assistant for a student named "${username}".
      Current Date: ${today}.
      
      Here is the student's course schedule data (JSON):
      ${eventsJson}

      Rules:
      1. Answer primarily in Thai language (Natural and polite).
      2. Use the schedule data to answer questions like "Do I have class today?", "What's next?", "Summarize my week".
      3. If the user asks about general knowledge, help them summarize or explain concepts clearly.
      4. Keep answers concise but helpful.
      5. If the schedule is empty, encourage them to rest or study.
    `;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a chat session with context
      const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: generateSystemInstruction(),
        },
        history: messages
            .filter(m => m.id !== 'welcome' && !m.isError)
            .map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }))
      });

      // Stream the response
      const resultStream = await chat.sendMessageStream({ message: userMessage.text });
      
      let fullResponse = '';
      const responseId = (Date.now() + 1).toString();
      
      // Add placeholder for streaming response
      setMessages(prev => [...prev, { id: responseId, role: 'model', text: '' }]);

      for await (const chunk of resultStream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
            fullResponse += chunkText;
            setMessages(prev => prev.map(msg => 
                msg.id === responseId ? { ...msg, text: fullResponse } : msg
            ));
        }
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: 'ขออภัยครับ เกิดข้อขัดข้องในการเชื่อมต่อกับ AI (กรุณาตรวจสอบ API Key หรือลองใหม่อีกครั้ง)',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary to-indigo-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center text-white z-50 group"
      >
        <Sparkles className="w-7 h-7 animate-pulse" />
        <span className="absolute -top-10 right-0 bg-white text-slate-800 text-xs font-bold px-3 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          ถาม AI ผู้ช่วย
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Assistant</h3>
            <p className="text-[10px] opacity-80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
              Online (Gemini 2.5)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setMessages([{ id: 'welcome', role: 'model', text: `สวัสดีครับคุณ ${username}! วันนี้ให้ผมช่วยอะไรดีครับ?` }])}
             className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
             title="ล้างแชท"
           >
             <Sparkles className="w-4 h-4" />
           </button>
           <button 
             onClick={() => setIsOpen(false)}
             className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
           >
             <Minimize2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-primary/10 text-primary'
            }`}>
              {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-none' 
                : msg.isError 
                  ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none'
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                 <Sparkles className="w-5 h-5" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                 <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                 </div>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ถามเกี่ยวกับตารางเรียน..."
            className="flex-1 py-2.5 pl-4 pr-10 bg-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none border border-transparent focus:border-primary/30 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-[10px] text-center text-slate-400 mt-2">
           AI อาจแสดงข้อมูลคลาดเคลื่อน โปรดตรวจสอบตารางจริงอีกครั้ง
        </div>
      </form>
    </div>
  );
};

export default AIChatWindow;