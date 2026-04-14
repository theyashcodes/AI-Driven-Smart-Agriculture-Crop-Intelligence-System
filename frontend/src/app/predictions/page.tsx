"use client";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

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
      const res = await fetch("http://localhost:8000/api/predictions/region-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: selectedRegion })
      });
      const data = await res.json();
      setPrediction(data);
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
          <Link href="/predictions" className="flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium">
            <span>ML Predictions</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">ML Predictions</h2>
          <p className="text-gray-500 mt-1">AI-powered agricultural forecasting</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Region Predictor */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Region-wise Crop Predictor</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Region</label>
                  <select 
                    value={region} 
                    onChange={(e) => setRegion(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
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

            {prediction && (
              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
                <h4 className="text-lg font-bold text-green-800 mb-4">AI Recommendation</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold text-gray-700">Optimal Crop:</span> <span className="text-green-700 font-bold">{prediction.crop}</span></p>
                  <p><span className="font-semibold text-gray-700">Expected Yield:</span> {prediction.yield}</p>
                  <p><span className="font-semibold text-gray-700">Model Confidence:</span> {(parseFloat(prediction.confidence)*100).toFixed(0)}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Map Area */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Interactive Map</h3>
            <p className="text-gray-500 text-sm mb-4">Click anywhere on the map to select a region and run predictions instantly.</p>
            <div className="relative w-full h-64 md:h-full min-h-[400px] z-0">
              <InteractiveMap onRegionSelect={handleMapClick} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
