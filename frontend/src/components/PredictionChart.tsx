"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PredictionChart({ data }: { data: any[] }) {
  return (
    <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg w-full h-[400px] border border-white/10">
      <h3 className="text-xl font-bold text-white mb-6">Yield Forecast & Trends</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="time" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', backgroundColor: 'rgba(17,24,39,0.9)', color: '#fff' }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Line type="monotone" dataKey="yield" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Predicted Yield" />
          <Line type="monotone" dataKey="moisture" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Soil Moisture" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
