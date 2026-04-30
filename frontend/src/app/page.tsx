"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SensorCard from "@/components/SensorCard";
import PredictionChart from "@/components/PredictionChart";
import AlertCard from "@/components/AlertCard";
import { SunIcon, CloudIcon, BeakerIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import API_BASE_URL from "@/lib/api";

const TubesBackground = dynamic(() => import("@/components/TubesBackground"), { ssr: false });

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
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

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

        const farmsRes = await fetch(`${API_BASE_URL}/api/farms`, { headers });
        if (farmsRes.ok) {
          const farms = await farmsRes.json();
          const activeFarm = farms[farms.length - 1];
          
          if (!activeFarm) {
            setCurrentFarm({ name: "Default Field", location: "North" } as any);
            setTelemetryError(null);
            const yieldRes = await fetch(`${API_BASE_URL}/api/predictions/yield`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                temperature: 28.5,
                humidity: 55,
                soil_moisture: 28,
                ph_level: 6.8
              })
            });
            if (yieldRes.ok) {
              const yieldData = await yieldRes.json();
              setYieldPrediction(yieldData.predicted_yield);
            }
            return;
          }
          
          setCurrentFarm(activeFarm);
          
          if (activeFarm.id) {
            const telRes = await fetch(`${API_BASE_URL}/api/farms/${activeFarm.id}/telemetry`, { headers });
            if (telRes.ok) {
              const telData = await telRes.json();
              setSensors(telData);

              const yieldRes = await fetch(`${API_BASE_URL}/api/predictions/yield`, {
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
              setTelemetryError(null); // Clear errors on success
            } else {
              setTelemetryError(`Failed to fetch sensor data: ${telRes.status} ${telRes.statusText}`);
            }
          }
        } else if (farmsRes.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          setTelemetryError(`Farm fetch error: ${farmsRes.status}`);
        }
      } catch (err: any) {
        setTelemetryError(`Network communication error: ${err.message || 'Server unavailable'}`);
        console.error(err);
      }
    };
    
    fn();
    const interval = setInterval(fn, 5000); // Set up polling for telemetry
    return () => clearInterval(interval);
  }, []);


  return (
    <TubesBackground enableClickInteraction={true}>
      <div className="flex min-h-screen pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/70 backdrop-blur-xl border-r border-white/10 hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-black text-green-400 tracking-tight">Agri<span className="text-white">Mind</span></h1>
          <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">Crop Intelligence</p>
        </div>
        <nav className="px-4 space-y-2 mt-4">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 bg-green-500/20 text-green-400 rounded-xl font-medium">
            <span>Dashboard</span>
          </Link>
          <Link href="/farms" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <span>My Farms</span>
          </Link>
          <Link href="/predictions" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <span>ML Predictions</span>
          </Link>
          <Link href="/pest-detection" className="flex items-center space-x-3 px-4 py-3 text-indigo-400 hover:bg-indigo-500/10 rounded-xl font-medium transition-colors">
            <span>Pest & Disease CV</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <span>Settings</span>
          </Link>
          <div className="pt-6 mt-6 border-t border-white/10">
            <Link href="/pricing" className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold shadow-md hover:from-green-500 hover:to-green-600 transition-colors">
               <span>Upgrade Plan</span>
               <span className="bg-white text-green-700 text-xs px-2 py-0.5 rounded-full">PRO</span>
            </Link>
            <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold transition-colors mt-3">
               <span>Admin Panel</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Farm Overview</h2>
            <p className="text-gray-400 mt-1">Real-time monitoring and AI insights for {currentFarm.name}</p>
          </div>
          <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-green-900/30">
            Generate Report
          </button>
        </header>

        {/* Top Stats Row */}
        {telemetryError && (
          <div className="mb-6 bg-red-950/60 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl backdrop-blur-lg relative">
            <strong className="font-bold">Error Fetching Data: </strong>
            <span className="block sm:inline">{telemetryError}</span>
          </div>
        )}
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
          
          <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">AI Recommendations</h3>
            
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
              <div className="p-4 rounded-xl border border-green-500/30 bg-green-950/40 flex flex-col items-center justify-center text-center mt-6">
                 <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                   <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                 </div>
                 <h4 className="font-semibold text-green-300">Crop Health is Excellent</h4>
                 <p className="text-sm text-green-400/70 mt-1">NDVI analysis shows normal growth patterns.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </TubesBackground>
  );
}
