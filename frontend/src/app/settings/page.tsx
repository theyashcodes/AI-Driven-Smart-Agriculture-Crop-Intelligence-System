"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const TubesBackground = dynamic(() => import("@/components/TubesBackground"), { ssr: false });

export default function Settings() {
  const [chatId, setChatId] = useState("");
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/alerts/settings", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
         setChatId(data.chat_id || "");
         setTelegramEnabled(data.telegram_enabled || false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/alerts/settings", {
         method: "POST",
         headers: { 
           "Content-Type": "application/json",
           "Authorization": `Bearer ${localStorage.getItem("token")}`
         },
         body: JSON.stringify({ chat_id: chatId, telegram_enabled: telegramEnabled })
      });
      if (res.ok) setMessage("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      setMessage("Failed to save settings.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const testMessages = [
    "🚨 CRITICAL: Soil moisture dropping rapidly in North Sector!",
    "⚠️ WARNING: High temperature detected in South Greenhouse.",
    "ℹ️ INFO: Irrigation system cycle completed successfully.",
    "🐛 ALERT: Possible pest activity detected in East Field.",
    "💧 UPDATE: Rain expected in 2 hours. Pausing scheduled irrigation."
  ];

  const handleTestTelegram = async () => {
    if (!chatId) {
      setMessage("Please enter a Telegram Chat ID first.");
      return;
    }
    setLoading(true);
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    try {
      const res = await fetch("http://localhost:8000/api/alerts/send-telegram", {
         method: "POST",
         headers: { 
           "Content-Type": "application/json",
           "Authorization": `Bearer ${localStorage.getItem("token")}`
         },
         body: JSON.stringify({ 
           chat_id: chatId, 
           message: randomMessage 
         })
      });
      const data = await res.json();
      if (res.ok) {
         setMessage("Test Telegram initiated! Check Python backend logs.");
      } else {
         setMessage(data.detail || "Error triggering Telegram alert");
      }
    } catch (e) {
      console.error(e);
      setMessage("Network error triggering Telegram alert.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <TubesBackground>
      <div className="flex min-h-screen pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/70 backdrop-blur-xl border-r border-white/10 hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-black text-green-400 tracking-tight">Agri<span className="text-white">Mind</span></h1>
          <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">Crop Intelligence</p>
        </div>
        <nav className="px-4 space-y-2 mt-4">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <span>Dashboard</span>
          </Link>
          <Link href="/farms" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <span>My Farms</span>
          </Link>
          <Link href="/predictions" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <span>ML Predictions</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 bg-green-500/20 text-green-400 rounded-xl font-medium">
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-white">Settings</h2>
          <p className="text-gray-400 mt-1">Manage your account and notification preferences</p>
        </header>

        <div className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl shadow-sm border border-white/10 max-w-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Telegram Notifications</h3>
          <div className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-400 mb-2">Telegram Chat ID</label>
               <input 
                 type="text" 
                 value={chatId}
                 onChange={(e) => setChatId(e.target.value)}
                 className="w-full border border-white/10 rounded-lg px-4 py-3 bg-gray-800/60 text-white placeholder-gray-500" 
                 placeholder="123456789" 
               />
               <p className="text-xs text-gray-500 mt-2">Required for critical system alerts. You can find this by messaging @userinfobot on Telegram.</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-white/10">
               <div>
                  <label className="font-semibold text-white">Enable Telegram Alerts</label>
                  <p className="text-sm text-gray-400">Receive Telegram messages for priority events</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input 
                   type="checkbox" 
                   className="sr-only peer" 
                   checked={telegramEnabled}
                   onChange={(e) => setTelegramEnabled(e.target.checked)}
                 />
                 <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
               </label>
            </div>
            
            {message && <p className="text-sm font-semibold text-green-400 bg-green-950/40 p-3 rounded-lg border border-green-500/30">{message}</p>}
            
            <div className="flex space-x-4 pt-4 border-t border-white/10">
               <button 
                 onClick={handleSave} 
                 disabled={loading}
                 className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
               >
                 Save Preferences
               </button>
               <button 
                 onClick={handleTestTelegram}
                 disabled={loading || !telegramEnabled}
                 className="bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 border border-white/10 px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
               >
                 Test Telegram Alert
               </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </TubesBackground>
  );
}
