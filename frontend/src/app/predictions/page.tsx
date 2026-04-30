"use client";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import API_BASE_URL from "@/lib/api";

const TubesBackground = dynamic(() => import("@/components/TubesBackground"), { ssr: false });

// Dynamically import InteractiveMap without SSR
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">Loading Map...</div>
});

export default function Predictions() {
  const [region, setRegion] = useState("North");
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (selectedRegion: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/predictions/region-crop`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ region: selectedRegion })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPrediction(data);
      } else if (res.status === 401) {
        window.location.href = "/login";
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (newRegion: string) => {
    setRegion(newRegion);
    handlePredict(newRegion);
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
          <Link href="/predictions" className="flex items-center space-x-3 px-4 py-3 bg-green-500/20 text-green-400 rounded-xl font-medium">
            <span>ML Predictions</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-white">ML Predictions</h2>
          <p className="text-gray-400 mt-1">AI-powered agricultural forecasting</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Region Predictor */}
          <div className="bg-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-sm border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Region-wise Crop Predictor</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Region</label>
                  <select 
                    value={region} 
                    onChange={(e) => setRegion(e.target.value)} 
                    className="w-full border border-white/10 rounded-lg px-4 py-3 bg-gray-800/60 text-white"
                    disabled
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2">Click on the map to set the region and predict.</p>
                </div>
                <button 
                  onClick={() => handlePredict(region)} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
                  disabled={loading}
                >
                  {loading ? "Analyzing Models..." : "Predict Best Crop"}
                </button>
              </div>
            </div>

            {prediction && prediction.categories && (
              <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4">AI Recommendations for {prediction.region} India</h4>
                <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {prediction.categories.map((item: any, idx: number) => (
                    <div key={idx} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">{item.category}</span>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{item.model_performance}</span>
                      </div>
                      <h5 className="text-xl font-bold text-gray-800 mb-1">{item.crop}</h5>
                      <p className="text-sm text-gray-600 font-medium">Expected Yield: <span className="text-gray-800">{item.expected_yield}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Map Area */}
          <div className="bg-gray-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Interactive Map</h3>
            <p className="text-gray-400 text-sm mb-4">Click anywhere on the map to select a region and run predictions instantly.</p>
            <div className="relative w-full h-64 md:h-full min-h-[400px] z-0">
              <InteractiveMap onRegionSelect={handleMapClick} />
            </div>
          </div>

        </div>
      </main>
      </div>
    </TubesBackground>
  );
}
