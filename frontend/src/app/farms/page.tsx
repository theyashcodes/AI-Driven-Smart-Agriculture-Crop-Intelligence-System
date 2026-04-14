"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const NDVIMap = dynamic(() => import("../../components/NDVIMap"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 rounded-xl animate-pulse mt-4 flex items-center justify-center border border-gray-200"><p className="text-gray-500 font-medium">Loading Satellite Data...</p></div>
});

interface Farm {
  id: number;
  name: string;
  location: string;
}

export default function Farms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMap, setActiveMap] = useState<number | null>(null);

  const toggleMap = (id: number) => {
    setActiveMap(prev => prev === id ? null : id);
  };

  // Fetch farms from backend on mount
  const fetchFarms = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/farms");
      if (res.ok) {
        const data = await res.json();
        setFarms(data);
      }
    } catch (err) {
      console.error("Failed to fetch farms", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleAddFarm = async () => {
    const name = window.prompt("Enter Farm Name:", "My Custom Field");
    if (!name) return;
    const area = window.prompt("Enter Farm Location or Area:", "North Sector");
    
    try {
      const res = await fetch("http://localhost:8000/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, location: area })
      });
      if (res.ok) {
        const newFarm = await res.json();
        setFarms([...farms, newFarm]);
      } else {
        alert("Failed to save farm.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
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
          <Link href="/farms" className="flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium transition-colors">
            <span>My Farms</span>
          </Link>
          <Link href="/predictions" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <span>ML Predictions</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Farms</h2>
          <p className="text-gray-500 mt-1">Manage your registered agricultural fields</p>
        </header>

        {loading ? (
          <p>Loading farms from database...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {farms.map((farm: Farm) => (
              <div key={farm.id} className={`col-span-1 ${activeMap === farm.id ? 'md:col-span-2' : ''} bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300`}>
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="text-xl font-bold text-gray-800">{farm.name}</h3>
                     <p className="text-gray-500 mt-1">Location: {farm.location || "N/A"}</p>
                     <p className="text-xs font-mono text-gray-400 mt-2">ID: {farm.id}</p>
                   </div>
                   <button 
                     onClick={() => toggleMap(farm.id)}
                     className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${activeMap === farm.id ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                   >
                     {activeMap === farm.id ? 'Hide Map' : 'View NDVI'}
                   </button>
                 </div>
                 
                 {activeMap === farm.id && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-700">Satellite Health Analysis</h4>
                        <div className="flex space-x-3 text-xs">
                          <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#00ff00] mr-1 opacity-70"></span> Healthy</span>
                          <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#ffff00] mr-1 opacity-70"></span> Moderate</span>
                          <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#ff0000] mr-1 opacity-70"></span> Stress</span>
                        </div>
                      </div>
                      <NDVIMap />
                    </div>
                 )}
              </div>
            ))}
            <div 
               onClick={handleAddFarm}
               className="bg-white p-6 border-dashed rounded-2xl shadow-sm border-2 border-green-200 flex items-center justify-center cursor-pointer hover:bg-green-50 transition-colors">
               <span className="text-green-600 font-bold text-lg">+ Add New Farm</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
