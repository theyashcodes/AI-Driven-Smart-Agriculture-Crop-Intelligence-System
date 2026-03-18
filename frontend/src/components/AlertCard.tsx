import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function AlertCard({ message, time, type }: any) {
  const isCritical = type === 'critical';
  return (
    <div className={`p-4 rounded-xl border flex items-start space-x-3 mb-3 ${isCritical ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <ExclamationTriangleIcon className={`w-6 h-6 flex-shrink-0 ${isCritical ? 'text-red-500' : 'text-yellow-500'}`} />
      <div>
        <h4 className={`font-semibold ${isCritical ? 'text-red-700' : 'text-yellow-700'}`}>
          {isCritical ? 'Critical Alert' : 'Warning'}
        </h4>
        <p className={`text-sm mt-1 ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>{message}</p>
        <span className="text-xs text-gray-400 mt-2 block">{time}</span>
      </div>
    </div>
  );
}
