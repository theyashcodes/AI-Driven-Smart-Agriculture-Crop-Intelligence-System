export default function SensorCard({ title, value, unit, icon: Icon, alert }: any) {
  return (
    <div className={`p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-transform transform hover:scale-105 backdrop-blur-xl border ${alert ? 'bg-red-950/60 border-red-500/30' : 'bg-gray-900/60 border-white/10'}`}>
      <div className={`p-3 rounded-full ${alert ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${alert ? 'text-red-300' : 'text-white'}`}>
          {value} <span className="text-lg text-gray-400 font-normal">{unit}</span>
        </p>
      </div>
    </div>
  );
}
