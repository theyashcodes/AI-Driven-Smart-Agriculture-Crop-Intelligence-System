import React, { useState } from 'react';

interface PaymentModalProps {
  planName: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ planName, amount, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Give a brief moment to show the success checkmark before triggering the callback
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="font-bold text-gray-800">Secure Checkout</h3>
          </div>
          <button onClick={onClose} disabled={loading || success} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-gray-500 font-medium text-sm">Upgrading to {planName.toUpperCase()} Plan</p>
            <p className="text-4xl font-black text-gray-900 mt-1">₹{amount}</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h4 className="text-xl font-bold text-gray-800">Payment Successful!</h4>
              <p className="text-gray-500 mt-1">Activating your new features...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Card Information</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-shadow">
                  <input required type="text" placeholder="Card number (e.g. 4111 1111 1111 1111)" className="w-full px-4 py-3 outline-none border-b border-gray-200" />
                  <div className="flex">
                    <input required type="text" placeholder="MM / YY" className="w-1/2 px-4 py-3 outline-none border-r border-gray-200" />
                    <input required type="text" placeholder="CVC" className="w-1/2 px-4 py-3 outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Cardholder Name</label>
                <input required type="text" placeholder="Name on card" className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow" />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center mt-6 shadow-md disabled:bg-gray-700"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  `Pay ₹${amount}`
                )}
              </button>
            </form>
          )}
        </div>
        
        {/* Footer */}
        {!success && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-center items-center text-xs text-gray-400 font-medium">
            <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
            Payments are secure and encrypted
          </div>
        )}
      </div>
    </div>
  );
}
