"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpTrayIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

const TubesBackground = dynamic(() => import("@/components/TubesBackground"), { ssr: false });

export default function PestDetection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{prediction: string, confidence: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    // Using dummy image logic if backend not responsive, else call API
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/predictions/pest-detect", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        alert("Scan Failed. Make sure you are on PRO tier and logged in.");
      }
    } catch {
      alert("Network Error during inference.");
    }
    setLoading(false);
  };

  return (
    <TubesBackground>
      <div className="flex min-h-screen pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Pest & Disease CV</h2>
            <p className="text-gray-400 mt-2">Upload a leaf photo for instant deep learning analysis.</p>
          </div>
          <Link href="/" className="bg-gray-900/60 backdrop-blur-lg hover:bg-gray-800/60 text-gray-300 border border-white/10 px-6 py-2.5 rounded-xl font-bold transition-colors">
            Back to Dashboard
          </Link>
        </header>

        <div className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/10 flex flex-col items-center">
          
          <div className="w-full max-w-lg mb-8">
            <label className="flex flex-col flex-1 items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-2xl cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
              {!preview ? (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ArrowUpTrayIcon className="w-12 h-12 text-green-600 mb-3" />
                  <p className="mb-2 text-sm text-green-800 font-semibold"><span className="font-bold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-green-600">SVG, PNG, JPG (MAX. 5MB)</p>
                </div>
              ) : (
                <img src={preview} alt="Upload Preview" className="h-full w-full object-cover rounded-2xl opacity-90" />
              )}
              <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          <button 
            disabled={!file || loading}
            onClick={handleScan}
            className={`w-full max-w-lg flex items-center justify-center space-x-2 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-md ${!file ? 'bg-gray-300 cursor-not-allowed' : loading ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 shadow-indigo-100'}`}
          >
            <DocumentMagnifyingGlassIcon className="w-6 h-6" />
            <span>{loading ? "Running Neural Network..." : "Start Health Scan"}</span>
          </button>

          {result && (
            <div className="mt-8 w-full max-w-lg p-6 bg-gray-50 rounded-2xl border border-gray-200 animate-fade-in-up">
              <h4 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-2">Scan Results</h4>
              <p className={`text-xl font-black ${result.prediction.includes("Healthy") ? 'text-green-600' : 'text-red-600'}`}>
                {result.prediction.split('.')[0]}
              </p>
              <p className="text-gray-700 mt-2 font-medium">{result.prediction.split('. Recommendation: ')[1] || "Monitor actively."}</p>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <span className="text-sm font-bold text-gray-400">Confidence</span>
                <span className="text-sm font-bold text-indigo-600">{result.confidence}</span>
              </div>
            </div>
          )}

        </div>
      </main>
      </div>
    </TubesBackground>
  );
}
