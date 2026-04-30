"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import API_BASE_URL from "@/lib/api";

const TubesBackground = dynamic(() => import("@/components/TubesBackground"), { ssr: false });

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        // Redirect to login after successful register
        router.push("/login");
      } else {
        const errData = await res.json();
        setError(errData.detail || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
    }
  };

  return (
    <TubesBackground>
      <div className="min-h-screen flex items-center justify-center p-4 pointer-events-auto">
        <div className="bg-gray-900/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/10">
          <h2 className="text-3xl font-black text-green-400 tracking-tight text-center mb-2">Agri<span className="text-white">Mind</span></h2>
          <p className="text-xs text-gray-500 text-center uppercase font-semibold tracking-widest mb-6">Crop Intelligence Platform</p>
          <h3 className="text-xl font-bold text-white mb-6 text-center">Create an Account</h3>
          
          {error && <div className="bg-red-950/60 text-red-300 p-3 rounded-lg mb-4 text-sm border border-red-500/30">{error}</div>}
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2.5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-800/60 text-white placeholder-gray-500" 
                value={username} onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2.5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-800/60 text-white placeholder-gray-500" 
                value={email} onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2.5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-800/60 text-white placeholder-gray-500" 
                value={password} onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-green-900/30">
              Sign Up
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account? <Link href="/login" className="text-green-400 hover:underline font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </TubesBackground>
  );
}
