"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PaymentModal from "@/components/PaymentModal";

const TubesBackground = dynamic(() => import("@/components/TubesBackground"), { ssr: false });

export default function Pricing() {
  const [currentTier, setCurrentTier] = useState("free");
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Simulated fetch user info to get current tier
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
  }, []);

  const handleUpgradeClick = (tier: string, price: number) => {
    setSelectedPlan({ name: tier, price });
    setShowPaymentModal(true);
  };

  const processUpgrade = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/api/billing/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tier: selectedPlan.name })
      });
      if (res.ok) {
        alert(`Successfully upgraded to ${selectedPlan.name.toUpperCase()} tier!`);
        setCurrentTier(selectedPlan.name);
        setShowPaymentModal(false);
      } else {
        alert("Upgrade failed. Pending Admin Approval.");
      }
    } catch {
      alert("Network Error");
    }
    setLoading(false);
  };

  return (
    <TubesBackground>
      <div className="flex min-h-screen pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
      <main className="flex-1 p-8 max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Upgrade Your Plan</h2>
            <p className="text-gray-400 mt-2 text-lg">Unlock premium satellite imagery and unlimited IoT farms.</p>
          </div>
          <Link href="/" className="bg-gray-900/60 backdrop-blur-lg hover:bg-gray-800/60 text-gray-300 border border-white/10 px-6 py-2.5 rounded-xl font-bold transition-colors">
            Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/10">
            <h3 className="text-2xl font-bold text-white">Free Starter</h3>
            <p className="text-4xl font-black text-green-400 mt-4">₹0 <span className="text-lg text-gray-500 font-medium">/mo</span></p>
            <ul className="mt-8 space-y-4 text-gray-400 font-medium">
              <li>✓ 1 Farm Supported</li>
              <li>✓ Manual Data Entry</li>
              <li>✓ Basic ML Irrigation</li>
            </ul>
            <button className="mt-10 w-full bg-gray-800/60 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-green-600 rounded-3xl p-8 shadow-2xl border-4 border-green-500 transform scale-105">
            <h3 className="text-2xl font-bold text-white">Professional</h3>
            <p className="text-4xl font-black text-white mt-4">₹999 <span className="text-lg text-green-200 font-medium">/mo</span></p>
            <ul className="mt-8 space-y-4 text-green-50 font-medium">
              <li>✓ Up to 5 Farms Supported</li>
              <li>✓ Live IoT MQTT Dashboard</li>
              <li>✓ 7-Day Weather Forecasting</li>
              <li>✓ Pest Detection CV</li>
            </ul>
            <button onClick={() => handleUpgradeClick("pro", 999)} disabled={loading} className="mt-10 w-full bg-white text-green-700 hover:bg-green-50 font-black py-3 rounded-xl transition-colors shadow">
              {loading ? "Processing..." : "Upgrade to Pro"}
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/10">
            <h3 className="text-2xl font-bold text-white">Enterprise</h3>
            <p className="text-4xl font-black text-white mt-4">₹1999 <span className="text-lg text-gray-500 font-medium">/mo</span></p>
            <ul className="mt-8 space-y-4 text-gray-400 font-medium">
              <li>✓ Unlimited Farms</li>
              <li>✓ Live Satellite NDVI Imagery</li>
              <li>✓ SMS/WhatsApp Critical Alerts</li>
              <li>✓ Custom Agronomist Exports</li>
            </ul>
            <button onClick={() => handleUpgradeClick("enterprise", 1999)} disabled={loading} className="mt-10 w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
              {loading ? "Processing..." : "Upgrade to Enterprise"}
            </button>
          </div>
        </div>
      </main>
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          planName={selectedPlan.name}
          amount={selectedPlan.price}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={processUpgrade}
        />
      )}
    </TubesBackground>
  );
}
