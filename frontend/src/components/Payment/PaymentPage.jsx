import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const PaymentPage = () => {
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/payment/create-checkout-session`,
        {
          amount,
          userId: null, // Replace with auth user ID
        }
      );

      window.location.href = response.data.url;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-blue-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
          Support CityCare
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Your contribution helps make a difference 💙
        </p>

        {/* Amount Selector */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            Select Amount (USD)
          </h3>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {[5, 10, 25, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`py-2 rounded-lg text-sm font-medium border transition
                  ${amount === amt
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
              >
                ${amt}
              </button>
            ))}
          </div>

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Custom amount"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition
            ${loading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          {loading ? 'Processing…' : `Donate $${amount}`}
        </button>

        {/* Secure Note */}
        <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-1">
          <span>🔒</span>
          Secure payment by Stripe
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
