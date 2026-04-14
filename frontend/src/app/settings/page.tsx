"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Settings() {
  const [phone, setPhone] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/alerts/settings")
      .then(res => res.json())
      .then(data => {
         setPhone(data.phone || "");
         setSmsEnabled(data.sms_enabled || false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/alerts/settings", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ phone, sms_enabled: smsEnabled })
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

  const handleTestSMS = async () => {
    if (!phone) {
      setMessage("Please enter a phone number first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/alerts/send-sms", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ 
           phone: phone, 
           message: "CRITICAL: Soil moisture dropping in North Sector!" 
         })
      });
      const data = await res.json();
      if (res.ok) {
         setMessage("Test SMS initiated! Check Python backend logs.");
      } else {
         setMessage(data.detail || "Error triggering SMS");
      }
    } catch (e) {
      console.error(e);
      setMessage("Network error triggering SMS.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-black text-green-600 tracking-tight">Agri<span className="text-gray-800">Mind</span></h1>
          <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Crop Intelligence</p>
        </div>
        <nav className="px-4 space-y-2 mt-4">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <span>Dashboard</span>
          </Link>
          <Link href="/farms" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <span>My Farms</span>
          </Link>
          <Link href="/predictions" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <span>ML Predictions</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium">
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
          <p className="text-gray-500 mt-1">Manage your account and notification preferences</p>
        </header>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Mobile SMS Notifications</h3>
          <div className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
               <input 
                 type="tel" 
                 value={phone}
                 onChange={(e) => setPhone(e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-4 py-3" 
                 placeholder="+1 (555) 000-0000" 
               />
               <p className="text-xs text-gray-400 mt-2">Required for critical system alerts (e.g. frost warnings).</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
               <div>
                  <label className="font-semibold text-gray-800">Enable SMS Alerts</label>
                  <p className="text-sm text-gray-500">Receive text messages for priority events</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input 
                   type="checkbox" 
                   className="sr-only peer" 
                   checked={smsEnabled}
                   onChange={(e) => setSmsEnabled(e.target.checked)}
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
               </label>
            </div>
            
            {message && <p className="text-sm font-semibold text-blue-600 bg-blue-50 p-3 rounded-lg">{message}</p>}
            
            <div className="flex space-x-4 pt-4 border-t border-gray-100">
               <button 
                 onClick={handleSave} 
                 disabled={loading}
                 className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
               >
                 Save Preferences
               </button>
               <button 
                 onClick={handleTestSMS}
                 disabled={loading || !smsEnabled}
                 className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
               >
                 Test SMS Alert
               </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
