"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PredictionChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full h-[400px]">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Yield Forecast & Trends</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="time" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend />
          <Line type="monotone" dataKey="yield" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Predicted Yield" />
          <Line type="monotone" dataKey="moisture" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Soil Moisture" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
