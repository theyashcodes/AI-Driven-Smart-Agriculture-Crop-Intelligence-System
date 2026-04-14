"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SensorCard from "@/components/SensorCard";
import PredictionChart from "@/components/PredictionChart";
import AlertCard from "@/components/AlertCard";
import { SunIcon, CloudIcon, BeakerIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";

// Mock data to simulate API response before backend connects
const mockChartData = [
  { time: '08:00', yield: 210, moisture: 45 },
  { time: '10:00', yield: 212, moisture: 42 },
  { time: '12:00', yield: 215, moisture: 38 },
  { time: '14:00', yield: 218, moisture: 35 },
  { time: '16:00', yield: 220, moisture: 30 },
  { time: '18:00', yield: 215, moisture: 28 },
];

export default function Dashboard() {
  const [sensors, setSensors] = useState({
    temperature: 28.5,
    humidity: 55,
    moisture: 28, // Low -> trigger alert
    ph: 6.8
  });

  const [currentFarm, setCurrentFarm] = useState({ name: "Loading...", location: "North" });
  const [yieldPrediction, setYieldPrediction] = useState("Loading...");

  useEffect(() => {
    const fn = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        const farmsRes = await fetch("http://localhost:8000/api/farms", { headers });
        if (farmsRes.ok) {
          const farms = await farmsRes.json();
          const activeFarm = farms[farms.length - 1] || { id: 1, name: "Default Field", location: "North" };
          setCurrentFarm(activeFarm);
          
          if (activeFarm.id) {
            const telRes = await fetch(`http://localhost:8000/api/farms/${activeFarm.id}/telemetry`, { headers });
            if (telRes.ok) {
              const telData = await telRes.json();
              setSensors(telData);

              const yieldRes = await fetch("http://localhost:8000/api/predictions/yield", {
                method: "POST",
                headers,
                body: JSON.stringify({
                  temperature: telData.temperature,
                  humidity: telData.humidity,
                  soil_moisture: telData.moisture,
                  ph_level: telData.ph
                })
              });
              if (yieldRes.ok) {
                const yieldData = await yieldRes.json();
                setYieldPrediction(yieldData.predicted_yield);
              }
            }
          }
        } else if (farmsRes.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fn();
    const interval = setInterval(fn, 5000); // Set up polling for telemetry
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-black text-green-600 tracking-tight">Agri<span className="text-gray-800">Mind</span></h1>
          <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Crop Intelligence</p>
        </div>
        <nav className="px-4 space-y-2 mt-4">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium">
            <span>Dashboard</span>
          </Link>
          <Link href="/farms" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
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

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Farm Overview</h2>
            <p className="text-gray-500 mt-1">Real-time monitoring and AI insights for {currentFarm.name}</p>
          </div>
          <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-green-200">
            Generate Report
          </button>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SensorCard title="Temperature" value={sensors.temperature} unit="°C" icon={SunIcon} />
          <SensorCard title="Humidity" value={sensors.humidity} unit="%" icon={CloudIcon} />
          <SensorCard title="Soil Moisture" value={sensors.moisture} unit="%" icon={BeakerIcon} alert={sensors.moisture < 30} />
          <SensorCard title="Yield Prediction" value={yieldPrediction.replace(" Tons/Acre", "")} unit={yieldPrediction.includes("Tons/Acre") ? "Tons/Acre" : ""} icon={ArrowTrendingUpIcon} />
        </div>

        {/* Charts and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PredictionChart data={mockChartData} />
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">AI Recommendations</h3>
            
            <div className="space-y-4">
              {sensors.moisture < 30 && (
                <AlertCard 
                  type="critical" 
                  message="Soil moisture critically low (28%). ML Irrigation Model suggests immediate watering for 45 minutes to prevent 5% yield drop." 
                  time="Just now" 
                />
              )}
              <AlertCard 
                type="warning" 
                message="Expected temperature spike tomorrow (36°C). Disease risk increased by 15%." 
                time="2 hours ago" 
              />
              <div className="p-4 rounded-xl border border-green-200 bg-green-50 flex flex-col items-center justify-center text-center mt-6">
                 <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                   <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                 </div>
                 <h4 className="font-semibold text-green-800">Crop Health is Excellent</h4>
                 <p className="text-sm text-green-600 mt-1">NDVI analysis shows normal growth patterns.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
