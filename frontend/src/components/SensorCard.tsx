export default function SensorCard({ title, value, unit, icon: Icon, alert }: any) {
  return (
    <div className={`p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-transform transform hover:scale-105 ${alert ? 'bg-red-50 border border-red-200' : 'bg-white'}`}>
      <div className={`p-3 rounded-full ${alert ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${alert ? 'text-red-700' : 'text-gray-800'}`}>
          {value} <span className="text-lg text-gray-500 font-normal">{unit}</span>
        </p>
      </div>
    </div>
  );
}
