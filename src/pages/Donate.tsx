import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Heart } from 'lucide-react';

export function Donate() {
  const { user, appUser } = useAuthStore();
  const [amount, setAmount] = useState<number>(199);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const presetAmounts = [49, 99, 199, 499, 999];

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    if (!finalAmount || finalAmount < 1) return;

    setIsLoading(true);
    
    // Create payment in mock endpoint
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          productId: 'donation',
          productType: 'donation',
          userId: user?.uid || 'anonymous'
        })
      });
      const data = await res.json();
      
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderId,
          paymentId: 'pay_demo_donate',
          status: 'success',
          userId: user?.uid || 'anonymous',
          productId: 'donation',
          productType: 'donation',
          amount: finalAmount
        })
      });
      
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        // Record donation document directly as well for the dashboard
        const donationId = `don_${Date.now()}`;
        await setDoc(doc(db, 'donations', donationId), {
          userId: user?.uid || null,
          name: isAnonymous ? 'Anonymous' : (appUser?.name || 'Supporter'),
          amount: finalAmount,
          message: message,
          isAnonymous: isAnonymous,
          status: 'paid',
          createdAt: new Date().toISOString()
        });

        alert("Thank you so much for your support! ❤️");
        navigate('/');
      }
    } catch (error) {
      console.error("Donation error:", error);
      alert("Something went wrong processing your donation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Heart className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Support Our Mission</h1>
        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
          Your support helps us keep basic educational resources free and allows us to build better tools for students.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <form onSubmit={handleDonate} className="p-8">
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">Select Amount</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-3 px-4 rounded-xl border text-center font-bold text-lg transition-colors ${
                    amount === preset && !customAmount
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Input
                type="number"
                placeholder="Custom Amount (₹)"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount(0);
                }}
                className="text-lg py-3"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Leave a Message (Optional)</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-sm"
                placeholder="I love the content! Keep it up."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                Keep my donation anonymous
              </label>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <Button
              type="submit"
              size="lg"
              className="w-full text-lg shadow-lg hover:shadow-xl transition-all"
              isLoading={isLoading}
            >
              Donate ₹{customAmount || amount}
            </Button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Secure payment processed safely.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
