import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function AlertCard({ message, time, type }: any) {
  const isCritical = type === 'critical';
  return (
    <div className={`p-4 rounded-xl border flex items-start space-x-3 mb-3 backdrop-blur-lg ${isCritical ? 'bg-red-950/50 border-red-500/30' : 'bg-amber-950/50 border-amber-500/30'}`}>
      <ExclamationTriangleIcon className={`w-6 h-6 flex-shrink-0 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
      <div>
        <h4 className={`font-semibold ${isCritical ? 'text-red-300' : 'text-amber-300'}`}>
          {isCritical ? 'Critical Alert' : 'Warning'}
        </h4>
        <p className={`text-sm mt-1 ${isCritical ? 'text-red-200/80' : 'text-amber-200/80'}`}>{message}</p>
        <span className="text-xs text-gray-500 mt-2 block">{time}</span>
      </div>
    </div>
  );
}
