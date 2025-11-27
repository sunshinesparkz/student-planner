import React, { useState, useEffect } from 'react';
import { addMonths, format, parseISO } from 'date-fns';
import { CourseEvent, User } from './types';
import CalendarGrid from './components/CalendarGrid';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import LoginForm from './components/LoginForm';
import { LogOut, User as UserIcon } from 'lucide-react';

function App() {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);

  // --- App State ---
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [events, setEvents] = useState<CourseEvent[]>([]);
  
  // State for Form visibility and mode
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CourseEvent | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  
  // New state to prevent overwriting data before it's loaded
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- Auth & Data Loading Effects ---
  
  // Attempt to restore session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('planner_current_session');
    if (savedSession) {
      try {
        const userData = JSON.parse(savedSession);
        setUser(userData);
        // Note: We don't set isDataLoaded here, we let the loading effect handle it
      } catch (e) {
        localStorage.removeItem('planner_current_session');
      }
    }
  }, []);

  // Load events whenever user changes
  useEffect(() => {
    if (user) {
      setLoadingData(true);
      // Important: Ensure we don't save empty state while loading
      setIsDataLoaded(false);

      // Simulate fetching from cloud
      setTimeout(() => {
        const storageKey = `planner_data_${user.username}`;
        const savedEvents = localStorage.getItem(storageKey);
        
        let loadedEvents: CourseEvent[] = [];
        if (savedEvents) {
          try {
            loadedEvents = JSON.parse(savedEvents);
          } catch (e) {
            console.error("Failed to parse events", e);
          }
        }
        
        setEvents(loadedEvents);
        setIsDataLoaded(true); // Allow saving now
        setLoadingData(false);
      }, 500); // Slightly longer delay to ensure UI shows loading state
    } else {
      setEvents([]);
      setIsDataLoaded(false);
    }
  }, [user]);

  // Save events whenever they change (and user exists AND data is loaded)
  useEffect(() => {
    if (user && isDataLoaded && !loadingData) {
      const storageKey = `planner_data_${user.username}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(events));
      } catch (e) {
        console.error("Storage error:", e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
           alert('Cloud Storage จำลองเต็ม! กรุณาลบไฟล์แนบขนาดใหญ่ออก');
        }
      }
    }
  }, [events, user, isDataLoaded, loadingData]);

  // --- Handlers ---

  const handleLogin = async (username: string, pin: string) => {
    // "Simulate" Cloud Auth
    const authKey = `planner_auth_${username}`;
    const storedPin = localStorage.getItem(authKey);

    if (storedPin) {
      // Existing user: Check PIN
      if (storedPin !== pin) {
        throw new Error('Invalid credentials');
      }
    } else {
      // New user: Register (Save PIN)
      localStorage.setItem(authKey, pin);
    }

    const userData: User = { username, lastLogin: new Date().toISOString() };
    
    // Critical: Reset state before setting user to prevent data leak/overwrite
    setEvents([]);
    setIsDataLoaded(false);
    
    setUser(userData);
    localStorage.setItem('planner_current_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem('planner_current_session');
    
    // Reset state
    setIsDataLoaded(false);
    setEvents([]);
    setIsAddingEvent(false);
    setEditingEvent(null);
    setUser(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    setIsAddingEvent(false);
    setEditingEvent(null);
  };

  const handleChangeMonth = (amount: number) => {
    setCurrentDate(prev => addMonths(prev, amount));
  };

  const handleSetToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Combined handler for creating AND updating
  const handleSaveEvent = (savedEvent: CourseEvent) => {
    if (editingEvent) {
      // Update existing
      setEvents(prev => prev.map(e => e.id === savedEvent.id ? savedEvent : e));
    } else {
      // Add new
      setEvents(prev => [...prev, savedEvent]);
    }
    
    // Reset form state
    setIsAddingEvent(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: CourseEvent) => {
    setEditingEvent(event);
    setIsAddingEvent(true);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่ไหม?')) {
      setEvents(prev => prev.filter(e => e.id !== id));
      if (editingEvent?.id === id) {
        setEditingEvent(null);
        setIsAddingEvent(false);
      }
    }
  };

  // --- Render ---

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const filteredEvents = events.filter(e => e.date === selectedDateStr);
  const showForm = isAddingEvent || editingEvent !== null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Student Planner
            </h1>
            <p className="text-slate-500">จัดการตารางเรียนและกิจกรรมของคุณ</p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* User Profile Badge */}
             <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-700 leading-tight">{user.username}</p>
                  <p className="text-[10px] text-primary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </p>
                </div>
                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-5 h-5" />
                </button>
             </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Calendar */}
          <div className="lg:col-span-8 w-full">
            <CalendarGrid 
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={events}
              onDateClick={handleDateClick}
              onChangeMonth={handleChangeMonth}
              onSetToday={handleSetToday}
            />
          </div>

          {/* Right Column: Side Panel */}
          <div className="lg:col-span-4 w-full h-full min-h-[500px]">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 h-full sticky top-6">
              {loadingData ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm">กำลังโหลดข้อมูล...</p>
                 </div>
              ) : showForm ? (
                <EventForm 
                  selectedDateStr={selectedDateStr}
                  initialData={editingEvent}
                  onSave={handleSaveEvent}
                  onCancel={() => {
                    setIsAddingEvent(false);
                    setEditingEvent(null);
                  }}
                />
              ) : (
                <EventList 
                  events={filteredEvents}
                  selectedDateStr={selectedDateStr}
                  onDeleteEvent={handleDeleteEvent}
                  onEditEvent={handleEditEvent}
                  onOpenAddForm={() => setIsAddingEvent(true)}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;